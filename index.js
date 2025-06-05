// Imports et configurations
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const helmet = require("helmet");
const path = require('path');
const crypto = require("crypto");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const app = express();
const use_acuity_service = require('acuityscheduling');

const domainName = process.env.DOMAIN_NAME;
const port = process.env.PORT;

// En-tête d'authentification pour accéder à l'API Acuity
const AcuityUserId1 = process.env.ACUITY_API_USER1;
const AcuityApiKey1 = process.env.ACUITY_API_KEY1;
const AcuityUserId2 = process.env.ACUITY_API_USER2;
const AcuityApiKey2 = process.env.ACUITY_API_KEY2;

// Init & certificat de sécurité pour Firebase Admin SDK (Accès à la base de données Firestore)
const admin = require("firebase-admin");
const SERVER_KEY = require("./cert/SERVER_account_key.json");

const cheatcodes = require("./cheatcodes.json")
const promotions = require("./promotions.json")
admin.initializeApp({
  credential: admin.credential.cert(SERVER_KEY)
});

const corsOrigin = "*";
app.use(cors({ origin: corsOrigin }));

// Configuration des en-têtes CORS des requêtes
const setCorsHeaders = (r) => {
  r.set('Access-Control-Allow-Origin', corsOrigin);
  r.set('Access-Control-Allow-Methods', 'GET, POST');
  r.set('Access-Control-Allow-Headers', 'Content-Type');
  r.set('Access-Control-Max-Age', '7200'); // 2 heures de cache pour les requêtes preflight
};

// Contenu statique (pour CleverCloud)
app.use(express.static("client/build"));

// Configuration de sécurité (Helmet)
app.use(helmet.noSniff());
app.disable("x-powered-by");
app.use(helmet.ieNoOpen());
app.use(helmet.hsts({ includeSubDomains: true, maxAge: 63072000, preload: true }));

// Configuration du middleware de parsing des requêtes POST (Sauf pour les requêtes Stripe Webhook !)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Conversion API Acuity en Basic
function getBasicAuthHeader(username, apiKey) {
  const credentials = `${username}:${apiKey}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  const authHeader = `Basic ${encodedCredentials}`;

  return { headers: { Authorization: authHeader } };
}

// Fonctions de log pour CleverCloud
const logCall = (req) => { const { method, url } = req; console.log(`[INFO] [${method}] ${url}`); };
const logInfo = (message) => { console.log(`[INFO] ${message}`); };
const logError = (error) => { console.log(`[ERREUR] Une erreur est survenue : ${error}`); };


// Récupérer les code promos (Use)
app.post("/api/verificate/promocode", async (request, response) => {
  logCall(request);
  setCorsHeaders(response);

  try {
    if (promotions.some(obj => obj.code === request.body.promocode)) {

      const infoscode = promotions.find(obj => obj.code === request.body.promocode);

      let data_visio = request.body.tarif_visio
      let data_cabinet = request.body.tarif_cabinet
      if (request.body.tarif_visio.currency == "eur" && !request.body.formation) { data_visio = infoscode.visio_eur }
      if (request.body.tarif_visio.currency == "cad" && !request.body.formation) { data_visio = infoscode.visio_cad }
      if (request.body.tarif_visio.currency == "eur" && request.body.formation) { data_visio = infoscode.visio_eur_formation }
      if (request.body.tarif_visio.currency == "cad" && request.body.formation) { data_visio = infoscode.visio_cad_formation }
      if (request.body.tarif_cabinet.currency == "eur") { data_cabinet = infoscode.cabinet_eur }
      if (request.body.tarif_cabinet.currency == "cad") { data_cabinet = infoscode.cabinet_cad }

      const datas = {
        tarif_visio: data_visio,
        tarif_cabinet: data_cabinet
      }

      return response.status(200).send({ success: true, data: datas});

    } else { return response.status(403).send({ success: false, data: request.body}) }
  } catch { return response.status(400) }

});

// Récupérer les créneaux disponnibles (Use)
app.get("/api/reservations/getAvailability", async (req, res) => {
  logCall(req);
  setCorsHeaders(res);

  try {
    let acuity = use_acuity_service.basic({ userId: AcuityUserId1, apiKey: AcuityApiKey1 });
    if (req.query.acuityAPI == 2) {
      acuity = use_acuity_service.basic({ userId: AcuityUserId2, apiKey: AcuityApiKey2 });
    }

    const ready_payload = {
      method: 'GET',
      qs: {
        date: req.query.date,
        appointmentTypeID: req.query.appointment,
        calendarID: req.query.calendar,
      }
    }

    const appointment = await new Promise((resolve, reject) => {
      acuity.request('/availability/times', ready_payload, function (err, response) {
        if (err) {
          return reject(err);
        }
        else {
          resolve(response)
        }
      });
    });

    return res.status(200).send({ success: true, datas: appointment.body });

  } catch (error) {
    logError(error);
    return res.status(400).send({ success: false, data: [], error });
  }
});

// Infos BDD FireBase
// Stock les infos en BDD FireBase (Use)
app.post("/api/reservations/new", async (request, response) => {
  logCall(request);
  setCorsHeaders(response);

  var { inDevMode } = request.query;

  console.log(`=> POST /reservation/new [RUNNED at ${new Date()}] : Ajout d'une nouvelle réservation en attente de paiement.`);
  response.set('Access-Control-Allow-Origin', corsOrigin);

  const { payload } = request.body; // Récupération de la payload de la requête

  if (payload === "" || payload === undefined) return response.status(400).send({ message: "[FORBIDDEN] Cette requête ne contient pas de charge utile à traiter.", success: false, context: "empty or invalid payload" });

  // Check if paymentIntentId is in the payload
  if (payload.paymentIntentId === "" || payload.paymentIntentId === undefined) return response.status(400).send({ message: "[FORBIDDEN] Cette requête ne contient pas de d'identifiant de paiement.", success: false, context: "empty or invalid paymentIntentId" });

  // Checking if we are in dev mode and exiting
  if (inDevMode) return response.status(200).send({ message: "OK", success: true, context: "inDevMode is activated (submit aborted)", payload, query: request.query });

  // Sending datas to Firebase DB, if success, return status "success" else "failed"
  admin.firestore().collection('reservations_to_pay_sarahnacass').add(payload)
  .then((context) => {
    return response.status(200).send({ success: true, message: "Reservation saved !", context: context });
  })
  .catch((err_context) => {
    logError(err_context);
    return response.status(400).send({ success: false, message: "Error while saving the reservation", context: err_context });
  });
});

// Informations du prospect
/*
async function prospectInformations(prospectData) {
  try {
    const response = await axios.post(
      process.env.MAKE_URL_WEBHOOK_PROSPECT,
      prospectData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) { console.log('Le prospect a bien été créé') }
  } catch (error) {
    console.error("Erreur lors de la création/modification du prospect :", error);
    throw new Error("Erreur lors de la création/modification du prospect");
  }
}

// Route pour créer/modifier un prospect via l'URL
app.post("/api/prospect/new", async (req, res) => {
  try {

    const prospectData = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      phone: req.body.phoneNumber,
      action: req.body.action,
      source: req.body.source ?? null,
      paid: req.body.paid
    };

    const prospect = await prospectInformations(prospectData);

    res.status(200).json({ prospect });
  } catch (error) {
    console.error("Erreur lors de la création/modification du prospect :", error);
    res.status(500).json({ error: "Erreur lors de la création/modification du prospect" });
  }
});
*/

// Vérifier la disponibilité du créneau (Use)
app.post("/api/reservations/check-times", async (req, res) => {
  logCall(req);
  setCorsHeaders(res);

  try {

    let acuity = use_acuity_service.basic({ userId: AcuityUserId1, apiKey: AcuityApiKey1 });
    if (req.body.acuityAPI === 2) {
      acuity = use_acuity_service.basic({ userId: AcuityUserId2, apiKey: AcuityApiKey2 });
    }

    for (const calendarId of Object.values(req.body.calendarId)) {
      const ready_payload = {
        method: 'POST',
        body: {
          datetime: req.body.isoDate,
          appointmentTypeID: req.body.appointmentTypeId,
          calendarID: calendarId,
        }
      };

      const appointment = await new Promise((resolve, reject) => {
        acuity.request('/availability/check-times', ready_payload, function (err, response, appointment) {
          if (err) {
            return reject(err);
          }
          resolve(appointment);
        });
      });

      if (appointment.valid === true) {
        logInfo("Le créneau sélectionné est toujours disponible sur Acuity");
        return res.status(200).send({ success: true });
      }
    }
    
    logError(`Le créneau sélectionné n'est plus disponible sur Acuity`);
    return res.status(400).send({ success: false, message: "Error while checking availability" });

  } catch (error) {
    logError(error);
    return res.status(400).send({ success: false, message: "Error while checking availability", error });
  }
});

// Création d'un rendez-vous non payé
app.post("/api/appointment/automatic/new", async (req, res) => {
  try {

    const data = req.body
    const response = await axios.post(
      process.env.MAKE_URL_WEBHOOK_ACUITY,
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const status = response.data.status;

    res.status(200).json({ status });
    console.log('La création d\'un rendez-vous non payé a bien été initié')

  } catch (error) {
    console.error("Erreur lors de la création d'un rendez-vous non payé :", error);
    res.status(500).json({ error: "Erreur lors de la création d'un rendez-vous non payé" });
  }
});


// Créer l'intention de paiement (Use)
app.post("/api/v2/checkout", async (req, res) => {
  logCall(req);
  setCorsHeaders(res);

  try {
    const typeId = req.body.typeId;
    const email = req.body.identity.email;
    const phone = req.body.identity.phoneNumber;
    const name = req.body.identity.firstName + ' ' + req.body.identity.lastName;
    const type = req.body.type;
    const firstname = req.body.identity.firstName;
    const lastname = req.body.identity.lastName;
    const date = req.body.date;
    const adresse = req.body.adresse;
    const city = req.body.city;
    const tarif = req.body.price

    const customer = await stripe.customers.create({
      email: email,  // Définir l'adresse e-mail du client
      name: name,  // Définir le nom du client
      phone: phone, // Définir le numéro de tel du client
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: tarif.value,
      currency: tarif ? tarif.currency : "eur",
      description: firstname + ' ' + lastname + ' - Rendez-vous Séance initiale n°sarahnacass - ' + type + ' à ' + city + ' - Séance le ' + date + ' (rdv.sarahnacass.com)',
      // description: public_reservations_datas.name,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        'Adresse mail du client': email,
        'Numéro de téléphone du client': phone,
        'Prénom du client': firstname,
        'Nom du client': lastname,
        'Type de rendez-vous': type,
        'Lieu du rendez-vous': adresse,
        'Date du rendez-vous': date
      },
      customer: customer.id,  // Utiliser l'ID du client créé
    });
    return res.status(200).send({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    logError(error);
    return res.status(400).send({ success: false, message: "Error while creating payment intent", error });
  }
});

// Récupérer la clé Stripe (Use)
app.get("/api/stripe/getPublicKey", async (req, res) => {

  logCall(req);
  setCorsHeaders(res);

  res.status(200).send({
    success: true,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

// Créer le rendez-vous (Use)
const createNewAppointmentInAcuity = async (appointment, payment_intent_id) => {

  try {

    const { identity, acuityAPI } = appointment;
  
    let isNewAcuityAccount = false;
    let acuity = use_acuity_service.basic({ userId: AcuityUserId1, apiKey: AcuityApiKey1 });
    if (acuityAPI === 2) {
      acuity = use_acuity_service.basic({ userId: AcuityUserId2, apiKey: AcuityApiKey2 });
      isNewAcuityAccount = true;
    }
    if ('code' in appointment) {
      acuity = use_acuity_service.basic({ userId: appointment.userId, apiKey: appointment.key });
      if (acuityAPI === 2) {
        acuity = use_acuity_service.basic({ userId: appointment.userId2, apiKey: appointment.key2 });
        isNewAcuityAccount = true;
      }
    }
  
    for (const calendarId of Object.values(appointment.calendarId)) {
      const ready_payload = {
        method: 'POST',
        body: {
          datetime: appointment.isoDate,
          appointmentTypeID: appointment.appointmentTypeIdPaid,
          calendarID: calendarId,
          firstName: identity.firstName,
          lastName: identity.lastName,
          email: identity.email,
          phone: identity.phoneNumber,
          fields: [
            {
              id: !isNewAcuityAccount ? 11257844 : 13650731, // Motif
              value: `${appointment.motif === null ? "Aucun motif renseigné" : appointment.motif}`,
            },
            {
              id: !isNewAcuityAccount ? 12571072 : 13650718, // Transaction
              value: `Transaction numéro \"${payment_intent_id}\". Montant réglé depuis le site rdv.sarahnacass.com`,
            },
            {
              id: !isNewAcuityAccount ? 14260652 : 14291660, // Adresse
              value: `${appointment.acuityAddress}`,
            },
          ],
        }
      };
  
      // Format date (Résidentiel)
      if (appointment.weeks.active) {
        const dateStart = new Date(appointment.weeks.start);
        const jourStart = String(dateStart.getDate()).padStart(2, '0');
        const moisStart = String(dateStart.getMonth() + 1).padStart(2, '0');
        const anneeStart = dateStart.getFullYear();
        const dateStartFormat = `${jourStart}/${moisStart}/${anneeStart}`;

        // Ajouter le champ à la requête
        ready_payload.body.fields.push({
          id: !isNewAcuityAccount ? 15509939 : 15509953, // Date démarrage, nombre semaine(s) et lieu (Résidentiel)
          value: `Séance de ${appointment.weeks.number} à partir du ${dateStartFormat} à ${appointment.city}`,
        });
      }
  
      const appointment_result = await new Promise((resolve, reject) => {
        acuity.request('/appointments', ready_payload, function (err, response, appointment) {
          if (err) {
            return reject(err);
          }
          resolve(appointment);
        });
      });

      if (appointment_result.id) {
        logInfo("Un nouveau rendez-vous a été créé sur Acuity");
        return appointment_result.id;
      }
    }
      
    logError(`Impossible de créer le rendez-vous sur Acuity`);

  } catch (error) {
    logError(error);
    throw error;
  }
};

// Récupérer l'id de la collection   (Use)
const getReservationId = async (paymentIntentId) => {
  try {
    const querySnapshot = await admin.firestore().collection('reservations_to_pay_sarahnacass').where('paymentIntentId', '==', paymentIntentId).get();

    if (querySnapshot.empty) {
      throw "Aucune réservation n'a été trouvée pour cet identifiant de paiement.";
    }

    const document = querySnapshot.docs[0];
    const reservationId = document.id;

    logInfo("L'ID de la réservation FireBase a été récupéré avec succès.");
    return reservationId;
  } catch (error) {
    logError(error);
    throw "Une erreur s'est produite lors de la récupération de l'ID de réservation FireBase.";
  }
};

// Déplacer le rendez-vous vers la collection finishedReservations (Use)
const moveToFinished = async (reservation_id, informations) => {
  try {

    if (!reservation_id) {
      throw "L'ID de réservation FireBase est manquant.";
    }

    const reservationRef = admin.firestore().collection("reservations_to_pay_sarahnacass").doc(reservation_id);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      throw "La réservation FireBase n'a pas été trouvée.";
    }

    const reservationData = reservationDoc.data();

    const updatedReservationData = {
      ...reservationData,
      ...informations,
      appointmentID: null,
    };

    // Ajouter la réservation à la collection "finishedReservations_sarahnacass"
    await admin.firestore().collection("finishedReservations_sarahnacass").doc(reservation_id).set(updatedReservationData);

    // Supprimer la réservation de la collection "reservations_to_pay_sarahnacass"
    await reservationRef.delete();


    logInfo("La réservation FireBase a été déplacée avec succès.");
  } catch (error) {
    logError(error);
    throw "Une erreur s'est produite lors du déplacement de la réservation FireBase.";
  }
};


// Si le consutation à été réglée par le patient, rdv.instititadios.com le notifiera ici
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (error) {
    logError(error);
    return response.status(400).send({ success: false, message: "La signature de la requête pour l'événement Stripe n'est pas valide.", error });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const payment_intent_id = event.data.object.id;


      try {
        const doc = await admin.firestore().collection('reservations_to_pay_sarahnacass').where('paymentIntentId', '==', payment_intent_id).get();

        if (doc.empty) throw "Aucune réservation n'a été trouvée pour cette session.";
        const document = doc.docs[0];
        const data = document.data();
        const prospectData = {
          "first_name": data.identity.firstName,
          "last_name": data.identity.lastName,
          "phone": data.identity.phoneNumber,
          "email": data.identity.email,
          "action": "Rendez-vous 1er SIA payé",
          "paid": true,
          "gclid": data.gclid ?? null,
          "tarif": data.tarif ?? null,
          "type": data.type,
          "source": data.source ?? null,
        };

        const appointmentID = await createNewAppointmentInAcuity(data, payment_intent_id)
        const informations = {
          "appointmentID": appointmentID,
          "paid": true,
        } // ID du prospect
        const reservation = await getReservationId(payment_intent_id);
        await moveToFinished(reservation, informations);

      } catch (error) {
        logError(error);

        return response.status(200).send({ success: false }); 
      }

      break;
    }
  }

  response.status(200).send({ received: true });
});

// Vérifier la validité du code (Use)
app.post("/api/code/check", async (req, res) => {
  logCall(req);
  setCorsHeaders(res);

  try {

    if (cheatcodes.some(obj => obj.code === req.body.cheatCodeValue)) {

      const infoscode = cheatcodes.find(obj => obj.code === req.body.cheatCodeValue);

      const infosAcuity = {
        ...req.body,
        ...infoscode
      }

      // Payé
      const appointmentID = await createNewAppointmentInAcuity(infosAcuity, 'Non concerné (' + infoscode.name + ')')

      const informations = {
        ...req.body,
        "appointmentID": appointmentID,
        "paid": true,
        "code_praticien": infoscode.name,
      } // ID du prospect

      admin.firestore().collection('finishedReservations_sarahnacass').add(informations)
      .then(() => {})
      .catch((err_context) => {
        logError(err_context);
        return res.status(400).send({ success: false, message: "Error while saving the reservation", context: err_context });
      });

      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false, message: "Error while checking code" });
    }

  } catch (error) {
    logError(error);
    return res.status(400).send({ success: false, message: "Error while checking code", error });
  }
});

// Si le consutation à été réglée par le patient, rdv.instititadios.com le notifiera ici
app.post('/api/residentiel/checkout', express.raw({ type: 'application/json' }), async (req, res) => {

  try {
    
    const infosAcuity = {
      ...req.body
    }

    // Payé
    const appointmentID = await createNewAppointmentInAcuity(infosAcuity, 'Non concerné (Résidentiel)')


    const informations = {
      ...req.body,
      "appointmentID": appointmentID,
      "paid": true,
    } // ID du prospect

    admin.firestore().collection('finishedReservations_sarahnacass').add(informations)
    .then(() => {})
    .catch((err_context) => {
      logError(err_context);
      return res.status(400).send({ success: false, message: "Error while saving the reservation", context: err_context });
    });

    return res.status(200).send({ success: true })
  } catch (error) {
    logError(error);
    return res.status(400).send({ success: false, message: "Error while reservation résidentiel", error });
  }
});


app.get('*', (req, res) => {
  logCall(req);
  return res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

app.listen(port, () => {
  console.log(`[APP] [INFO] [SUCCESS] : L'application s'est lancée avec succès sur le port [${port}] avec le nom de domaine: ${domainName}]`);
});
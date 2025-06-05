import axios from "axios";
// import { getUrlParameter } from "../../pages/models/FUNCTIONS_DISPATCHER";
import * as Yup from 'yup';

const isProductionEnv = process.env.NODE_ENV === 'production' ? true : false;

const validationSchema = Yup.object({
    lastName: Yup.string().required("Veuillez renseigner votre nom")
        .min(2, "Votre nom doit comporter au moins 2 caractères")
        .max(50, "Votre nom ne doit pas dépasser 50 caractères"),
    firstName: Yup.string().required("Veuillez renseigner votre prénom")
        .min(2, "Votre prénom doit comporter au moins 2 caractères")
        .max(50, "Votre prénom ne doit pas dépasser 50 caractères"),
    email: Yup.string().required("Veuillez entrer votre adresse email")
        .email("Veuillez entrer une adresse email valide"),
    phoneNumber: Yup.string().required("Veuillez entrer votre numéro de téléphone")
        .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
        .max(10, "Le numéro de téléphone ne doit pas dépasser 10 chiffres")
        .matches(/^[0-9]+$/, "Le numéro de téléphone ne doit contenir que des chiffres"),
});

const sendDatasOperation = async (_D, _SF) => {
    try {
        // Loading message
        _SF({ current: "pending", message: "Un instant, nous enregistrons votre réservation..." });

        let client_secret;
        let payment_intent_id;
        let appointment_type;
        let firebaseId;

        // Formater la date
        let date = new Date(_D.isoDate);
        const jour = date.getDate().toString().padStart(2, '0');
        const mois = (date.getMonth() + 1).toString().padStart(2, '0');
        const annee = date.getFullYear();
        const heure = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        date = `${jour}/${mois}/${annee} à ${heure}:${minutes}`;

        // On crée le prospect
        /*
        try {
          if (isProductionEnv) {
            // Récupérer l'url API
            const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_PROSPECT : process.env.REACT_APP_DEV_POST_PROSPECT;
  
            // Action initiale du prospect
            let action = "Rendez-vous 1er SIA en attente de paiement\nLieu : " + _D.type + "\nDate de la séance : " + date + "\nMotif : " + _D.motif
            if (!_D.typeId) { 
                action = "Rendez-vous 1er SIA en attente de paiement\nLieu : " + _D.type + "\nAdresse : " + _D.address + "\nDate de la séance : " + date + "\nMotif : " + _D.motif
            } if (_D.type === "Résidentiel") { 
                action = "Rendez-vous mise en place administrative préalable au résidentiel\nLieu : " + _D.type + "\nAdresse : " + _D.address + "\nDate de la séance : " + date + "\nMotif : " + _D.motif
            }
  
            // Variables envoyées
            await axios.post(endpoint, {
                "firstName": _D.identity.firstName,
                "lastName": _D.identity.lastName,
                "phoneNumber": _D.identity.phoneNumber,
                "email": _D.identity.email,
                "action": action,
                "source": localStorage.getItem('source') ?? null,
                "paid": false
            }); 
          }
        } catch (error) {
            throw 'Un problème est survenu. Veuillez réessayer ou contacter le support.';
        }
        */

        // On vérifie la disponnibilité du rendez-vous
        try {
            // Récupérer l'url API
            const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_CHECK_TIMES : process.env.REACT_APP_DEV_POST_CHECK_TIMES;

            // Variables envoyées
            await axios.post(endpoint, {
                "typeId": _D.typeId,
                "isoDate": _D.isoDate,
                "appointmentTypeId": _D.appointmentTypeIdPaid, 
                "calendarId": _D.calendarId, 
                "acuityAPI": _D.acuityAPI,
            }); 

        } catch (error) {
            throw 'Un problème est survenu. Le créneau sélectionné est déjà en cours de réservation. Veuillez réessayer ou contacter le support.';
        }

        // Vérification du CheatCode
        try {
            if (_D.cheatCodeValue) {

                // Loading message
                _SF({ current: "pending", message: "Vérification du code secrétaire" });

                // Récupérer l'url API
                const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_CHEATCODE : process.env.REACT_APP_DEV_POST_CHEATCODE;

                // Variables envoyées
                const intent = await axios.post(endpoint, {
                    ..._D,
                    "gclid": localStorage.getItem('gclid') ?? null,
                    "source": localStorage.getItem('source') ?? null,
                }); 

                if (intent.data.success) {

                    // Redirection page success
                    _SF({ current: "pending", message: "Code vérifié, nous enregistrons votre réservation..." });
                    return window.open(`${window.location.origin}/checkout/success`, '_self', 'noopener, noreferrer');
                }
            }
        } catch (error) {
            _SF({ current: "pending", message: "Un problème est survenu lors de l\'enregistrement de votre réservation. Veuillez réessayer ou contacter le support." });
        }

        // RDV Résidentiel
        try {
            if (_D.type === "Résidentiel") {

                // Loading message
                _SF({ current: "pending", message: "Un instant, nous enregistrons votre réservation..." });

                // Récupérer l'url API
                const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_START_CHECKOUT_RESIDENTIEL : process.env.REACT_APP_DEV_POST_START_CHECKOUT_RESIDENTIEL;

                // Variables envoyées
                const intent = await axios.post(endpoint, {
                    ..._D,
                    "gclid": localStorage.getItem('gclid') ?? null,
                    "source": localStorage.getItem('source') ?? null,
                }); 

                if (intent.data.success) {

                    // Saving in local storage for future usages
                    const last_booking_operation = {
                        informations: { ..._D },
                        "source": localStorage.getItem('source') ?? null,
                    };
    
                    localStorage.setItem("last_booking_operation", JSON.stringify(last_booking_operation));

                    // Redirection page success
                    return window.open(`${window.location.origin}/checkout/residentiel/success`, '_self', 'noopener, noreferrer');
                }
            }
        } catch (error) {
            _SF({ current: "pending", message: "Un problème est survenu lors de l\'enregistrement de votre réservation. Veuillez réessayer ou contacter le support." });
        }

        // On créer une intention de paiement
        try {
            // Récupérer l'url API
            const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_START_CHECKOUT_SESSION : process.env.REACT_APP_DEV_POST_START_CHECKOUT_SESSION;

            // Variables envoyées
            const intent = await axios.post(endpoint, {
                "price": _D.tarif,
                "typeId": _D.typeId,
                "identity": _D.identity,
                "type": _D.type,
                "date": date,
                "adresse": _D.address,
                "city": _D.city
            }); 
    
            // On récupère le client Stripe
            const { clientSecret, paymentIntentId } = intent.data;
            client_secret = clientSecret;
            payment_intent_id = paymentIntentId;

        } catch (error) {
            throw 'Un problème est survenu avec le service de paiement. Veuillez réessayer ou contacter le support.';
        }

        // On prends automatiquement rendez-vous dans un certain délai
        try {
            if (isProductionEnv) {
                // Récupérer l'url API
                const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_AUTOMATIC_APPOINTMENT : process.env.REACT_APP_DEV_POST_AUTOMATIC_APPOINTMENT;

                // Variables envoyées
                await axios.post(endpoint, {
                    "paymentIntentId": payment_intent_id,
                    "data": _D,
                }); 
            }
        } catch (error) {
            throw 'Un problème est survenu. Veuillez réessayer ou contacter le support.';
        }

        // On associe l'intention de paiement au rendez-vous dans la base de données
        try {
            // Récupérer l'url API
            const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_RESERVATION_NEW : process.env.REACT_APP_DEV_POST_RESERVATION_NEW;

            // Variables envoyées
            const intent = await axios.post(endpoint, {
                payload: {
                    ..._D,
                    "paymentIntentId": payment_intent_id,
                    "gclid": localStorage.getItem('gclid') ?? null,
                    "source": localStorage.getItem('source') ?? null,
                },
            });

            // On récupère l'id de la base de données
            appointment_type = _D.typeId === 0 ? "clinic" : "video";
            firebaseId = intent.data;

        } catch (error) {
            throw 'Un problème est survenu lors de l\'enregistrement de votre réservation. Veuillez réessayer ou contacter le support.';
        }

        _SF({ current: "pending", message: "En attente de la validation du paiement..." });

        const redirection_checkout_url = `${window.location.origin}/checkout?fallback=default&intent=${ client_secret }&appointmentTypeSelected=${ appointment_type }&isFromReservationPage=true&id=${ _D.idLocation }`;

        try {
            // Saving in local storage for future usages
            const last_booking_operation = {
                informations: { ..._D },
                pub_credentials: {
                    "client_secret": client_secret,
                    "payment_intent_id": payment_intent_id,
                },
                "source": localStorage.getItem('source') ?? null,
                redirection_checkout_url,
            };
    
            localStorage.setItem("last_booking_operation", JSON.stringify(last_booking_operation));

        } catch (error) {
            console.warn("Impossible de sauvegarder les informations dans le stockage local.");
        }

        // Redirection vers la page de paiement dans le meme onglet
        window.open(redirection_checkout_url, '_self', 'noopener, noreferrer');

    } catch (error) {
        _SF({ current: "error", message: error });
    }
};

export { sendDatasOperation, validationSchema };


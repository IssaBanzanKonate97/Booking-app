import "./rdv_update.scss";
import moment from 'moment-timezone';
import 'moment/locale/fr';

import Cookies from 'js-cookie';

import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useState, useRef } from "react";
import ActionsContainer from "./ActionsContainer";
// import HoursSlotsMapper from "./HoursSlotsMapper";

import axios from "axios";
import { CheckCircle, ChevronLeft, ChevronRight, Circle, MapPin, Users, Video, X, Globe } from "react-feather";
import { GrHomeRounded } from "react-icons/gr";

// Tarifs en viso
import { visio_tarifs } from "../../pages/shared_locations_datas/VISIO_DATAS";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { PrimaryButton } from "../../atomic/Button";
import FormInput from "./FormInput";
import { sendDatasOperation, validationSchema } from "./functions";
import HoursSlotsMapperUpdated from "./HoursSlotsMapperUpdated";
import WeekMapper from "./WeekMapper";

/* Import Mixpannel tracking API */
// MIXPANEL IS TEMP REMOVED !
// import mixpanel from 'mixpanel-browser';

const isProductionEnv = process.env.NODE_ENV === "production" ? true : false;

export default forwardRef(function RdvUpdate(props, ref) {
  /* === Initialisation des states (pour la prise de rdv + Geo Tracking) === */
  const { selectedAddress, showCloseIconAutorization, weekEndAvailability, toogleLocationsModal, cheatCode, cheatCodeValue } = props; // On récupère les props envoyées par le parent
  const [days, setDays] = useState(0);
  const daysShiftLimit = [10, 2]; // Limite prise de RDV (10 jours pour cabinet, 2 jours en visio / résidentiel)
  const [hval, setHval] = useState(null);
  const [activeConfirmation, setActiveConfirmation] = useState(true);
  const [tableau, setTableau] = useState([]);
  const [selectedDay, setSelectedDay] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [displayStage, setDisplayStage] = useState(0);  // WeekMapper

  const today = new Date();
  const year = today.getFullYear();
  const mouth = today.getMonth();
  const [loading, setLoading] = useState(false);
  
  // Fuseau
  const [selectedZone, setSelectedZone] = useState("UTC");
  useEffect(() => { setSelectedZone(moment.tz.guess()) }, []);

  /* === HOOKS : === USE IMPERATIVE HANDLE FOR {MOBILE} TOOGLE EVENT ! ===================================================================================================== */ //
  useImperativeHandle(ref, () => ({
    toogleAutoScopeRef (action) {
      return toogleAutoScope(action)
    }
  }), []);

  const [geoTrackInfos, setGeoTrackInfos] = useState(null); // USED FOR FIREBASE AND ACUITY
  /* === Initialisation : React Hook Form (Vérification des données lors des changements) === */
  const { control, handleSubmit, formState: { isSubmitting, isValid }, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  let tarif_visio, appointmentTypeIdPaid_visio, appointmentTypeIdNotPaid_visio, acuityAddress_visio, idLocation_visio, calendarId_visio, acuityAPI_visio
  visio_tarifs.forEach(objet => {
    if (window.location.pathname.includes(objet.path) && objet.formation === (props.visioFormation ?? false)) {
      tarif_visio = objet.tarif
      appointmentTypeIdPaid_visio = objet.appointmentTypeIdPaid
      appointmentTypeIdNotPaid_visio = objet.appointmentTypeIdNotPaid;
      acuityAddress_visio = objet.acuityAddress;
      idLocation_visio = objet.idLocation;
      calendarId_visio = objet.calendarId;
      acuityAPI_visio = objet.acuityAPI
    }
  })
  
  const [tarifsVisioCabinet, setTarifsVisioCabinet] = useState ({
    "tarif_visio": tarif_visio,
    "tarif_cabinet": props.tarif
  })

  useEffect(() => {
    const getPromoCode = async () => {
      try {
        // Récupérer l'url API
        const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_PROMO_CODE : process.env.REACT_APP_DEV_POST_PROMO_CODE;
        // Variables envoyées
        const promoResult = await axios.post(endpoint, {
          promocode: Cookies.get('promotion'),
          formation: props.visioFormation ?? false,
          tarif_visio: tarifsVisioCabinet.tarif_visio,
          tarif_cabinet: tarifsVisioCabinet.tarif_cabinet,
        });

        setTarifsVisioCabinet(promoResult.data.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du code promo :", error);
      }
    };

    if (Cookies.get('promotion')) { getPromoCode(); }
  }, []);

  /* === Données App : Types de rendez vous + sélection === */
  const appointmentTypes = [
    {
      id: 1, 
      type: "Accompagnement vidéo - 2h", 
      icon: <Video size={16} />,
      stringCostValue: (
        (JSON.stringify(tarif_visio) === JSON.stringify(tarifsVisioCabinet.tarif_visio)) ? 
        ((tarifsVisioCabinet.tarif_visio.value / 100).toFixed(2).replace('.', ',') + " " + tarifsVisioCabinet.tarif_visio.symbol) :
        (<span>
          <span style={{textDecoration: 'line-through', paddingRight:'8px'}}> 
            {(tarif_visio.value / 100).toFixed(2).replace('.', ',') + " " + tarif_visio.symbol}
          </span> 
          {(tarifsVisioCabinet.tarif_visio.value / 100).toFixed(2).replace('.', ',') + " " + tarifsVisioCabinet.tarif_visio.symbol} 
        </span>)
      ),
      available: 1
    },
    {
      id: 0, 
      type: "Au cabinet - 3h", 
      icon: <Users size={16} />, 
      stringCostValue: (
        (JSON.stringify(props.tarif) === JSON.stringify(tarifsVisioCabinet.tarif_cabinet)) ? 
        ((tarifsVisioCabinet.tarif_cabinet.value / 100).toFixed(2).replace('.', ',') + " " + tarifsVisioCabinet.tarif_cabinet.symbol) :
        (<span>
          <span style={{textDecoration: 'line-through', paddingRight:'8px'}}> 
            {(props.tarif.value / 100).toFixed(2).replace('.', ',') + " " + props.tarif.symbol}
          </span> 
          {(tarifsVisioCabinet.tarif_cabinet.value / 100).toFixed(2).replace('.', ',') + " " + tarifsVisioCabinet.tarif_cabinet.symbol} 
        </span>)
      ),
      available: props.available
    }
  ];
  const appointmentTypesResidentiel = [
    {id: 0, type: "Mise en place administrative préalable au résidentiel", icon: <GrHomeRounded size={16} />, stringCostValue: "", available: 1}
  ];
  const appointmentTypesVisio = [
    {
      id: 1, 
      type: "Accompagnement vidéo - 2h", 
      icon: <Video size={16} />,
      stringCostValue: (
        (JSON.stringify(tarif_visio) === JSON.stringify(tarifsVisioCabinet.tarif_visio)) ? 
        ((tarifsVisioCabinet.tarif_visio.value / 100).toFixed(2).replace('.', ',') + " " + tarifsVisioCabinet.tarif_visio.symbol) :
        (<span>
          <span style={{textDecoration: 'line-through', paddingRight:'8px'}}> 
            {(tarif_visio.value / 100).toFixed(2).replace('.', ',') + " " + tarif_visio.symbol}
          </span> 
          {(tarifsVisioCabinet.tarif_visio.value / 100).toFixed(2).replace('.', ',') + " " + tarifsVisioCabinet.tarif_visio.symbol} 
        </span>)
      ),
      available: 1
    },
  ];
  const [amountOnCkeckout, setAmountOnCkeckout] = useState("0,00 €");
  const [sendDatasStatus, setSendDatasStatus] = useState({ current: "null", message: "En attente de validation..." }); // Ne pas convertir en booléen car on veut le status "pending"
  const [appointmentChoosed, setAppointmentChoosed] = useState(null);
  

  const onSubmit = async (datas) => {
    reset(); // Reset le formulaire

    const { lastName, firstName, email, phoneNumber } = datas;

    const payload = {
      identity: {
        firstName, 
        lastName, 
        email, 
        phoneNumber
      },
      weeks: {
        active: props.residentiel ?? false,
        number: selectedWeek ?? null,
        start: selectedDay[0] ?? null
      },
      geoTrackInfos,
      typeId: appointmentChoosed,
      appointmentTypeIdPaid: appointmentChoosed === 0 ? props.appointmentTypeIdPaid : appointmentTypeIdPaid_visio,
      calendarId: appointmentChoosed === 0 ? props.calendarId : calendarId_visio,
      acuityAPI: appointmentChoosed === 0 ? props.acuityAPI : acuityAPI_visio,
      tarif: appointmentChoosed === 0 ? tarifsVisioCabinet.tarif_cabinet : tarifsVisioCabinet.tarif_visio,
      appointmentTypeIdNotPaid: appointmentChoosed === 0 ? props.appointmentTypeIdNotPaid : appointmentTypeIdNotPaid_visio,
      idLocation: appointmentChoosed === 0 ? props.idLocation : idLocation_visio,
      city: appointmentChoosed === 0 ? props.city : "distance",
      visioFormation: props.visioFormation ?? false,
      address: appointmentChoosed === 0 ? selectedAddress : "Aucune adresse selectionnée (Accompagnement vidéo)",
      type: 
        props.residentiel === true ? "Résidentiel" : 
        props.visioFormation === true ? "Accompagnement vidéo avec un praticien en cours de formation" :
        appointmentChoosed === 0 ? "Au cabinet" : "Accompagnement vidéo avec un praticien expérimenté",
      motif: "N/A",
      isoDate: hval,
      acuityAddress: appointmentChoosed === 0 ? props.acuityAddress : acuityAddress_visio,
      cheatCodeValue: cheatCodeValue,
      clientSavedAtTime: new Date(),
    };

    // Send informations trough an external function
    sendDatasOperation(payload, setSendDatasStatus);
  };

  useEffect(() => {
    if (appointmentChoosed !== null) {
      setAmountOnCkeckout(appointmentTypes.find(type => type.id === appointmentChoosed).stringCostValue);
    };
  }, [appointmentChoosed]);

  /* === Données App : Plages horaires possibles + Jours (sélectionnées) + Api Loader Statement === */
  const [selectedTimeStr, setSelectedTimeStr] = useState(null);
  const [showMoreHours, setShowMoreHours] = useState(false); // State non utilisée (DIV invisible)

  /* ======================================================== */

  /* === Hooks d'effets : ComponentDidMount equivalent === */
  const [componentIsReady, setComponentIsReady] = useState(false);
  useEffect(() => {
    setComponentIsReady(true);
  },[componentIsReady]);

  /* Hook d'effet : Obtention des informations de géolocalisation du client
  => Ces informations peuvent être fausses si l'utilisateur utilise un VPN */
  useEffect(() => {
    axios.get('https://geolocation-db.com/json/')
    .then((response) => {
      if (response.config.url.includes("https")){
        return setGeoTrackInfos({
          ip : response.data.IPv4,
          country_code : response.data.country_code,
          country_name : response.data.country_name,
          state: response.data.state,
          user_agent: navigator.userAgent,
          position : {
            longitude : response.data.longitude,
            latitude : response.data.latitude
          }
        });
      } else return null;
    })
    .catch(() => { return null; })
  },[])

  /**
   * Crée ou Modifie le tableau à chaque modification des jours
   * @author Stéphane Gledic
   */
  useEffect(() => {
    generateDay();
  }, [days, selectedZone])

  /* === Fonctions du composant : Auto Scope + Gestion des dates === */
  function toogleAutoScope(action){
    /* Ajout ou supprimer un effet effet de sombre sur la page */
    var scopeId = document.getElementById("autoScopeId");
    if (action === "run"){
      return scopeId.classList.add('reservationFocused');
    } else {
      scopeId.classList.add('reservationUnfocused')
      return setTimeout(() => {
        scopeId.classList.remove('reservationUnfocused')
        scopeId.classList.remove('reservationFocused')
      }, 290);
    }
  }

  const addDays = () => {
    setDays(days + 4);
  };

  const removeDays = () => {
    let daysToRemove = 0;
    if (props.residentiel == true || props.visio == true || appointmentChoosed === 1) {
      for (let removeDay = 1; removeDay < 5 && (days - removeDay) >= (daysShiftLimit[1]); removeDay++) { daysToRemove++ }
    } else {
      for (let removeDay = 1; removeDay < 5 && (days - removeDay) >= (daysShiftLimit[0]); removeDay++) { daysToRemove++ }
    }
    setDays(days - daysToRemove);
  };

  /**
   * Vérification si un jour est disponible.
   * @author Stéphane Gledic
   * @returns un boolean si le jour est disponible.
   */
  const getAvailabilityFromServer = async (appointmentChoosed, appointmentTypeIdPaid, calendarIds, date, acuityAPI) => {
    const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_GET_RESERVATIONS_AVAILABILITY : process.env.REACT_APP_DEV_GET_RESERVATIONS_AVAILABILITY;

    let allSchedules = [];

    for (const key in calendarIds) {
        if (calendarIds.hasOwnProperty(key)) {
            const calendarId = calendarIds[key];
            try {
              const response = await axios.get(`${endpoint}?choosed=${appointmentChoosed}&appointment=${appointmentTypeIdPaid}&calendar=${calendarId}&date=${date}&acuityAPI=${acuityAPI}`);
              if (response.data.success && response.data.datas.length > 0) {
                  allSchedules = allSchedules.concat(response.data.datas);
              }
            } catch {}
        }
    }

    // Filtrage des créneaux disponibles
    const availableSlots = allSchedules.filter(schedule => schedule.slotsAvailable > 0);

    if (availableSlots.length === 0) {
        return { success: false, data: null };
    }

    // Suppression des doublons
    const uniqueSlots = Array.from(new Set(availableSlots.map(slot => JSON.stringify(slot)))).map(slot => JSON.parse(slot));

    return { success: true, data: uniqueSlots };
  };

  function getStringDate(inVal){
    return new Date(inVal).toLocaleDateString("fr-FR", {weekday: "short", month: "short", day: "numeric"});
  }

  /**
   * Ajouts des jours disponibles d'un un tableau.
   * @author Stéphane Gledic
   */
  const generateDay = async () => {
    // Ne pas set le tableau directement dans la boucle sinon problème
    let updatedTableau = [];
  
    if (appointmentChoosed === 0 || appointmentChoosed === 1) {
      let i = 0;
      setLoading(true); // Activez le chargement
  
      while (updatedTableau.length < 4) {
        let day = today.getDate() + i + days;

        const otherday = new Date(year, mouth, day)
        if (props.residentiel && selectedDay[0] && new Date(year, mouth, day + 3) > selectedDay[0]) {
          break;
        }

        const check = await getAvailabilityFromServer(
          appointmentChoosed, 
          appointmentChoosed === 0 ? props.appointmentTypeIdPaid : appointmentTypeIdPaid_visio,
          appointmentChoosed === 0 ? props.calendarId : calendarId_visio,
          otherday.toISOString(),
          appointmentChoosed === 0 ? props.acuityAPI : acuityAPI_visio,
        );
  
        check.success && updatedTableau.push(otherday.toISOString());
  
        i++;
      }

      setTableau(updatedTableau);
      setTimeout(() => {
        setLoading(false); 
    }, 1000); // Désactivez le chargement lorsque la boucle est terminée après 1 seconde d'attente
    }
  };
  
  function requireAutoScroll(id, moveOn){
    const run = setTimeout(() => {
      const element = document.getElementById(id);
      element.scrollIntoView({ behavior: "smooth", block: moveOn });
      clearTimeout(run);
    }, 210);
  }
  /* ======================================================== */

  const appointmentOptions = props.residentiel
  ? appointmentTypesResidentiel
  : props.visio
  ? appointmentTypesVisio
  : appointmentTypes;

  // Sélection du fuseau
  function TimezoneSelector({ selectedZone, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef();
    const inputRef = useRef();

    const allZones = moment.tz.names().sort();
    const filteredZones = allZones.filter((tz) =>
      tz.toLowerCase().includes(search.toLowerCase())
    );

    // Ferme le menu si on clique en dehors
    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearch('');
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus la zone de texte
    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    return (
      <div ref={dropdownRef} className="relative w-full text-sm pb-4">
        {/* Trigger area */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex m-1 px-5 py-3 flex-row items-center justify-between bg-portal-50 rounded border border-solid border-portal-500 hover:cursor-pointer"
        >
          <div className="flex flex-row items-center">
            <Globe size={17} className="scale-105 text-portal-600 stroke-2" />
            <span className="mx-2 font-medium">Fuseau</span>
          </div>
          <div className="text-slate-700 truncate max-w-[150px]">
            {selectedZone}
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full max-h-72 overflow-hidden bg-white border border-gray-300 rounded shadow-md">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un fuseau..."
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-portal-500"
              />
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredZones.length > 0 ? (
                filteredZones.map((tz) => {
                  const offsetMinutes = moment.tz(tz).utcOffset();
                  const sign = offsetMinutes >= 0 ? '+' : '-';
                  const absMinutes = Math.abs(offsetMinutes);
                  const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
                  const minutes = String(absMinutes % 60).padStart(2, '0');
                  const offsetFormatted = `UTC${sign}${hours}:${minutes}`;

                  return (
                    <div
                      key={tz}
                      onClick={() => {
                        onChange(tz);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`px-4 py-2 hover:bg-portal-100 cursor-pointer ${
                        tz === selectedZone ? 'bg-portal-200 font-bold' : ''
                      }`}
                    >
                      {tz} <span className="text-gray-500">({offsetFormatted})</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-gray-500 italic">Aucun résultat</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

return <Fragment>
  <div id="autoScopeId" className="autoScope"></div>
  <div id="rdvBoxStructureId" className="rdvBoxStructure roboto bg-white z-40 shadow w-full" 
    onMouseEnter={() => {toogleAutoScope("run")} }
    onMouseLeave={() => {toogleAutoScope("stop")} }>

    <div className="headerRdvBox bg-gradient-to-l from-fusion-400 to-portal-500 flex items-center flex-row shadow-lg shadow-portal-200/50 text-white px-4 py-2.5 h-38 z-30">
      <div className="openingActionsContainersAnimation flex items-center bg-portal-200 p-2 mr-3 rounded-full hover:scale-105 hover:cursor-pointer duration-150" 
        style={{display: hval !== null && activeConfirmation === false && sendDatasStatus.current !== "success" ? "block" : "none"}}
        title="Retour à l'étape précédente" onClick={() => {setActiveConfirmation(true)}}>
        <ChevronLeft className="text-portal-600" size={22} />
      </div>

      <div className="openingActionsContainersAnimation items-center bg-portal-200 p-2 mr-3 rounded-full hover:scale-105 hover:cursor-pointer duration-150" 
        style={{display: showCloseIconAutorization && activeConfirmation === true ? "flex" : "none"}}
        title="Fermer" onClick={() => {props.closeModalCallTunnel(false)}}>
        <X className="text-portal-600" size={22} />
      </div>

      <div className="flex flex-col">
        <h2 className="font-bold text-sm montserrat">Prenez votre rendez-vous en ligne</h2>
        <span className="text-sm">{hval !== null && activeConfirmation === false ?
         `📆 ${getStringDate(hval)} à ${selectedTimeStr} - Heure de Paris ${ appointmentChoosed === 0 ? " (Au cabinet)" : " (En visio)" }`
         : "Renseignez les informations suivantes"}</span>
      </div>
    </div>

    <div id="actionsContainersWrapperId" className="actionsContainersWrapper z-50 w-full pt-1" style={{display: activeConfirmation === false ? "none" : "block"}}>
      {/* === TYPE D'ACCOMPAGNEMENT === */}
      <ActionsContainer title={"Type de rendez-vous"} statement={componentIsReady} isActive={activeConfirmation} step={1}>
        <div className="actionsContainerChild">
          { (
              props.residentiel == true ? appointmentTypesResidentiel :
              props.visio == true ? appointmentTypesVisio :
              appointmentTypes
            ).map((appointment, index, array) => {
              if (appointmentOptions.length === 2) {
                return <div key={appointment.id} onClick={() => {
                  console.log(appointmentTypes, appointmentTypesVisio, appointmentTypesResidentiel)
                  if (appointment.available === 1) { setAppointmentChoosed( appointment.id ); } 
                  else { setAppointmentChoosed( 0 ) };
                  if (props.residentiel == true || props.visio == true || appointment.id === 1) { setDays(daysShiftLimit[1])}
                  else { setDays(daysShiftLimit[0]) };
                  if (!props.residentiel) { requireAutoScroll("selectAppointmentIdCalendar", "end"); }
                  else { requireAutoScroll("selectWeeksNumber", "end"); }
                  
                }}
                className={`flex m-1 px-5 py-3 flex-row items-center text-sm bg-portal-50 rounded justify-between duration-150 hover:cursor-pointer ${ appointment.id === appointmentChoosed && "border-solid border border-portal-500" } `}>
                  {appointment.id === appointmentChoosed ?
                    <>
                      <div className="flex flex-row items-center">
                        <CheckCircle size={17} className="scale-105 text-portal-600 stroke-2"/>
                        <span className={"mx-2 font-medium"}>{appointment.type}</span>
                        {/* {appointment.available === 0? <span className="text-xs text-slate-600">Temporairement indisponible</span> : null} */}
                      </div>
                      <div className={appointmentChoosed === appointment.id? "text-portal-600 flex flex-row" : "text-portal-200"}>
                        {props.residentiel == true ? null :
                          <div className="text-xs ml-1 text-slate-700 items-center" style={{paddingRight: '8px'}}>
                            {appointment.stringCostValue}
                          </div>
                        }
                        {appointment.icon}
                      </div>
                    </>
                  :
                    <>
                      <div className="flex flex-row items-center">
                        <Circle size={17} className="text-portal-200"/>
                        <span className="mx-2">{appointment.type}</span>
                        {/* {appointment.available === 0? <span className="text-xs text-slate-600">Temporairement indisponible</span> : null} */}
                      </div>
                      <div className={appointmentChoosed === appointment.id? "text-portal-600" : "text-portal-200"}>
                        {appointment.icon}
                      </div>
                    </>
                  }
                </div>
              } else if (appointmentOptions.length === 1) {
                const isFirstAvailableAppointment = appointment.available === 1 && index === 0;
                const isAlreadySelectedAppointment = appointment.id === appointmentChoosed;
                const isAppointmentSelected = isFirstAvailableAppointment || isAlreadySelectedAppointment;
    
                if (isAppointmentSelected && appointmentChoosed !== appointment.id) {
                  setAppointmentChoosed(appointment.id);
                  setDays(props.visio || appointment.id === 1 ? daysShiftLimit[1] : daysShiftLimit[0]);
                  requireAutoScroll(props.residentiel ? "selectWeeksNumber" : "selectAppointmentIdCalendar", "end");
                }
    
                return (
                  <div
                    key={appointment.id}
                    className={`flex m-1 px-5 py-3 flex-row items-center text-sm bg-portal-50 rounded justify-between duration-150 hover:cursor-pointer border-solid border border-portal-500`}
                  >
                  <div className="flex flex-row items-center">
                    <CheckCircle size={17} className="scale-105 text-portal-600 stroke-2" />
                    <span className="mx-2 font-medium">{appointment.type}</span>
                  </div>
                  <div className="text-flame-600 flex flex-row">
                    <div className="text-xs ml-1 text-slate-700 items-center" style={{ paddingRight: '8px' }}>
                      {appointment.stringCostValue}
                    </div>
                    <div className={"text-portal-600"}>
                        {appointment.icon}
                    </div>
                  </div>
                  </div>
                );
              }
          })}
        </div>
      </ActionsContainer>
      <hr className="text-slate-200 w-full"></hr>
      
      {/* === LIEU DE L'ACCOMPAGNEMENT === */}
      { appointmentChoosed != 1 && (!props.available ? 

        <ActionsContainer 
          title={""} 
          statement={appointmentChoosed !== null ? true : false} 
          placeholderHeight={"39px"} 
          isActive={activeConfirmation} 
          step={2}
        >
          <div className="indisponible font-bold text-sm mt-2 pl-2 roboto pb-3">
          Veuillez envoyer un email à <a href="mailto:secretariat@sarahnacass.com">secretariat@sarahnacass.com</a> en indiquant vos coordonnées téléphonique, la / les plus grandes villes les plus proches de chez vous, ainsi que vos 5 prochaines disponibilités pour un rendez-vous sur place.
          </div>
          <div className="actionsContainerChild" >
            <div className="text-xs px-2 pb-2 text-slate-600 roboto">
              La prise directement en ligne de rendez-vous sur place à {props.city} étant temporairement indisponible
            </div>
          </div>
        </ActionsContainer>

        :

        <Fragment>
          <ActionsContainer title={"Lieu du rendez-vous"} placeholderHeight={"39px"} isActive={activeConfirmation} step={2} statement={appointmentChoosed !== null ? true : false} >
            <div className="text-xs px-2 pb-2 text-slate-600 roboto">
              {appointmentChoosed === 0 ? props.residentiel == true ?
              `Le lien d'accès à la réunion vous sera transmis par e-mail après la réservation de votre rendez-vous.`
              :
              `L'adresse vous sera transmise par e-mail après le paiement de votre rendez-vous.`
              :
              `Le lien d'accès à la réunion vous sera transmis par e-mail après le paiement de votre rendez-vous.`
              }
            </div>
            <div className="actionsContainerChild" onClick={toogleLocationsModal}>
              <button
                className="text-sm group h-10 flex flex-row items-center text-left roboto font-bold text-slate-600
                rounded-lg group duration-300 
                bg-slate-100 hover:bg-slate-200 focus:outline-none
                cursor-pointer w-full">
                  <MapPin className="h-4 mx-2.5"/> <p className="group-hover:hidden whitespace-nowrap text-ellipsis overflow-hidden">{props.residentiel == true ? 'Rendez-vous visio (par ordinateur)' : selectedAddress}</p>
                  <div className="hidden group-hover:block py-1">Changer le lieu du rendez-vous</div>
              </button>
              <div className="block font-semibold uppercase text-sm pt-3 px-3 cursor-pointer max-w-max text-portal-500">Changer de lieu</div>
            </div>
          </ActionsContainer>
          <hr className="text-slate-200 w-full"></hr>
        </Fragment> 
      )}

      {/* === SELECTION SEMAINE(S) === */}
      { (props.available != 0 && appointmentChoosed !== null && props.residentiel) &&
        <Fragment>
          <ActionsContainer title={"Sélection de la période"} placeholderHeight={"39px"} isActive={activeConfirmation} step={2} statement={appointmentChoosed !== null ? true : false} >
            <div className="text-xs px-2 pb-2 text-slate-600 roboto">
              Sélectionnez le nombre de semaines ou de mois ainsi que le 1er jour de votre rendez-vous
            </div>
            <div id="selectWeeksNumber">
              <WeekMapper
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                displayStage={displayStage}
                setDisplayStage={setDisplayStage}
                requireAutoScroll={requireAutoScroll}
              />
            </div>
          </ActionsContainer>
          <hr className="text-slate-200 w-full"></hr>
        </Fragment> 
      }

      {/* === SELECTION DATE RDV (Option par défaut + autres options) === */}
      { (props.available != 0 && appointmentChoosed !== null && (props.residentiel ? selectedDay.length !== 0 : true)) &&
      <ActionsContainer title={"Sélectionnez votre rendez-vous"} statement={appointmentChoosed !== null ? true : false} 
      placeholderHeight={"360px"} isActive={activeConfirmation} step={3}>
        <div id="selectAppointmentIdCalendar" className="actionsContainerChild">
          <div className="text-xs px-2 pb-1 text-slate-600 roboto">
            {appointmentChoosed === 0  ? props.residentiel == true ?
            `Un accompagnement résidentiel nécessite un rendez-vous de mise en place d'au moins 48h avant la première séance.`
            :
            `Un accompagnement au cabinet nécessite une prise de rendez-vous d'environ 9 jours à l'avance.`
            :
            `Un accompagnement en visio nécessite une prise de rendez-vous d'environ 12h à l'avance, selon le spécialiste.`
            }
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-full text-center">
            <img
              src="https://media.giphy.com/media/hFwSKDpONhT8I/giphy.gif"
              alt="Chargement en cours..."
              className="text-center"
            />
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-1 py-3">
            <TimezoneSelector selectedZone={selectedZone} onChange={setSelectedZone} />
            { tableau.map((days, index) => {
                let tarif_visio, appointmentTypeIdPaid_visio, appointmentTypeIdNotPaid_visio, acuityAddress_visio, idLocation_visio, calendarId_visio, acuityAPI_visio
                visio_tarifs.forEach(objet => {
                    if (window.location.pathname.includes(objet.path) && objet.formation === (props.visioFormation ?? false)) {
                      tarif_visio = objet.tarif
                      appointmentTypeIdPaid_visio = objet.appointmentTypeIdPaid
                      appointmentTypeIdNotPaid_visio = objet.appointmentTypeIdNotPaid
                      acuityAddress_visio = objet.acuityAddress
                      idLocation_visio = objet.idLocation
                      calendarId_visio = objet.calendarId
                      acuityAPI_visio = objet.acuityAPI
                    }
                })
                const hoursSlotsComponent = (
                  <HoursSlotsMapperUpdated
                  selectedZone={selectedZone ?? 'Europe/Paris'}
                  geoTrackInfos={geoTrackInfos}
                  dayIndex={index}
                  key={ days }
                  days={ days } 
                  selectedAddress={ selectedAddress }
                  appointmentChoosed={appointmentChoosed}
                  residentiel = {props.residentiel ?? false}
                  visioFormation = {props.visioFormation ?? false}
                  // weekEndAvailability={weekEndAvailability}
                  appointmentTypeIdPaid={appointmentChoosed === 0 ? props.appointmentTypeIdPaid : appointmentTypeIdPaid_visio}
                  calendarId={appointmentChoosed === 0 ? props.calendarId : calendarId_visio}
                  acuityAPI={appointmentChoosed === 0 ? props.acuityAPI : acuityAPI_visio}
                  tarif={appointmentChoosed === 0 ? tarifsVisioCabinet.tarif_cabinet : tarifsVisioCabinet.tarif_visio}
                  appointmentTypeIdNotPaid={appointmentChoosed === 0 ? props.appointmentTypeIdNotPaid : appointmentTypeIdNotPaid_visio}
                  idLocation={appointmentChoosed === 0 ? props.idLocation : idLocation_visio}
                  city={appointmentChoosed === 0 ? props.city : "distance"}
                  userPattern={"N/A"}
                  daysShiftLimit={daysShiftLimit}
                  setActiveConfirmation={setActiveConfirmation}
                  setHval={setHval}
                  setSelectedTimeStr={setSelectedTimeStr}
                  />
                );

                return hoursSlotsComponent

              }) 
            }
          </div>
          )}
          <div className="topStickyElement w-full flex justify-between bg-white text-sm items-center px-1">
            <div onClick={removeDays} className="flex items-center font-medium cursor-pointer hover:bg-portal-400
              bg-portal-100 text-portal-600 px-4 py-2 rounded-full hover:text-white duration-150">
              <ChevronLeft size={18} title="< Précédent"/> <span className="ml-1">Jours précédents</span>
            </div>

            <div onClick={addDays} className="flex items-center font-medium cursor-pointer hover:bg-portal-400
              bg-portal-100 text-portal-600 px-4 py-2 rounded-full hover:text-white duration-150">
              <span className="mr-1">Jours suivants</span> <ChevronRight size={18} title="Suivant >"/>
            </div>
          </div>
    
          <div className="moreHoursAction items-center justify-between text-center" style={{ display : "none" }}>
            <div onClick={() => { setShowMoreHours(true)}} className="moreHoursActionDivFull">
              <div className="px-4 py-2 rounded-full bg-light-red text-sm text-high-red font-medium my-6 mx-auto hover:cursor-pointer">
                Voir plus d'horaires
              </div>
            </div>
          </div>

        </div>
      </ActionsContainer>}
    </div>  

    <div className="actionsContainersWrapper w-full" style={{display: activeConfirmation === true ? "none" : "block"}}>

      { !(props.available == 0 && appointmentChoosed === 0) &&
      <ActionsContainer title={"Dernière étape : Renseignez vos informations"} statement={true} isActive={activeConfirmation === true ? false : true} step={4}>
        <div className="actionsContainerChild">
          <div className="datasStatus px-6" style={{display: sendDatasStatus.current === "null" ? "none" : "flex"}}>
            {sendDatasStatus.current === "pending" ?
              <div className="isLoading z-50 text-slate-800 text-center">
                <div className="h-14 w-14 border-solid border-t-2 border-portal-800 rounded-full animate-spin mx-auto"></div>
                <p className="font-medium my-2 text-center">
                  { sendDatasStatus.message }
                </p>
              </div>
            :
              sendDatasStatus.current === "success" ?
              <div className="isDone text-portal-600 text-center" id="success-message">
                <CheckCircle size={35} className="mx-auto mb-4" />
                <p className="text-portal-700 font-bold my-2 text-center">La réservation est confirmée</p>
                <p className="text-portal-700 text-sm text-center">
                  Vous receverez sous peu un mail contenant tout les détails de votre rendez-vous, avec votre spécialiste.
                </p>
              </div>
              :
              <div className="isError text-portal-800 text-center">
                <X className="mx-auto mb-4" size={35} />
                <p className="font-medium my-2 text-center">Quelque-chose s'est mal passé</p>
                <p className="text-portal-800 text-sm text-center">
                  { sendDatasStatus.message }
                </p>
              </div>
            }

          </div>
          <form id="_safeBookingFormID" onSubmit={handleSubmit(onSubmit)}>

            <Controller
              control={control}
              name="lastName"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormInput
                  type="text"
                  label="Nom"
                  placeholder="Entrez votre nom"
                  onChange={onChange}
                  value={value !== undefined ? value : ""}
                  error={error}
                  errorMessage={error?.message}
                />
              )}
            ></Controller>
            
            <Controller 
              control={control} 
              name="firstName"
              render={({
                  field: { onChange, value },
                  fieldState: { error },
              }) => (
                <FormInput
                  type="text"
                  label="Prénom"
                  placeholder="Entrez votre prénom"
                  onChange={onChange}
                  value={value !== undefined ? value : ""}
                  error={error}
                  errorMessage={error?.message}
                />
              )}
            ></Controller>
            
            <Controller 
              control={control} 
              name="phoneNumber"
              render={({
                  field: { onChange, value },
                  fieldState: { error },
              }) => (
                <FormInput
                  type="tel"
                  label="Numéro de téléphone 📱"
                  placeholder="Entrez votre numéro de téléphone"
                  value={value !== undefined ? value : ""}
                  onChange={onChange}
                  error={error}
                  errorMessage={error?.message}
                />
              )}
            ></Controller>

            <Controller 
              control={control} 
              name="email"
              render={({
                  field: { onChange, value },
                  fieldState: { error },
              }) => (
                  <FormInput
                      name="email"
                      label="Adresse e-mail 📧"
                      type="email"
                      placeholder="Entrez votre adresse e-mail"
                      value={value !== undefined ? value : ""}
                      onChange={onChange}
                      error={error}
                      errorMessage={error?.message}
                  />
              )}
            ></Controller>

            
            <Controller 
              control={control} 
              name="cheat_code"
              render={({
              }) => (
                  <FormInput
                      type="hidden"
                      value={cheatCodeValue}
                  />
              )}
            ></Controller>

            <div className="flex flex-row items-center justify-center my-4">
              <PrimaryButton
                isInForm={true}
                disabled={!isValid || isSubmitting} 
                title={ !isValid || isSubmitting ? "Vous devez remplir correctement tout les champs avant de pouvoir confirmer." : "Je confirme la prise de ce RDV."} 
              >
                { cheatCodeValue || props.residentiel == true ? "Procéder à la réservation" :"Procéder au paiement" }
              </PrimaryButton>
            </div>

            <div className={`disclaimer text-xs px-1.5 mb-4 duration-150 ${!isValid || isSubmitting ? "text-slate-500" : "text-slate-700 font-medium"}`}>
              {appointmentChoosed === 1 ? (
                "Vous avez choisi un accompagnement en visio de 2h00, il s'agit d'une session d'accompagnement en visioconférence privée et sécurisée, entre vous et le praticien."
              ) : (
                `Vous avez choisi un accompagnement 
                ${ props.residentiel == true ? 
                  " en résidentiel de 30 minutes, il s'agit d'une session d'accompagnement en visioconférence privée et sécurisée, entre vous et le praticien." : 
                  " au cabinet, votre séance de 3h00 aura lieu à l'adresse suivante : " + selectedAddress + "."}`
              )}
              <p className="mt-1 text-xs">
                En confirmant ce rendez-vous, vous acceptez qu'un praticien de l'équipe Sarah Nacass soit prévenu et qu'il puisse vous re-contacter si besoin.
              </p>
              {/* Belgique */}
              { window.location.pathname.includes("/be/") &&(
                <p className="mt-1 text-xs">
                  Ces séances ne sont pas prises en charge par l’Institut National d’Assurance Maladie-Invalidité (INAMI), ni par la plupart des mutuelles.
                </p>
              )}
              {/* Suisse */}
              { window.location.pathname.includes("/ch/") && (
                  <p className="mt-1 text-xs">
                    Ces séances ne sont pas remboursées par l'Assurance Maladie Obligatoire (LAMal), ni par la plupart des assurances complémentaires.
                  </p>
              )}
              {/* Luxembourg */}
              { window.location.pathname.includes("/lu/") &&(
                <p className="mt-1 text-xs">
                  Ces séances ne sont pas prises en charge par la Caisse Nationale de Santé (CNS), ni par la plupart des assurances complémentaires.
                </p>
              )}
              {/* Québec */}
              { window.location.pathname.includes("/ca/") && (
                  <p className="mt-1 text-xs">
                    Ces séances ne sont pas couvertes par la Régie de l'assurance maladie du Québec (RAMQ), ni par la plupart des assurances privées ou complémentaires.
                  </p>
              )}
              {/* Maroc */}
              { window.location.pathname.includes("/ma/") && (
                  <p className="mt-1 text-xs">
                    Ces séances ne sont pas remboursées par la Caisse Nationale de Sécurité Sociale (CNSS) ni l'Assurance Maladie Obligatoire (AMO), et ne sont pas prises en charge par la plupart des assurances complémentaires santé.
                  </p>
              )}
              {/* France */}
              { window.location.pathname.includes("/fr/") && (
                <p className="mt-1 text-xs">
                  Ces séances ne sont pas prises en charge par la Sécurité sociale, ni par la plupart des mutuelles ou complémentaires santé.
                </p>
              )}
              <p className="mt-1 text-xs">
                { props.residentiel == true ? null : `En cliquant sur \"Procéder au paiement\", vous serez redirigé vers la page de paiement sécurisée, sur laquelle vous règlerez directement cet accompagnement d'un montant de ${amountOnCkeckout} à l'issue duquel vous recevrez un mail de confirmation.` }
              </p>
              <p className="mt-1 text-xs">
                { props.residentiel == true ? `Pour toute annulation de rendez-vous, veuillez contacter directement les cabinets Sarah Nacass par téléphone ou` : `Pour toute annulation de rendez-vous ou si vous rencontrez des difficultés pour procéder au paiement, veuillez contacter directement le secrétariat des cabinets Sarah Nacass par téléphone ou`} <a className="underline" href='mailto:contact@sarahnacass.com'>par e-mail</a>.
              </p>
              <div 
                onClick={cheatCode}
                className={ !isValid || isSubmitting ? "display_none" : ""} 
              >
                {!(cheatCodeValue) && (
                  <p className="mt-1 text-xs">Vous êtes secrétaire ? <span className="underline hover:cursor-pointer">Cliquez ici</span>.</p>
                )}
                {(cheatCodeValue) && (
                  <p className="mt-1 text-xs">Code : <b>{cheatCodeValue} </b> <span className="underline hover:cursor-pointer">Cliquez ici pour changer</span>.</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </ActionsContainer>
      }

    </div>

  </div>
  </Fragment>
});
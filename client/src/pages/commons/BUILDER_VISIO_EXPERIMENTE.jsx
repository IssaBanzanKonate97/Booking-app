import "../../App.css";
import Loading from "../../components/Loading";
import React, { useState, useEffect, useRef, useCallback, Fragment, useContext } from "react";

import Header from "../../components/Header";
import GeoZoneSelector from "./GEO_ZONE_POP";
import { AlignLeft, ArrowRight, Clock } from "react-feather";

import {
  resolveLocations, 
  getCurrentSelectedDispatcher, 
  checkIfAppointmentWasAlreadyMade,
  checkIfAppointmentWasAlreadyAvailable,
} from "../models/FUNCTIONS_DISPATCHER";

import { STATE } from "../models/STATE_DATAS";

import { DatasContext } from "./contexts";

import Presentation from "../../components/Presentation";
import Video from "../../components/Video";
import RdvUpdate from "../../components/Reservations/RdvUpdate";
import Horaire from "../../components/Horaire";

import EventDisplayer from "../../components/EventDisplayer";
import { EventContext } from "../../contexts/EventContext";

import moment from "moment";


export default function Builder({ resolve }) {
  const rdvComponentRef = useRef();
  const [selected, setSelected] = useState(null);
  const [localEtabName, setLocalEtabName] = useState(false);
  const [localEtabValues, setLocalEtabValues] = useState(false);
  const [phoneToCall, setPhoneToCall] = useState("");
  const [dispatcherCheck, setDispatcherCheck] = useState(0);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [openReservationModal, setReservationModalStatement] = useState(false);
  const [showModal, setShowModal] = useState([false, false]);

  const [secraitaireCode, setSecraitaireCode] = useState('');

  const { createEvent } = useContext(EventContext);

  useEffect(() => {
    if(window.innerWidth <= STATE.SCREEN.MD) {
      setScreenWidth('small');
    } else {
      setScreenWidth('wide');
    }
  });

  useEffect(() => {
    const getLocations = async () => {
      const locations = await resolveLocations(resolve);

      setLocalEtabName(locations[0]);
      setLocalEtabValues(locations[1]);
      setDispatcherCheck(locations[2]);
      setPhoneToCall(locations[3]);
    };

    getLocations();
  }, [resolve]);

  useEffect(() => {
    const selectedResult = getCurrentSelectedDispatcher(dispatcherCheck);
    return setSelected(selectedResult);
  }, [dispatcherCheck]);

  useEffect(() => {
    (async () => {
      const last_booking_informations = checkIfAppointmentWasAlreadyMade();
      const { status, datas } = last_booking_informations;
      if (status === false) return; 
      const available = await checkIfAppointmentWasAlreadyAvailable(last_booking_informations.datas.informations);
      if (available === false) return;

      const { informations, redirection_checkout_url } = datas;
      const { identity, isoDate, type, typeId, address, clientSavedAtTime } = informations;
      const { firstName, lastName } = identity;

      const title = `${ firstName }, vous avez oublié de régler votre réservation (${ type })`;
      const content = `
        Vous avez pris une réservation depuis cette appareil ${ moment(clientSavedAtTime).fromNow() }, qui n\'a pas été réglée. 
        Au nom de : ${ firstName } ${ lastName }, prévu pour le ${ moment(isoDate).format('DD/MM/YYYY [à] hh:mm') }, ${ typeId === 0 ? `à l'Institut ADIOS situé : ${ address }` : `en visioconférence` }.
        Si vous souhaitez valider votre réservation, vous pouvez le faire en cliquant sur le bouton ci-dessous, vous serez redirigé vers notre page de paiement sécurisée.
      `;
      const timeOut = 4 * 60 * 1000;
      const icon = null;
      const link = {
        text: "Procéder au paiement de ma réservation",
        url: redirection_checkout_url,
      }

      const new_event = {
        title, content, timeOut, icon, link
      };

      if (status && available) {
        return createEvent(new_event);
      }
    })();
  }, []);

  const toogleLocationsModal = useCallback(() => {
    if(showModal[0] === false) {
      setShowModal([true, true]);
    } else {
      setShowModal([false, false]);
    }
  }, [showModal]);

  function toogleReservationModal(){
    return setReservationModalStatement(!openReservationModal);
  }
  const getDimension = () => {
    if (window.innerWidth >= STATE.SCREEN.MD) {
      setReservationModalStatement(false)
      return setScreenWidth("wide");
    } else {
      return setScreenWidth("small");
    }
  };

  useEffect(() => {
    window.addEventListener('resize', getDimension);
    return(() => {
        window.removeEventListener('resize', getDimension);
    })
  }, [screenWidth]);

  useEffect(() => {
    if (localEtabName === false) return;
    document.title = `${ localEtabName }`;
  }, [localEtabName]);

  const handleCheatCode = useCallback(async () => {

    const title = `Connexion secrétaire`;
    const content = `
      Veuillez entrer votre code confidentiel dans le champ ci-dessous
    `;
    const timeOut = 4 * 60 * 1000;
    const icon = null;
    const code = {
      text: "Code confidentiel",
      type: 'text',
      id: 'code_confidentiel',
      setSecraitaireCode
    };

    const new_event = {
      title, content, timeOut, icon, code
    };
    return createEvent(new_event);
  }, []);

  return (
    <DatasContext.Provider value={{ phoneToCall }}>
    
      <EventDisplayer />

      { selected !== null && localEtabValues !== false && localEtabName !== false ? 
        <Fragment>
          <GeoZoneSelector showModal={showModal} setShowModal={setShowModal} setSelected={setSelected} />
          <div className="App bg-slate-200" style={{ minHeight: "140vh" }}>
            <Header localEtabName={localEtabName}> </Header>
            <div className="maxTabSize flex flex-row justify-center md:px-3 monserrat" style={{ display: "flex" }}>
              <div className="sideInformationsContainer md:mr-4 openingActionsContainersAnimation" style={{ display: openReservationModal ? "none" : "block" }}>
                <div>
                  <div className="flex flex-row bg-white my-4 py-4 shadow shadow-gray-200 md:rounded-md">
                    <div className="cardIcon h-full flex items-center justify-center"><AlignLeft size={19} /></div>
                    <div className="w-full">
                      <h3 className="cardTitle text-gray-600 font-medium montserrat">Présentation des cabinets Sarah Nacass</h3>
                      <Presentation />
                    </div>
                  </div>
                  <Video />
                  <div className="flex flex-row bg-white my-4 py-4 shadow shadow-gray-200 md:rounded-md">
                    <div className="cardIcon h-full flex items-center justify-center"><Clock size={19} /></div>
                    <div className="w-full">
                      <h3 className="cardTitle text-gray-600 font-medium montserrat">Secrétariat</h3>
                      <Horaire />
                    </div>
                  </div>
                </div>
              </div>
              <div className="min-w-max flex-col relative" style={{ display: screenWidth !== "small" ? "flex" : openReservationModal ? "flex" : "none" }}>
                  <RdvUpdate 
                    ref={rdvComponentRef}
                    toogleLocationsModal={toogleLocationsModal}
                    closeModalCallTunnel={setReservationModalStatement}
                    startTimestamp={Date.now()}
                    showCloseIconAutorization={ screenWidth === "small" ? true : false }
                    city="Visio"
                    visio={true}
                    visioFormation={false}
                    tarif={{value: null, currency: null, symbol: null}}
                    cheatCode={handleCheatCode}
                    cheatCodeValue={secraitaireCode}
                  />
              </div>
              {
                screenWidth === "small" && !openReservationModal ?
                <div className="getNewReservation flex items-center hover:cursor-pointer z-20
                  bg-gradient-to-r from-fusion-700 to-portal-500 text-white font-bold montserrat shadow-2xl px-9 py-3 hover:bg-blue-600 duration-150" 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    toogleReservationModal();
                    rdvComponentRef.current.toogleAutoScopeRef("run")
                   
                  }}>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col mr-8">
                      <span>Prenez rendez-vous</span>
                      <span className="text-xs font-normal">avec un spécialiste près de chez vous</span>
                    </div>
                    <ArrowRight size={20} strokeWidth={3} className="arrowRightAnimation"/>
                  </div>
                </div>
                  :
                  null
                }
              </div>
            { !openReservationModal && <div className="bg-gradient-to-b h-36 from-slate-200 to-slate-300">
              <div className="flex flex-row border-b-4 border-solid border-portal-400 -mb-7
              justify-center items-center h-full roboto text-slate-500 text-sm font-bold">
                Sarah Nacass — rdv.sarahnacass.com © { new Date().getFullYear() }
              </div>
            </div> }
          </div>
        </Fragment> : <Loading />
      }
    </DatasContext.Provider>
  );
};
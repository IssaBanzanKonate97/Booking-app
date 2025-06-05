import { useCallback, useEffect, useState } from "react";
import { ArrowLeftCircle, Home, MapPin, Navigation, Users, Video } from "react-feather";
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import "../../App.css";
import { findNameFor, findResidentielNameFor, getAllCountries, getCountryNameFromCountryCode, getGeoZonesForCountry, getGeoZonesForResidentiels } from "../models/FUNCTIONS_DISPATCHER";
import "./GEO_ZONE_POP.scss";
import adiosLogo from "../../img/logo-Sarah-Nacass-Jaune_Blanc-sans-fond.webp";
import { countriesDepthOfCoverage } from "../shared_locations_datas/LOCATIONS_DATAS";

export default function GeoZoneSelector({ showModal , setShowModal, includesCities, imLost, inFrame }) {

  const navigate = useNavigate();
  const [queryParameters] = useSearchParams();
  const indexT = queryParameters.get("index");
  let indexU = "";
  
  const [ready, setReady] = useState(false);
  const [surPlace, setSurPlace] = useState(false);
  const [visio, setVisio] = useState(false);
  const [visioExpert, setVisioExpert] = useState(false);
  const [residentiel, setResidentiel] = useState(false);
  const [positions, setPositions] = useState(false);
  const [residentielPositions, setResidentielPositions] = useState(false);
  const [currentCountry, setCurrentCountry] = useState("France");
  const [country] = useState( getAllCountries() );

  const toogleModal = useCallback(() => { 
    if (imLost) return; 
    if(showModal[0] === false) {
      setShowModal([true, includesCities]);
    } else {
      setShowModal([false, false]);
    }
  }, [showModal]);

  useEffect(() => {
    if (!showModal[0]) return;
    const currentPosition = window.location.pathname.split("/")[1];
    if(country && currentPosition) {
      const result = getCountryNameFromCountryCode(currentPosition);
      if(result) {
        return setCurrentCountry(result);
      }
    }
  }, [country, showModal]);

  useEffect(() => {
    if (!showModal[0]) return;
    const geoZones = getGeoZonesForCountry(currentCountry);
    let tempPositions = geoZones.reduce((c, { path: key }) => (c[key] = (c[key] || 0) + 1, c), {})
    const updatedPositions = Object.entries(tempPositions);
    setPositions(updatedPositions);
  }, [showModal, currentCountry]);
  
  useEffect(() => {
    if (!showModal[0]) return;
    const geoZones = getGeoZonesForResidentiels();
    let tempPositions = geoZones.reduce((c, { path: key }) => (c[key] = (c[key] || 0) + 1, c), {})
    const updatedPositions = Object.entries(tempPositions);
    setResidentielPositions(updatedPositions);
  }, [showModal, currentCountry]);

  const redirectVisio = (path, namedcountry, url) => {

    const sourceParam = new URLSearchParams(window.location.search).get('source');
    if (sourceParam) { localStorage.setItem('source', sourceParam); }
    const gclidParam = new URLSearchParams(window.location.search).get('gclid');
    if (gclidParam) { localStorage.setItem('gclid', gclidParam); }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'general',
      'localisation_auto': false,
      'pays': namedcountry,
      'region': "Distanciel",
      'source': sourceParam ?? undefined,
    });
    setShowModal([false, false]);
    navigate(path + url);
  }

  const checkNavigate = (redirectPath, regionName) => {
    if (redirectPath === "") return;
    if (inFrame) {
      const link = document.createElement("a");
      link.href = "https://rdv.sarahnacass.com" + redirectPath;
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    if (window.location.href.indexOf(redirectPath) > -1) {
      setShowModal([false, false]);
      return;
    }

    const sourceParam = new URLSearchParams(window.location.search).get('source');
    if (sourceParam) { localStorage.setItem('source', sourceParam); }
    const gclidParam = new URLSearchParams(window.location.search).get('gclid');
    if (gclidParam) { localStorage.setItem('gclid', gclidParam); }
    if (regionName || currentCountry) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
          'event': 'general',
          'localisation_auto': false,
          'pays': currentCountry,
          'region': regionName,
          'source': sourceParam ?? undefined,
      });
    }
  
    setShowModal([false, false]);
    navigate(redirectPath + "?" + createSearchParams({
      index: indexT
    }).toString());
  };

  const browserAsBuiltInGeolocator = useCallback(() => {
    if (navigator.geolocation) return true;
    return false;
  }, []);

  const modalStyle = inFrame ? 
    "geomodal-modal-framed relative bg-slate-90 text-slate-900 w-full bg-slate-100 p-6 pb-0 flex flex-col overflow-y-auto"
    :
    "geomodal-modal overflow-hidden shadow-2xl relative bg-slate-90 text-slate-900 w-full bg-slate-100 max-w-sm md:max-w-md lg:max-w-lg p-3 sm:p-4 rounded-lg flex flex-col duration-150";

  const backgroundModal = inFrame ?
    "geomodal-fullscreen-framed box-border border-none" :
    "geomodal-fullscreen box-border backdrop-blur-sm border-none p-2"

  return (
    country && positions && showModal[0] && <div className={backgroundModal} onClick={toogleModal}>

      {/* Sur Place */}
      { surPlace && <div onClick={(e) => e.stopPropagation()} className={modalStyle} >
        <div className="absolute bg-red-00 h-5 hidden md:block top-5 right-4">
          <img src={adiosLogo} alt="Sarah Nacass" className="h-full" />
        </div>
        <h1 className="flex text-slate-700 text-base font-semibold mx-1 mt-1.5 mb-2 roboto">
          <span className="p-1 h-6 w-6 mr-2 rounded-full relative bg-gradient-to-r cursor-pointer to-slate-700 from-slate-600" onClick={() => { setSurPlace(false) }}>
            <ArrowLeftCircle className="text-white group-hover:text-portal-700 group-hover:scale-150 duration-150 group-hover:text-white" size={16} />
          </span> 
          { imLost ? "Sélectionnez un lieu" : showModal[1] ? "Sélectionnez un lieu" : "Sélectionnez une zone géographique" }
        </h1>
        <div className="flex flex-row items-center mb-1 -mx-4 px-3 py-0.5 overflow-x-auto">
          {country.map((countryName, index) => {
            const style = `${countryName === currentCountry ? "text-slate-50 bg-gradient-to-r from-slate-600 to-slate-700" : "text-slate-700 bg-slate-200 hover:bg-slate-300"} text-sm shadow-md shadow-slate-300/60 rounded-full px-4 py-1.5 font-bold m-1 mx-0.5 duration-150 roboto cursor-pointer`;
            return <button key={index} onClick={() => { setCurrentCountry(countryName) }} className={style}> 
                { countryName }
              </button>
          })}
          { browserAsBuiltInGeolocator && <div onClick={() => checkNavigate("/use-auto-locate")}
            className="bg-gradient-to-r from-portal-500 to-fusion-500 text-white cursor-pointer duration-150 group hover:shadow-lg
            text-xs roboto py-2 px-3 mr-1 font-medium flex flex-row items-center rounded-full">
              <Navigation className="h-3 w-3 mr-1 shrink-0" />

              <span className="block">Choisir&nbsp;l'institut&nbsp;le&nbsp;plus&nbsp;proche</span>
            </div>
          }
        </div>
        <div className="overflow-y-auto w-full max-h-96 rounded">
          { positions.map((element, index) => {
              const regionName = findNameFor(element[0]);
              return <div key={index} onClick={() => { checkNavigate( element[0], regionName ) }}
              className="geomodal-select flex flex-row group relative hover:bg-gradient-to-r from-portal-500 to-fusion-600 duration-150 hover:cursor-pointer bg-white my-1 rounded py-0.5 sm:py-1 px-4 items-center">
                <div className="p-2 h-9 w-9 mr-2 rounded-full relative bg-portal-500 group-hover:bg-transparent">
                  <MapPin className="text-white group-hover:text-portal-700 group-hover:scale-150 duration-150 group-hover:text-white" size={19} />
                </div>
                <div className="flex flex-col p-1.5 roboto">
                  <h3 className="font-medium text-slate-800 textbase pb-1 group-hover:text-white">{ findNameFor(element[0]) }</h3>
                  <p className="text-slate-600 text-xs group-hover:text-portal-100">{`${element[1]} établissement${ element[1] > 1 ? "s trouvés" : " trouvé" }`}</p>
                </div>
                <span className="absolute right-4 h-full text-sm items-center hidden roboto text-white group-hover:flex">
                  Continuer
                </span>
              </div> 
            }) }
        </div>
      </div> }
      
      { visioExpert && <div onClick={(e) => e.stopPropagation()} className={modalStyle} >
        <div className="absolute bg-red-00 h-5 hidden md:block top-5 right-4">
          <img src={adiosLogo} alt="Oser le changement" className="h-full" />
        </div>
        <h1 className="flex text-slate-700 text-base font-semibold mx-1 mt-1.5 mb-2 roboto">
          <span className="p-1 h-6 w-6 mr-2 rounded-full relative bg-gradient-to-r cursor-pointer to-slate-700 from-slate-600" onClick={() => { setVisioExpert(false) }}>
            <ArrowLeftCircle className="text-white group-hover:text-portal-700 group-hover:scale-150 duration-150 group-hover:text-white" size={16} />
          </span> 
          { imLost ? "Sélectionnez votre pays" : showModal[1] ? "Sélectionnez votre pays" : "Sélectionnez une zone géographique" }
        </h1>
        <div className="overflow-y-auto w-full max-h-96 rounded">
          { Object.entries(countriesDepthOfCoverage).map((nameCountry, index) => {
              return <div key={index} onClick={() => { redirectVisio(nameCountry[0], nameCountry[1].name, '/visio-expert') }}
              className="geomodal-select flex flex-row group relative hover:bg-gradient-to-r from-portal-500 to-fusion-600 duration-150 hover:cursor-pointer bg-white my-1 rounded py-0.5 sm:py-1 px-4 items-center">
                <div className="p-2 h-9 w-9 mr-2 rounded-full relative bg-portal-500 group-hover:bg-transparent">
                  <MapPin className="text-white group-hover:text-portal-700 group-hover:scale-150 duration-150 group-hover:text-white" size={19} />
                </div>
                <div className="flex flex-col p-1.5 roboto">
                  <h3 className="font-medium text-slate-800 textbase pb-1 group-hover:text-white">{ nameCountry[1].name }</h3>
                </div>
                <span className="absolute right-4 h-full text-sm items-center hidden roboto text-white group-hover:flex">
                  Continuer
                </span>
              </div> 
            }) }
        </div>
      </div> }
      
      {/* Résidentiel */}
      { residentiel && residentielPositions.map((element) => {
          const regionName = findResidentielNameFor(element[0]);
          return checkNavigate( element[0], regionName )
      })}

      {/* Visio / Sur place / Résidentiel */}
      { !visio && !visioExpert && !surPlace && !residentiel && <div onClick={(e) => e.stopPropagation()} className={modalStyle} >
        <div className="absolute bg-red-00 h-10 hidden md:block top-2 right-4">
          <img src={adiosLogo} alt="Sarah Nacass" className="h-full" />
        </div>
        <h1 className="flex text-slate-700 text-base font-semibold mx-1 mt-1.5 mb-2 roboto">Sélectionnez un type de rendez-vous</h1>
        <div className="overflow-y-auto w-full h-full rounded flex flex-col">
            {/* Visio expert */}
            <div onClick={() => { setVisioExpert(true) }}
              className="geomodal-select flex flex-row group relative hover:bg-gradient-to-r from-portal-500 to-fusion-600 duration-150 hover:cursor-pointer bg-white my-1 rounded py-0.5 sm:py-1 px-4 items-center height-select-type flex-grow">
              <div className="p-2 h-9 w-9 mr-2 rounded-full relative bg-portal-500 group-hover:bg-transparent">
                <Video className="text-white group-hover:text-portal-700 group-hover:scale-150 duration-150 group-hover:text-white" size={19} />
              </div>
              <div className="flex flex-col p-1.5 roboto">
                <h3 className="font-medium text-slate-800 textbase pb-1 group-hover:text-white">Visio (Par ordinateur)</h3>
                <p className="text-slate-800 text-sm pb-1 group-hover:text-white">Avec Sarah Nacass elle-même</p>
                <p className="text-slate-600 text-xs group-hover:text-portal-100">75 Cabinets Sarah Nacass trouvés</p>
              </div>
              <span className="absolute right-4 h-full text-sm items-center hidden roboto text-white group-hover:flex resp">À partir de 300€</span>
            </div>
            <div onClick={() => { setSurPlace(true) }}
              className="geomodal-select flex flex-row group relative hover:bg-gradient-to-r from-portal-500 to-fusion-600 duration-150 hover:cursor-pointer bg-white my-1 rounded py-0.5 sm:py-1 px-4 items-center height-select-type flex-grow">
              <div className="p-2 h-9 w-9 mr-2 rounded-full relative bg-portal-500 group-hover:bg-transparent">
                <Users className="text-white group-hover:text-portal-700 group-hover:scale-150 duration-150 group-hover:text-white" size={19} />
              </div>
              <div className="flex flex-col p-1.5 roboto">
                <h3 className="font-medium text-slate-800 textbase pb-1 group-hover:text-white">Sur place</h3>
                <p className="text-slate-800 text-sm pb-1 group-hover:text-white">Avec un praticien du réseau Sarah Nacass</p>
                <p className="text-slate-600 text-xs group-hover:text-portal-100">35 villes trouvées</p>
              </div>
              <span className="absolute right-4 h-full text-sm items-center hidden roboto text-white group-hover:flex resp">À partir de 594€</span>
            </div>
            <div onClick={() => { setResidentiel(true) }}
              className="geomodal-select flex flex-row group relative hover:bg-gradient-to-r from-portal-500 to-fusion-600 duration-150 hover:cursor-pointer bg-white my-1 rounded py-0.5 sm:py-1 px-4 items-center height-select-type flex-grow">
              <div className="p-2 h-9 w-9 mr-2 rounded-full relative bg-portal-500 group-hover:bg-transparent">
                <Home className="text-white group-hover:text-portal-700 group-hover:scale-150 duration-150 group-hover:text-white" size={19} />
              </div>
              <div className="flex flex-col p-1.5 roboto">
                <h3 className="font-medium text-slate-800 textbase pb-1 group-hover:text-white">Résidentiel</h3>
                <p className="text-slate-800 text-sm pb-1 group-hover:text-white">Dans le lieu de Sarah Nacass suivi par elle</p>
                <p className="text-slate-600 text-xs group-hover:text-portal-100">Un accompagnement unique en toute intimité</p>
              </div>
              <span className="absolute right-4 h-full text-sm items-center hidden roboto text-white group-hover:flex resp">À partir de 99€</span>
            </div>
        </div>
      </div> }
    </div>
  );
};

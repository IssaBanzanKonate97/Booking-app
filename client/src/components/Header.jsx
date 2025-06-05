import React, { useEffect , useState } from "react";
import Libération from "../img/Libéré.png";
import "./header.scss";
import adiosLogo from "../img/logo-Sarah-Nacass-Jaune_Blanc-sans-fond.webp";

import CertifiedProviderBadge from "./CertifiedProviderBadge";
import Search from "./Search";

export default function Header({localEtabName}) {
  const navList = [
    {id: 0, title: "L'essentiel", domOffset: 64},
    {id: 1, title: "Carte", domOffset: 242},
    {id: 2, title: "Présentation", domOffset: 648},
    {id: 3, title: "Horaires", domOffset: 1486},
  ];

  const [logoDisplay, setLogoDisplay] = useState(false);

  // STICKY HEADER NAV BAR (dev eq.) ===
  useEffect(() => {
    var scrollListenerPos = window.addEventListener("scroll",() => {
      if (window.pageYOffset >= 184) {
        // Ici l'utilisateur a dépassé la zone safe
        setLogoDisplay(true);
        // document.getElementById('_EL_POS_TOP').classList.add('navbarMarginForce');
        // document.getElementById('fullHeaderId').classList.add('fullHeaderNavbarFixed');
        // document.getElementById('fullHeaderId').classList.remove('fullHeaderNavbarSticked');
      } else {
        // Ici l'utilisateur est dans la zone safe (initiale) // OU utiliser toogle("") ...
        setLogoDisplay(false);
        // document.getElementById('_EL_POS_TOP').classList.remove('navbarMarginForce');
        // document.getElementById('fullHeaderId').classList.remove('fullHeaderNavbarFixed');
        // document.getElementById('fullHeaderId').classList.add('fullHeaderNavbarSticked');
      }
    });
    return function cleanup(){
      scrollListenerPos = null;
    }
  },[])

  useEffect(() => {
    window.scroll(0, 0);
  }, [])

  function pageScroller(inOffset) {
    return window.scroll(window.pageYOffset , inOffset);
  }

  return (
    <div className="w-full montserrat">
      <div className="flex w-full bg-white">
        <div className="w-full h-12 md:h-[4em] flex flex-row justify-between px-2 md:px-3 items-center maxTabSize bg-white">
          <a href="/">
            <img className="h-8 md:h-16 mb-1 mt-2 py-0.5 px-2" src={adiosLogo} alt="rdv.sarahnacass.com" />
          </a>

          <div className="flex relative">
            <Search />
          </div>

        </div>
      </div>

      <div id="_EL_POS_TOP" className="profileOverlayScan flex flex-row justify-center">
        {/* --- BG IMAGE : POSITION ABSOLUTE/RELATIVE EQ. --- */}
        <div className="profileOverlayScan-backgroundImage opacity-30"></div>
        {/* --- PROFILE WRAPPER EQ. --- */}
        <div className="profileWrapperScan w-full md:px-4 flex flex-row md:m-3 py-6 md:py-0 absolute">
           
      <img className="adiosTeamScan hidden md:block object-cover m-2 hover:scale-105 duration-150 shadow-lg" 
        src={Libération} 
        alt="Équipe Institut Adios" 
        title="Équipe Institut Adios"
      />
 
          <div className="profileOverlayText text-white m-0 w-full md:ml-5 md:mt-3 text-center md:text-left">
            {/*- Nom établissement -*/}
            <h1 className="etablissementScan text-xl text-white mt-2 md:mt-1 font-medium">{localEtabName}</h1>
            {/*- Cabinet -*/}
            <div className="flex mx-auto md:mx-0 max-w-max flex-row w-full items-center roboto">
              <CertifiedProviderBadge type="Centre Privé" />
            </div>

          </div>
        </div>
      </div>

      <div id="fullHeaderId" className="fullHeaderNavbarSticked w-full bg-white shadow-md shadow-gray-200/50 mb-6 sticky top-0">
        <div className="navigationBarScan headerWideScan flex flex-row justify-center md:justify-start items-center text-gray-600 h-28">

          <div className="h-full">
            <ul className="ulScanShift md:ml-44 flex flex-row items-center mb-0">
              {navList.map((nav) => {
                return(
                  <a key={nav.id} onClick={() => { pageScroller(nav.domOffset) }}
                    className="mx-2 md:mx-3 md:text-base text-sm hover:cursor-pointer">
                    <li>{nav.title}</li>
                  </a>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

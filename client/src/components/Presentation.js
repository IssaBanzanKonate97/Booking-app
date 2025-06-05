import { useState, useContext } from "react";
import { DatasContext } from "../pages/commons/contexts";
import "./Presentation.css";

export default function Presentation(){

  const { phoneToCall } = useContext(DatasContext);
  const [view, setView] = useState("display-text");

  return (
    <div className="w-full rightBoxShift">
      <div className={view  + " text-gray-700"}>
        <p className="text" style={{textAlign: "justify"}}>
        Les Cabinets Sarah Nacass spécialisés dans l’arrêt des addictions vous accueillent
         en France et dans le monde francophone, uniquement sur rendez-vous.
        </p>
        <p className="text" style={{textAlign: "justify"}}>
          Les Praticiens en Reprogrammation Mentale Rapide exerçant dans en Cabinets Sarah Nacass
           suivent chaque année des centaines de personnes en situation de dépendance.
        </p>
        <p className="text" style={{textAlign: "justify"}}>
        Nous accompagnons dans le cadre de problèmes de dépendance à des substances
         (alcool, tabac, cannabis, cocaïne, ecstasy, sucre, ...) et pour les addictions comportementales
          (jeux vidéo, jeux d'argent, addictions sexuelles, dépendance affective,…). 
          Nous aidons aussi les personnes sujettes à des troubles alimentaires (boulimie, anorexie).{" "}
        </p>
        <p className="text" style={{textAlign: "justify"}}>
        À l’issue de leur suivi, nos clients ressortent transformés!
         Nous avons 95% de satisfaction parmi ceux qui sont allés au bout du programme.
        </p>
        <p className="text" style={{textAlign: "justify"}}>
        Comment cela fonctionne ? Tout commence par une Séance Initiale (SI) afin de connaître
         votre situation et d’apprécier le nombre d'heures nécessaires pour atteindre
          votre objectif (l’arrêt définitif, un comportement mesuré…). 
        </p>
        <p className="text" style={{textAlign: "justify"}}>
          Pour plus d'informations sur les rendez-vous, veuillez contacter
           le { phoneToCall.number ?? "+33 01 76 27 82 67" } pour joindre directement le secrétariat.
        </p>
       
      </div>
      <div className="text-fusion-500 font-bold roboto text-sm mt-6 flex items-center hover:cursor-pointer hover:underline" 
        onClick={ () => {setView("show-text")} } style={{display: view === "show-text" && "none"}} >
        ▾ En savoir plus sur l'établissement
      </div> 

      <hr className="text-gray-200 my-6"/>

      <div className="flexTimeInfos w-full">
        <div className="insetInfosContainer text-gray-700 roboto text-sm flex flex-col mb-3">
          <span className="font-bold mb-1">Horaires d'ouverture de l'établissement</span>
          <p className="">8h00 - 22h00</p>
        </div>
        
        <div className="insetInfosContainer text-gray-700 roboto text-sm flex flex-col mb-3">
          <span className="font-bold mb-1">Jours d'ouverture de l'établissement</span>
          <p className="">Lundi - Dimanche</p>
        </div>
      </div>
    </div>
  );
};

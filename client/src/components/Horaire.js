import "./Horaire.css";
import { useContext, useEffect } from "react";
import { DatasContext } from "../pages/commons/contexts";

const Horaire = () => {

  const { phoneToCall } = useContext(DatasContext);

  return (
    <div className="flexTimeInfos w-full rightBoxShift">
      <div className="insetInfosContainer text-gray-700 roboto text-sm flex flex-col mb-5">
        <span className="font-bold mb-1">Horaires d'ouverture du secrétariat</span>
        <p className="">8h30 - 20h00</p>
      </div>

      <div className="insetInfosContainer text-gray-700 roboto text-sm flex flex-col mb-5">
        <span className="font-bold mb-1">Contact du secrétariat</span>
        <p className="hover:cursor-pointer text-fusion-500">
          <a href={`tel:${ phoneToCall.number ?? "+33173037324"}`}>{ phoneToCall.number ?? "+33 01 76 27 82 67"}</a>
        </p>
      </div>

      <div className="insetInfosContainer text-gray-700 roboto text-sm flex flex-col mb-5">
        <span className="font-bold mb-1">Jours d'ouverture du secrétariat</span>
        <p className="">Lundi - Samedi</p>
      </div>
      
      <div className="insetInfosContainer text-gray-700 roboto text-sm flex flex-col mb-5">
        <span className="font-bold mb-1">Langues parlées</span>
        <p className="">Anglais et Français</p>
      </div>

    </div>
  );
};

export default Horaire;

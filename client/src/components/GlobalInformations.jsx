import React, { useContext } from "react";
import { MapPin } from "react-feather";
import "./GlobalInformations.css";
// import { STATE } from "../pages/models/STATE_DATAS";
import { DatasContext } from "../pages/commons/contexts";

// Import Map
import LeafletMap from "./Map";

export default function GlobalInformations() {
  const iconSize = 19;
  const titleClassStyle = "font-bold text-sm text-gray-600";
  const textClassStyle = "text-sm text-gray-600";

  /* Destructuring des données de localisation des établissements */
  const { selected, localEtabValues, phoneToCall } = useContext(DatasContext);
  const { name, address, accessMethods, parkingAccess, othersInfos, imageUri, latitude, longitude } = localEtabValues[selected];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 bg-white shadow shadow-gray-200 md:rounded-md overflow-hidden transition-all duration-300">

      <div className="flex col-span-1 lg:col-span-7">
        <div className="cardIcon py-4 flex justify-center"><MapPin size={iconSize} /></div>
        <div className="w-full">
          <h3 className="cardTitle md:block my-4 text-gray-600 font-medium montserrat">Carte et informations d'accès</h3>

          <div className="md:pr-12 md:px-0 roboto">

            <div className="flex flex-col md:px-0 mb-3">
              <div className="globalInformationsInfos">
                <h3 className={titleClassStyle}>{name}</h3>
                {/* <p className={textClassStyle}>{address}</p> */}
              </div>
              {accessMethods !== null && <div className="globalInformationsInfos">
                <h3 className={titleClassStyle}>Moyens de transport</h3>
                <p className={textClassStyle}>{accessMethods}</p>
              </div>
              }
              {parkingAccess !== null && <div className="globalInformationsInfos">
                <h3 className={titleClassStyle}>Parking public</h3>
                <p className={textClassStyle}>{parkingAccess}</p>
              </div>
              }
              {othersInfos !== null &&
                <div className="globalInformationsInfos">
                  <h3 className={titleClassStyle}>Informations pratiques</h3>
                  <p className={textClassStyle}>{othersInfos}</p>
                </div>
              }
              {phoneToCall.number !== null && <div className="globalInformationsInfos">
                <h3 className={titleClassStyle}>Contact conseillère</h3>
                <a href={`tel:${phoneToCall.number}`}>
                  <p className="text-fusion-500 text-sm">{phoneToCall.number}</p>
                </a>
              </div>
              }
            </div>

          </div>
        </div>
      </div>

      <div className="h-64 lg:h-full col-span-1 lg:col-span-5">

        <LeafletMap latitude={latitude} longitude={longitude} name={name} />

      </div>

    </div>
  );
};

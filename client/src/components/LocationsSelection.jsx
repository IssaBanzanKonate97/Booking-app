import React, { useEffect } from "react";
import "./locations_selection.scss";

/* === LocationsSelection permet d'afficher les boutons de sélection des établissements, par rapport à la liste des établissements passée en props === */
const selectedStyle = "chooseButtonBox my-1 font-medium border-solid border-2 border-slate-700 text-white text-sm bg-slate-700 hover:cursor-pointer hover:bg-slate-600 duration-150";
const notSelectedStyle = "chooseButtonBox my-1 font-medium text-slate-700 text-sm hover:cursor-pointer duration-150 border-solid border-2 border-slate-700";

export default function LocationsSelection({ selected, setSelected, locations, setPhoneToCall }){

    const selectedLocationName = locations[selected].name;
    // setPhoneToCall(locations[selected].phone);
    useEffect(() => {
        setPhoneToCall(locations[selected].phone);
    }, [selected, locations, setPhoneToCall]);

    const handleSelection = (locationPathId) => {

        setSelected(locationPathId);
        setPhoneToCall(locations[locationPathId].phone);
    };

    return <div className="w-full relative overflow-hidden bg-white mb-4 px-5 py-2 flex flex-col roboto shadow shadow-slate-200 md:rounded-md">
            <div className="left-border bg-portal-400"></div>

            <div className="flex-col text-left font-medium text-sm md:text-base py-2 ml-1 text-slate-700 montserrat">
                Sélectionnez un établissement : 
                <p className="text-xs py-1"> 
                    Sélectionné : { selectedLocationName }
                </p>
            </div>

            <div className="flex flex-row pb-2 flex-wrap">
                {
                    locations.map(({ pathId, city }, index) => (
                        <button
                            key={ index } 
                            onClick={() => handleSelection(pathId)}
                            className={ selected === pathId ? selectedStyle : notSelectedStyle }>
                                { city }
                        </button>
                    )
                )}
            </div>
        </div>
};
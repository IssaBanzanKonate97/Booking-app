import React from "react";
import "./rdv_update.scss";

/* === ActionsContainer est une fonction qui va seulement renvoyer ses enfants imbriquées
avec le titre associé, existe pour éviter les futures répétitions des éléments de la prise de rdv === */

export default function ActionsContainer({
    title,
    children,
    maxWidth,
    placeholderHeight,
    isActive,
    statement,
}){
    return isActive === true ?
            statement === false ?
            <div className="w-full z-40 text-slate-300 py-2 inactiveTracker" disabled={true}>
                <div className="w-full px-2 md:px-3 pb-2">
                    { title != false ?
                        <div className="font-bold text-sm mt-2 pl-2 roboto pb-3">{title}</div>
                    : null }
                </div>
            </div>
            :
            <div className="w-full z-40 activeTracker absolute top-0" disabled={false} style={{ maxWidth: maxWidth !== undefined && maxWidth }}>
                <div className="w-full md:px-4 px-3 my-2 pb-2">
                    { title != false ?
                        <div className="font-bold text-sm mt-2 pl-2 roboto pb-3">{title}</div>
                    : null }
                    {children}
                </div>
            </div>
        :
        null;
};
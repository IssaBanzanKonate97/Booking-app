import React, { Fragment } from "react";
import { Check, Home } from "react-feather";

export default function CertifiedProviderBadge({type}) {
    return <Fragment>
        <div className="roboto flex flex-row rounded bg-slate-900 inter py-2 mt-1 px-2 text-white items-center max-w-max">
            <Home className="h-4 w-4" size={"100%"} />
            <span className="ml-2 text-xs font-medium mx-1">{type}</span>
        </div>
        <div title="Ce badge indique que les établissements inscrits sur cette page ont été vérifiés par notre équipe et disposent d'informations légales à jour."
            className="roboto flex flex-row rounded mx-2 bg-gradient-to-r from-cyan-500 to-blue-500 inter text-white py-2 mt-1 px-3 items-center max-w-max" >
            <Check className="h-4 w-4" size={"100%"} />
            <span className="ml-2 text-xs font-medium mx-1">Profil vérifié</span>
        </div>
    </Fragment>
}
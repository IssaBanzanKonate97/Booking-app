import "../../App.css"
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { RefreshCw, MapPin } from "react-feather";
import mapLocationBkg from "./assets/map-location-bkg.webp";

import { filterForEach, getNavigatorLocation } from "../../pages/models/FUNCTIONS_DISPATCHER";
import { EventContext } from "../../contexts/EventContext";
import EventDisplayer from "../EventDisplayer";

export default function AUTO_GEO_REDIRECT() {
    const { createEvent } = useContext(EventContext);

    const navigate = useNavigate(); // Pour la redirection
    const [response, setResponse] = useState(false);

    useEffect(() => {

        const get = async () => {
            getNavigatorLocation(async (datas) => {
                if (!datas) return setResponse(false);
                setResponse(datas);

                const resultRanking = await filterForEach([datas.coords.latitude, datas.coords.longitude]);

                const new_event = {
                    title: "Vous êtes proche d'un établissement Sarah Nacass",
                    content: `Nous avons trouvé un établissement à proximité de votre position actuelle, nous l'avons automatiquement sélectionné pour vous. Notez que vous pouvez aussi choisir un accompagnement à distance (en visioconférence).`,
                    timeOut: 25 * 1000, // Après 25 secondes, l'alerte disparaitra automatiquement.
                    icon: <MapPin />,
                };

                createEvent(new_event);

                // Récupérer l'url source
                const sourceParam = new URLSearchParams(window.location.search).get('source');
                if (sourceParam) { localStorage.setItem('source', sourceParam); }

                // Envoi du pays et de la région au data layer
                if (resultRanking.region) {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        'event': 'general',
                        'localisation_auto': true,
                        'pays': resultRanking.pays,
                        'region': resultRanking.region,
                        'source': sourceParam ?? undefined,
                    });
                }

                navigate(`${resultRanking.path}`);
            }, (error) => {
                
                const new_event = {
                    title: "Nous n'avons pas pu vous géolocaliser",
                    content: `Nous n'avons pas pu vous géolocaliser automatiquement, votre navigateur ne semble pas autoriser la géolocalisation. Vous pouvez tout de même choisir un établissement dans le menu.`,
                    timeOut: 2 * 60 * 1000, // Après 2 minutes, l'alerte disparaitra automatiquement.
                };

                createEvent(new_event);
                
                // Récupérer l'url source
                const sourceParam = new URLSearchParams(window.location.search).get('source');
                if (sourceParam) { localStorage.setItem('source', sourceParam); }

                // Envoi du pays et de la région au data layer
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'general',
                    'localisation_auto': true,
                    'pays': 'Introuvable',
                    'region': 'Introuvable',
                    'source': sourceParam ?? undefined,
                });
                setResponse(error);

                navigate(`/`);
            });
        };

        get();
    }, [navigate]);

    useEffect(() => {

        if (response === true) return;
        const timeout = setTimeout(() => {
            /* On viens recharger la page après 15 secondes (on considère que le navigateur à échoué à récupérer la position) */
            window.location.reload();
        }, 15000);
        return () => { clearTimeout(timeout); }
    }, [response]);

    return <Fragment>
        <EventDisplayer />
        <div className="h-screen w-screen fixed inset-0 z-10 bg-slate-900">
            <img src={ mapLocationBkg } alt="background" className="h-full w-full z-20 object-cover opacity-10 blur-sm" />
        </div>
        <div className="flex z-30 md:flex-row flex-col roboto items-center fixed justify-center w-full h-screen">
            <div className="animate-spin text-slate-200 mb-6 md:mb-0"><RefreshCw size={22} /></div>
            <div className="md:ml-7">
                <p className="text-base font-bold text-white text-center md:text-left pb-2 md:pb-0">Chargement en cours ...</p>
                <p className="text-sm pt-1 mx-9 md:mx-0 text-gray-400 text-center md:text-left">
                    Nous cherchons les établissements les plus proches de chez vous.
                </p>
            </div>
        </div>
    </Fragment>
};
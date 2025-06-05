import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import moment from 'moment-timezone';
import 'moment/locale/fr';
import { ChevronDown } from "react-feather";

const isProductionEnv = process.env.NODE_ENV === "production" ? true : false;

// console.log("isProductionEnv", isProductionEnv);

// Modifier pour vérifier à chaque fois
const CACHE_MAX_TIME = 0; // 4 minutes de cache pour les disponibilités des créneaux horaires récupérées depuis le serveur

// Get saved datas fetched from the server
const getCache = (appointmentTypeIdPaid, calendarId, date) => {
    const cache = sessionStorage.getItem(`cache-${appointmentTypeIdPaid}-${calendarId}-${date}`);

    if (cache) {
        // Check if the cache is still valid
        const cacheDate = JSON.parse(cache).savedAt;
        const now = moment().format();
        const diff = moment(now).diff(cacheDate, 'minutes');

        if (diff < CACHE_MAX_TIME) {
            return JSON.parse(cache).data;
        } else {
            sessionStorage.removeItem(`cache-${appointmentTypeIdPaid}-${calendarId}-${date}`);
            return null;
        }
    } else {
        return null;
    }
};

// Save datas in the local storage
const setCache = (appointmentTypeIdPaid, calendarId, date, data) => {
    const cache = {
        savedAt: moment().format(),
        data,
    };

    return sessionStorage.setItem(`cache-${appointmentTypeIdPaid}-${calendarId}-${date}`, JSON.stringify(cache));
};

const getAvailabilityFromServer = async (appointmentChoosed, appointmentTypeIdPaid, calendarIds, date, acuityAPI) => {
    const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_GET_RESERVATIONS_AVAILABILITY : process.env.REACT_APP_DEV_GET_RESERVATIONS_AVAILABILITY;

    let allSchedules = [];

    for (const key in calendarIds) {
        if (calendarIds.hasOwnProperty(key)) {
            const calendarId = calendarIds[key];
            try {
                const response = await axios.get(`${endpoint}?choosed=${appointmentChoosed}&appointment=${appointmentTypeIdPaid}&calendar=${calendarId}&date=${date}&acuityAPI=${acuityAPI}`);
                if (response.data.datas && response.data.datas.length > 0) {
                    allSchedules = allSchedules.concat(response.data.datas);
                }
            } catch (error) {
                console.error(`Error fetching data for calendar ${calendarId}:`, error);
            }
        }
    }

    // Filtrage des créneaux disponibles
    const availableSlots = allSchedules.filter(schedule => schedule.slotsAvailable > 0);

    if (availableSlots.length === 0) {
        return { success: false, data: null };
    }

    // Suppression des doublons
    const uniqueSlots = Array.from(new Set(availableSlots.map(slot => JSON.stringify(slot)))).map(slot => JSON.parse(slot));

    return { success: true, data: uniqueSlots };
};


function HoursSlotsMapper({
        dayIndex,
        days, appointmentChoosed, appointmentTypeIdPaid, calendarId, weekEndAvailability,
        setActiveConfirmation, setHval, setSelectedTimeStr, daysShiftLimit, selectedAddress,
        acuityAPI, city, userPattern, residentiel, visioFormation, selectedZone
    }) {

    Date.prototype.addDays = function (days) {
        const date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    };

    /* === Données App :  API loading Statement + Inactive Day + Days Spliting (Affichage de la date dans le calendrier ) === */
    const [apiResponse, setApiResponse] = useState(null);
    const [isInactiveDay, setIsInactiveDay] = useState(0);
    // 0 : Pending for verification, 1 is Active, 2 : Is Inactive, 3 : Is Week-End

    /* Données UI : placeholderCalendar, pour l'écran de chargement */
    const commonSizing = { width: "100%", height: "100%", minHeight: "6em" };
    const placeholderCalendar = new Array(4).fill();
    const [calendarShow, setCalendarShow] = useState(false);

    useEffect(() => {
        if(dayIndex === 0) {
            setCalendarShow(true);
        }
    }, [dayIndex]);

    useEffect(() => { // If one of theses value change, then we need to update the calendar
        // console.log("HSM : Updating calendars informations (One change detected ...)")
        setApiResponse(null);
        setIsInactiveDay(0);
        return;
    }, [appointmentChoosed, appointmentTypeIdPaid, calendarId, selectedAddress]);

    /* Fonction asynchrone pour obtenir les jours bloqués de la semaine */
    const setAvailability = async (days) => {
        var now = new Date().toJSON().split("T", 1);
        var inDate = new Date(days);
        var parsed_inDate = inDate.toJSON().split("T", 1);

        if (weekEndAvailability === false && (inDate.getDay() === 0 || inDate.getDay() === 6)) {
            // Détermine si il s'agit d'un jour du week-end ou non
            // et si l'établissement est diponible ce jour;
            return "week-end";
        }
        if (now[0] === parsed_inDate[0] && appointmentChoosed === 1) {
            return true;
        } else if (appointmentChoosed === 0) {
            let date = new Date();
            if (residentiel == true) {
                if (new Date(days) <= date.setDate(date.getDate() + daysShiftLimit[1])) {
                    return true;
                }
            } else {
                if (new Date(days) <= date.setDate(date.getDate() + daysShiftLimit[0])) {
                    return true;
                }
            }
        } else return false;
    };

    /* === Hook d'effet : Validation day + Waiting API === */
    useEffect(() => {
        if (isInactiveDay === 0) {
            setAvailability(days).then((response) => {
                if (response === "week-end") return setIsInactiveDay(3);
                if (response === true) {
                    return setIsInactiveDay(2);
                } else {
                    return setIsInactiveDay(1);
                }
            })
        } else return;
    }, [isInactiveDay]);

    useEffect(() => {
        if (apiResponse === null && isInactiveDay === 1) {
            getAvailability(days)
                .then((response) => {
                    return setApiResponse(response);
                }).catch((error) => {
                return console.error(error);
            })
        } else return;
    }, [apiResponse, isInactiveDay, days]);

    /* Fonction d'ajout de jours à une date + transformation vers une date pour Acuity API */
    const addDaysTo = (date, inShift) => {
        return new Promise(resolve => {
            var result = new Date(date);
            result.setDate(result.getDate() + inShift);
            resolve(result.toISOString().split("T")[0]);
        });
    };

    /* Fonction d'obtention des disponibiltés des praticiens (API ACUITY) */
    const getAvailability = async (notFormatedDate) => {
        //setLoadingApiResponse(null);
        const getThisDate = await addDaysTo(notFormatedDate.split("T")[0], 1);
        const updatedResponseJsx = [];

        try {
            const schedules = [];
            const cache = getCache(appointmentTypeIdPaid, calendarId, getThisDate);

            if (cache) {
                schedules.push(cache);
            } else {
                try {
                    const new_schedules = await getAvailabilityFromServer(appointmentChoosed, appointmentTypeIdPaid, calendarId, getThisDate, acuityAPI);
                    if (new_schedules.success) {
                        schedules.push(new_schedules.data);
                        setCache(appointmentTypeIdPaid, calendarId, getThisDate, new_schedules.data);
                    } else {
                        throw { success: false, code: 2 };
                    }
                } catch ({ code }) {
                    return setIsInactiveDay(code);
                }
            }

            schedules[0].forEach((date, index) => {
                const localTime = moment(date.time).tz(selectedZone);
                const hour = localTime.hour(); // heure locale de l'utilisateur

                // N'afficher que les crénaux entre 7h et 20h
                if (hour >= 7 && hour <= 20) { updatedResponseJsx.push(
                    <div className="roboto my-1" key={index} 
                        title={date.slotsAvailable === 1 ? null : "Cette horaire n'est pas disponible"}>
                        <button
                            className="text-base px-3 sm:px-4 py-2 rounded bg-portal-100
                            duration-150 text-portal-800 font-semibold w-full hover:bg-portal-200"
                            
                            value={`${date.time}`}
                            onClick={(e) => {
                                // console.log("formated value : ", e.target.value);

                                // GTM ville, type de rdv et motif
                                if(userPattern || city || appointmentChoosed) {
                                    let ville, type
                                    if (city === 'distance') { ville = 'Distanciel'} else { ville = city }

                                    if (visioFormation == true) {type = 'Rendez-vous visio formation'} 
                                    else if (residentiel == true) {type = 'Rendez-vous résidentiel'} 
                                    else if (appointmentChoosed) {type = 'Rendez-vous visio'} 
                                    else {type = 'Rendez-vous sur place'}

                                    window.dataLayer = window.dataLayer || [];
                                    window.dataLayer.push({
                                        'event': 'selection',
                                        'ville': ville,
                                        'type_rdv': type,
                                    });
                                }

                                setActiveConfirmation(false);
                                setHval(e.target.value);
                                setSelectedTimeStr(`${moment(date.time).format('LT')}`);
                            }}
                            disabled={date.slotsAvailable === 1 ? false : true}
                        >
                            {`${moment(date.time).tz(selectedZone).format("LT")}`}
                        </button>
                    </div>
                )};
            });
        
        } catch (e) {
            console.error(e);
            return setIsInactiveDay(9);
        }
        
        return updatedResponseJsx;
    };

    const toogleCalendarShow = () => {
        setCalendarShow((prev) => !prev);
    };
    if (isInactiveDay !== 2){
        return <div className={`flex flex-col mb-3 rounded-lg border border-solid border-slate-200 overflow-hidden duration-150 pt-3.5 px-3.5 ${calendarShow && "shadow-lg"} `}>
                {
                    days && <div className={`flex justify-between items-center cursor-pointer pb-3.5`} onClick={ toogleCalendarShow }>
                        <div className="flex flex-col justify-center">
                            <div className="text-base text-slate-700 font-bold">📆 {
                                moment(days).format('dddd').charAt(0).toUpperCase() + moment(days).format('dddd DD MMMM').slice(1)
                            } </div>
                            <div className="text-xs text-slate-700"> {
                                isInactiveDay === 1 ? "🟢 Ouvert" : isInactiveDay === 2 ? "🔴 Complet" : isInactiveDay === 3 ? "🔴 Week-end (Fermé)" : isInactiveDay === 9 ? "Erreur" : apiResponse === null ? "🟡 Chargement..." : "🟠 Vérifiez votre connexion internet"
                            }

                                { apiResponse && <span className="text-xs text-slate-500"> - {
                                    apiResponse.length === 0 ? "Aucun créneau disponible" : apiResponse.length === 1 ? `1 créneau disponible (heure ${selectedZone.split('/')[1] ? 'de ' + selectedZone.split('/')[1] : selectedZone})` : `${apiResponse.length} créneaux disponibles (heure ${selectedZone.split('/')[1] ? 'de ' + selectedZone.split('/')[1] : selectedZone})`
                                } </span> }

                            </div>
                        </div>

                        <div className="flex justify-center items-center font-medium cursor-pointer hover:bg-portal-400
                            text-portal-600 h-8 w-8 rounded-full hover:text-white duration-150">
                            <ChevronDown size={18} className={calendarShow ? "transform rotate-180 duration-150" : "duration-150"} />
                        </div>

                    </div>
                }

                { calendarShow && <div className="grid grid-cols-4 gap-1 py-3 -mx-3.5 px-3.5 border-t border-solid border-slate-200">

                        {
                            isInactiveDay === 1 ?
                                apiResponse === null || apiResponse === undefined ?
                                    placeholderCalendar.map((item, index) => {
                                        return <div key={index} title="Obtention des disponibilités en cours ..."
                                            className="text-sm font-bold px-4 sm:px-5 rounded-md py-2 my-2 w-full bg-slate-100 text-slate-400 animate-pulse hover:cursor-wait">00:00</div>
                                    })
                                    :
                                    apiResponse.map((object, index) => {
                                        return <Fragment key={index}>{object}</Fragment>
                                    }) // FULLY LOADED API RESPONSE
                                :
                                isInactiveDay === 3 ?
                                    <div
                                        className="text-sm col-span-4 font-bold rounded-md py-2 my-1 h-full bg-slate-100 text-slate-400 flex flex-col items-center justify-center"
                                        style={commonSizing}>
                                        <div className="text-center w-full">Week-End (Fermé)</div>
                                    </div>
                                    :
                                    <div
                                        className="text-sm font-bold col-span-4 rounded-md py-2 my-1 h-full bg-slate-50 text-slate-400 flex flex-col items-center justify-center"
                                        style={commonSizing}>
                                        <div className="text-center w-full">{isInactiveDay === 9 ?
                                            <span className=" text-xs font-thin">Vérifiez votre connexion Internet</span> : "Aucun créneau disponible"}</div>
                                    </div>
                        }
                    </div> }

            </div>
    } else {
        return false;
    }
}

export default React.memo(HoursSlotsMapper);

/*

apiResponse === [] ?
<div className="text-sm font-bold rounded-md py-2 my-1 h-full bg-slate-100 text-slate-400 flex flex-col items-center justify-center" style={{minWidth: "76px", maxWidth: "76px", minHeight: "130px"}}>
    <div className="-rotate-90 text-center w-full">Aucun créneau</div>
</div>

*/
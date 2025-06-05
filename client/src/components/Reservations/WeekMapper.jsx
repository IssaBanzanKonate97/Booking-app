import React, { useState, useRef } from 'react';
import { Calendar } from "@demark-pro/react-booking-calendar";
import "@demark-pro/react-booking-calendar/dist/react-booking-calendar.css";

function MyDateRangeCalendar({selectedWeek, setSelectedWeek, selectedDay, setSelectedDay, displayStage, setDisplayStage, requireAutoScroll}) {
  
  ///* SEMAINES *///
  const weekAndMonthValues = {
    0: ["1 semaine", "2 semaines", "3 semaines", "4 semaines", "+"], // Semaines
    1: ["-", "1 mois", "1,5 mois", "2 mois", "2,5 mois", "+"],         // Mois 1
    2: ["-", "3 mois", "4 mois", "5 mois", "6 mois"]                  // Mois 2
  };

  const WeekNumberSelection = () => {
    const containerRef = useRef(null);

    const handleButtonClick = (value) => {
      if (value === "+") {
        setDisplayStage((prev) => Math.min(prev + 1, 2));  // On passe à l'étape suivante, max = 2
        scrollToStart();
      } else if (value === "-") {
        setDisplayStage((prev) => Math.max(prev - 1, 0));  // On passe à l'étape précédente, min = 0
        scrollToStart();
      } else {
        setSelectedWeek(value);
        requireAutoScroll("selectWeeksStart", "end");
      }
    };

    const scrollToStart = () => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = 0;  // Remet le scroll horizontal au début
      }
    };

    return (
      <div ref={containerRef} className="overflow-x-auto pb-2" style={{display: 'flex', justifyContent: 'space-evenly'}}>
        {weekAndMonthValues[displayStage].map((value, index) => {
          const isSelected = selectedWeek === value;
          return (
            <button
              onClick={() => handleButtonClick(value)}
              key={index}
              className={`text-sm group h-10 flex flex-row items-center text-left roboto font-bold text-slate-600
                rounded-lg group duration-300 
                bg-slate-100 focus:outline-none
                cursor-pointer ml-1 mr-1
                ${isSelected ? 'bg-gradient-to-r from-portal-400 to-fusion-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
            >
              <p className="whitespace-nowrap text-ellipsis pl-4 pr-4">{value}</p>
            </button>
          );
        })}
      </div>
    );
  };
  

  ///* CALENDAR *///
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // Un jour en millisecondes

  // Calcul du prochain samedi
  let minDay = new Date(today.getTime()+ (oneDay * 6));
  minDay.setDate(minDay.getDate() + ((6 - minDay.getDay() + 7) % 7)); // Ajuste pour le prochain samedi

  // Bloque 1 semaine avant le premier rdv
  const firstBlock = {
    startDate: today,
    endDate: minDay,
  };

  // Bloque tous les jours suivants sauf le samedi sur 3 ans
  const otherBlocks  = Array.from({ length: 157 }, (_, i) => {
    const nextSaturday = new Date(minDay);
    nextSaturday.setDate(minDay.getDate() + i * 7);
    return {
      startDate: new Date(nextSaturday - 6 * oneDay),
      endDate: nextSaturday - oneDay,
    };
  });

  // Fusionne les 2 tableaux
  const reserved = [firstBlock, ...otherBlocks];

  return (
    <div>
      <WeekNumberSelection />
      <div id="selectWeeksStart">
        {selectedWeek && <Calendar
          selected={selectedDay}
          onChange={(newDay) => {
            setSelectedDay(newDay)
            requireAutoScroll("selectAppointmentIdCalendar", "end");
          }}
          reserved={reserved}
          range={false}
          protection={true}
          options={{ locale: "fr", weekStartsOn: 1, useAttributes: true }}
          classNames={{
            DaySelection: "bg-gradient-to-r from-portal-400 to-fusion-500 text-white",
          }}
        />}
      </div>
    </div>
  );
}

export default MyDateRangeCalendar;

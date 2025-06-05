const praticiens = {
    "visio_sarahnacass": { calendar: 4188028 },
    "visio_sarahnacass_2": { calendar: 8698217 },
};

const visio_tarifs = [

    // Valeur par défaut
    {
        name : "union-europeenne",
        appointmentTypeIdPaid : 67052452,
        appointmentTypeIdNotPaid: 67052463,
        acuityAddress: "https://us02web.zoom.us/j/89415032352?pwd=Rlp2dDU1ODhGektNZ01MRlg4UCs2Zz09",
        calendarId: { 
            0: praticiens["visio_sarahnacass"]["calendar"], 
        },
        acuityAPI : 1,
        tarif : {
            value : 26400,
            currency : "eur",
            symbol : "€"
        },
        formation: false,
        path: "/",
        idLocation: "1001",
    },

    // Prix au Canada
    {
        name : "canada",
        appointmentTypeIdPaid : 67053663,
        appointmentTypeIdNotPaid: 67053671,
        acuityAddress: "https://us02web.zoom.us/j/89415032352?pwd=Rlp2dDU1ODhGektNZ01MRlg4UCs2Zz09",
        calendarId: { 
            0: praticiens["visio_sarahnacass_2"]["calendar"],
        },
        acuityAPI : 2,
        tarif: {
            value : 39200,
            currency : "cad",
            symbol : "$CAD"
        },
        formation: false,
        path: "/ca/",
        idLocation: "1002",
    },

    // Prix au Maroc
    {
        name : "maroc",
        appointmentTypeIdPaid : 67053663,
        appointmentTypeIdNotPaid: 67053671,
        acuityAddress: "https://us02web.zoom.us/j/89415032352?pwd=Rlp2dDU1ODhGektNZ01MRlg4UCs2Zz09",
        calendarId: { 
            0: praticiens["visio_sarahnacass_2"]["calendar"],
        },
        acuityAPI : 2,
        tarif: {
            value : 39200,
            currency : "cad",
            symbol : "$CAD"
        },
        formation: false,
        path: "/ma/",
        idLocation: "1003",
    },

    // Valeur par défaut Formation
    {
        name : "union-europeenne",
        appointmentTypeIdPaid : 67104997,
        appointmentTypeIdNotPaid: 67105035,
        acuityAddress: "https://us02web.zoom.us/j/89415032352?pwd=Rlp2dDU1ODhGektNZ01MRlg4UCs2Zz09",
        calendarId: { 
            0: praticiens["visio_sarahnacass"]["calendar"], 
        },
        acuityAPI : 1,
        tarif : {
            value : 6900,
            currency : "eur",
            symbol : "€"
        },
        formation: true,
        path: "/",
        idLocation: "1004",
    },

    // Prix au Canada Formation
    {
        name : "canada",
        appointmentTypeIdPaid : 67105222,
        appointmentTypeIdNotPaid: 67105235,
        acuityAddress: "https://us02web.zoom.us/j/89415032352?pwd=Rlp2dDU1ODhGektNZ01MRlg4UCs2Zz09",
        calendarId: { 
            0: praticiens["visio_sarahnacass_2"]["calendar"],
        },
        acuityAPI : 2,
        tarif: {
            value : 10900,
            currency : "cad",
            symbol : "$CAD"
        },
        formation: true,
        path: "/ca/",
        idLocation: "1005",
    },

    // Prix au Maroc Formation
    {
        name : "maroc",
        appointmentTypeIdPaid : 67105222,
        appointmentTypeIdNotPaid: 67105235,
        acuityAddress: "https://us02web.zoom.us/j/89415032352?pwd=Rlp2dDU1ODhGektNZ01MRlg4UCs2Zz09",
        calendarId: { 
            0: praticiens["visio_sarahnacass_2"]["calendar"],
        },
        acuityAPI : 2,
        tarif: {
            value : 10900,
            currency : "cad",
            symbol : "$CAD"
        },
        formation: true,
        path: "/ma/",
        idLocation: "1006",
    },

];
export { visio_tarifs };


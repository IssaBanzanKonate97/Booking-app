import { locations, countriesDepthOfCoverage, residentiel } from "../shared_locations_datas/LOCATIONS_DATAS";
const axios = require("axios");
const isProductionEnv = process.env.NODE_ENV === "production" ? true : false;

function deg_rad(deg) {
  return deg * (Math.PI / 180)
};

function getDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; 
  var dLat = deg_rad(lat2 - lat1); 
  var dLon = deg_rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg_rad(lat1)) * Math.cos(deg_rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; 
  return d;
};

const addDispatcherToURL = (toAdd) => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.append("sID", toAdd);
  return urlParams.toString();
};

async function filterForEach(current) {
  var positionRatings = new Array(locations.length).fill(0);

  locations.forEach((position, index) => {
    var res = getDistance(current[0], current[1], position.latitude, position.longitude);
    var object = {
      path: `${position.path}?${addDispatcherToURL(`${position.pathId}`)}&alertUserAboutDispatcherSelection=true`,
      distance: res,
      region: position.geoZoneName,
      pays: position.country.name,
      ville: position.city
    };
    positionRatings[index] = object;
  });

  const closest = positionRatings.reduce((acc, loc) =>
    acc.distance < loc.distance ? acc : loc
  );

  return closest;
};

const getNavigatorLocation = async (successCb, errorCb) => {
  const options = {
    enableHighAccuracy: true,
  };

  return navigator.geolocation.getCurrentPosition(successCb, errorCb, options);
};

const getUrlParameter = (theParameter) => {
  var params = window.location.search.substring(1).split("&");
  for (var i = 0; i < params.length; i++) {
    var p = params[i].split("=");
    if (p[0] === theParameter) {
      return decodeURIComponent(p[1]);
    }
  }; return false;
};

function findNameFor(toFind) {
  const findCondition = (element) => element.path === toFind;
  const matchIndex = locations.findIndex(findCondition);
  return locations[matchIndex].geoZoneName;
};

function findResidentielNameFor(toFind) {
  const findCondition = (element) => element.path === toFind;
  const matchIndex = residentiel.findIndex(findCondition);
  return residentiel[matchIndex].geoZoneName;
};

const getObjectsThatIncludesInArray = (array, property, toMatch) => {
  return array.filter(element => element[property].includes(toMatch));
};

const getAllCountries = () => {
  const countries = locations.map(element => element.country.name);
  return [...new Set(countries)]; 
};

const getCountryNameFromCountryCode = (countryCode) => {
  const country = countriesDepthOfCoverage[countryCode];
  if (country === undefined) return null;
  return country.name;
};

const getGeoZonesForCountry = (countryName) => {
  return locations.filter(element => element.country.name === countryName);
};

const getGeoZonesForResidentiels = () => {
  return residentiel;
};

const getCorrectGeoZoneNameFromOneMatch = (match) => {
  const commonCountryCode = match.country.code;
  if (countriesDepthOfCoverage[commonCountryCode].depthOfCoverage === 2) {
    return match.geoZoneName;
  } else {
    return match.country.name;
  }
};

const resolveLocations = async (path) => {
  
  if (path == undefined) {
    return ["Sarah Nacass - Visio", "/visio", 0, "0123456789"];
  }

  const matchs = getObjectsThatIncludesInArray(locations, "path", path);
  const name = getCorrectGeoZoneNameFromOneMatch(matchs[0]);
  const lastPathId = matchs[matchs.length - 1].pathId; 
  const phone = matchs[0].phone;

  return ["Sarah Nacass - " + name, matchs, lastPathId, phone]; 
};

const resolveLocationsResidentiel = async () => {

  const matchs = getObjectsThatIncludesInArray(residentiel, "path", "/residentiel");
  const name = matchs[0].country.name;
  const lastPathId = matchs[matchs.length - 1].pathId;
  const phone = "+33 01 76 27 82 67";

  return ["Sarah Nacass - " + name, matchs, lastPathId, phone];
};

const updateObjectProperty = (object, setObject, selectedObjectStatement, newStatement) => {
  if (selectedObjectStatement === undefined || selectedObjectStatement === null) throw new Error("updateObject : Entries are not strings !");
  if (selectedObjectStatement.trim() === "") throw new Error("updateObject : Entries seems empty !");
  var updatedDatas = { ...object }
  updatedDatas[`${selectedObjectStatement}`] = newStatement;
  return setObject(updatedDatas);
};

const getCurrentSelectedDispatcher = (maxDispatcher) => {

  const rewriteUrlParameter = (newValue) => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    searchParams.set("sID", newValue);
    searchParams.delete("selectedDispatcher");

    window.history.replaceState({}, "", `${url.pathname}?${searchParams.toString()}`);
    return;
  };

  const _v_1 = getUrlParameter("selectedDispatcher");
  const _v_2 = getUrlParameter("sID");

  const response = _v_1 === false ? parseInt(_v_2) : parseInt(_v_1);

  if (_v_2 === false && _v_1 !== false) {
    rewriteUrlParameter(response);
  };

  /* Evaluation de la réponse */
  if (isNaN(response)) return 0;
  if (response > maxDispatcher || response < 0) return 0;

  return response;
};

const checkIfAppointmentWasAlreadyMade = () => {
  const lastBookingOperation = localStorage.getItem("last_booking_operation");

  const error = {
    status: false,
    datas: null,
  };

  if (lastBookingOperation === null || lastBookingOperation === undefined) return error;

  const lastBookingOperationObject = JSON.parse(lastBookingOperation);

  return {
    status: true,
    datas: lastBookingOperationObject,
  };
};

const checkIfAutoSelectionWasUsed = async () => {
  const autoSelectionEntry = sessionStorage.getItem("cache-AUAADS");
  if (autoSelectionEntry === null || autoSelectionEntry === undefined) return false;
  if (autoSelectionEntry === "1") {
    sessionStorage.clear();
    return true;
  }
  return false;
};

const checkIfAppointmentWasAlreadyAvailable = async (data) => {
  try {

    const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_CHECK_TIMES : process.env.REACT_APP_DEV_POST_CHECK_TIMES;

    const targetDate = new Date(data.clientSavedAtTime);
    const currentDate = new Date();

    if (data.typeId === 0) {
      const threeDaysFromNow = new Date(targetDate);
      threeDaysFromNow.setDate(targetDate.getDate() + 1);

      if (threeDaysFromNow < currentDate) {
        return false;
      }

    } else if (data.typeId === 1) {
      const sixHoursFromNow = new Date(targetDate);
      sixHoursFromNow.setHours(targetDate.getHours() + 1);

      if (sixHoursFromNow < currentDate) {
        return false;
      }
    }

    await axios.post(endpoint, {
        "typeId": data.typeId,
        "isoDate": data.isoDate,
        "appointmentTypeIdPaid": data.appointmentTypeIdPaid, 
        "calendarId": data.calendarId,
    }); 
    return true
  } catch { return false }
};

export { 
  resolveLocations, 
  resolveLocationsResidentiel,
  getAllCountries, 
  getGeoZonesForCountry, 
  getGeoZonesForResidentiels,
  checkIfAppointmentWasAlreadyMade, 
  findNameFor, 
  findResidentielNameFor,
  updateObjectProperty, 
  getCurrentSelectedDispatcher, 
  getUrlParameter, 
  getCountryNameFromCountryCode, 
  filterForEach, 
  getNavigatorLocation,
  checkIfAutoSelectionWasUsed,
  checkIfAppointmentWasAlreadyAvailable,
};
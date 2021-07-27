import '../index.html';

import '../styles/normalize.css';
import '../styles/style.css';
import {
    setLocationObject, 
    getWeatherFromCoords,
    getCoordsFromApi, 
    cleanText 
} from './dataFunction.js';
import { 
    setPlaceholderText,
    displayBackground ,
    displayError, 
    displayApiError, 
    updateDisplay
} from './domFunctions.js';
import { backgroundImages } from './backgroundImages';

import currentLocation from './currentLocation.js';



const currentLoc = new currentLocation();

const initApp = () => {
    //add listeners
    const unitButton = document.getElementById('unit');
    unitButton.addEventListener('click', setUnitPref);

    const imageButton = document.getElementById('background');
    imageButton.addEventListener('click', backgroundImages);

    const languageButton = document.getElementById('language');
    languageButton.addEventListener('click', changeLanguage);

    const refreshButton = document.getElementById('refresh');
    refreshButton.addEventListener('click', refreshWeather);

    const locationEntry = document.getElementById('search-bar__form');
    locationEntry.addEventListener('submit', submitNewLocation)

    //set up
    setPlaceholderText();
}

document.addEventListener('DOMContentLoaded', initApp);

function getGeoWeather() {
    if (!navigator.geolocation) return geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
}

const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not supported";
    displayError(errMsg);
};

const geoSuccess = (position) => {
   
    const myCoordsObj = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      
      name: `Your are here`
    };
    
    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);
};

const setUnitPref = () => {
    currentLoc.toggleUnit();
    updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
    getGeoWeather();
    document.getElementById("search-bar__text").value = "";
};

const submitNewLocation = async (event) => {
    event.preventDefault();
    const text = document.getElementById("search-bar__text").value;
    const entryText = cleanText(text);
    if (!entryText.length) return;
    const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
    console.log('coordsData' , coordsData)
    if (coordsData) {
        if (coordsData.cod === 200) {
            const myCoordsObj = {
            lat: coordsData.coord.lat,
            lon: coordsData.coord.lon,
            name: coordsData.sys.country
                ? `${coordsData.name}, ${coordsData.sys.country}`
                : coordsData.name
            };
            setLocationObject(currentLoc, myCoordsObj);
            updateDataAndDisplay(currentLoc);
        } else {
            displayApiError(coordsData);
        }
    } else {
        displayError("Connection Error");
    }
};

const updateDataAndDisplay = async (locationObj) => {
    const weatherJson = await getWeatherFromCoords(locationObj);
    if (weatherJson) updateDisplay(weatherJson, locationObj);
  };

const changeLanguage = () => {
    const arrow = document.querySelector('.fa-chevron-down');
    arrow.classList.toggle("arrow-down-open");

    const button = document.querySelector('.button-language-top');
    button.classList.toggle("top-open");

    const list = document.querySelector('.buttons-language-list');
    list.classList.toggle("list-open");
}

// Running App
backgroundImages()
getGeoWeather();
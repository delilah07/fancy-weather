import { backgroundImages } from './backgroundImages';

export const setPlaceholderText = () => {
    const input = document.getElementById("search-bar__text");
    window.innerWidth < 400
        ? (input.placeholder = "City, State, Country")
        : (input.placeholder = "City, State, Country, or Zip Code");
};

export const displayError = (headerMsg, srMsg) => {
    updateWeatherLocationHeader(headerMsg);
};

const updateWeatherLocationHeader = (message) => {
    const h1 = document.getElementById("current-forecast__location");
    if(message.indexOf('Lat:') !== -1 && message.indexOf('Long:')!== -1) {
        const msgArray = message.split(' ');
        const mapArray = msgArray.map(msg => {
            return msg.replace(':', ': ');
        })
        const lat = mapArray[0].indexOf('-') === -1 ? mapArray[0].slice(0, 10) : mapArray[0].slice(0, 11);
        const lon = mapArray[0].indexOf('-') === -1 ? mapArray[1].slice(0, 11) : mapArray[1].slice(0, 12);
        h1.textContent = `${lat} ${lon}`;
    } else {
        h1.textContent = message;
    }
    
}

export const displayApiError = (statusCode) => {
    const properMsg = toProperCase(statusCode.message);
    updateWeatherLocationHeader(properMsg);
    updateScreenReaderConfirmation(`${properMsg}. Please try again.`);
};

const toProperCase = (text) => {
    const words = text.split(" ");
    const properWords = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return properWords.join(" ");
};

export const updateDisplay = (weatherJson, locationObj) => {
    fadeDisplay();
    clearDisplay();
    // const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon); // под вопросом

    // backgroundImages(weatherClass);
    
    updateWeatherLocationHeader(locationObj.getName());
   
    // current conditions
    const ccArray = createCurrentConditionsDivs(
    weatherJson,
    locationObj.getUnit()
    );
    const mapArray = createMapDivs(
        weatherJson
        );
    displayCurrentConditions(ccArray);
    displayMap(mapArray);
    displaySixDayForecast(weatherJson);
    setFocusOnSearch();
    fadeDisplay();
};

const fadeDisplay = () => {
    const cc = document.getElementById("current-forecast");
    cc.classList.toggle("zero-vis");
    cc.classList.toggle("fade-in");

    const sixDay = document.getElementById("daily-forecast");
    sixDay.classList.toggle("zero-vis");
    sixDay.classList.toggle("fade-in");
};

const clearDisplay = () => {
    const currentConditions = document.getElementById("current-forecast__conditions");
    deleteContents(currentConditions);
    const sixDayForecast = document.getElementById("daily-forecast__contents");
    deleteContents(sixDayForecast);
    const mapCondition = document.getElementById("geolocation");
    deleteContents(mapCondition);
};

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};

const getWeatherClass = (icon) => {
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    const weatherLookup = {
        "09": "snow",
        10: "rain",
        11: "rain",
        13: "snow",
        50: "fog"
    };
    let weatherClass;
    if (weatherLookup[firstTwoChars]) {
        weatherClass = weatherLookup[firstTwoChars];
    } else if (lastChar === "d") {
        weatherClass = "clouds";
    } else {
        weatherClass = "night";
    }
    return weatherClass;
};

const setFocusOnSearch = () => {
    document.getElementById("search-bar__text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
    const tempUnit = unit === 'metric' ? 'C' : 'F';
    const windUnit = unit === 'metric' ? 'm/s' : 'mph';
    //console.log('weatherObj', weatherObj)
    const time = createElem(
        "div",
        "time",
        ''
        );
    let d = new Date()
    let localTime = d.getTime()
    let localOffset = d.getTimezoneOffset() * 60000
    let utc = localTime + localOffset
    let currentDate = new Date(utc + (1000 * weatherObj.timezone_offset));
    let currentDateString = String(currentDate).split(' ').slice(0, 5).join(' ')
    time.innerHTML = currentDateString;

    const icon = createMainImgDiv(
        weatherObj.current.weather[0].icon,
        weatherObj.current.weather[0].description
    );
    const temp = createElem(
    "div",
    "temp",
    `${Math.round(Number(weatherObj.current.temp))}°${tempUnit}`
    );
    const properDesc = toProperCase(weatherObj.current.weather[0].description);
    const desc = createElem("div", "desc", properDesc);
    const feels = createElem(
    "div",
    "feels",
    `Feels Like ${Math.round(Number(weatherObj.current.feels_like))}°${tempUnit}`
    );
    const maxTemp = createElem(
    "div",
    "maxtemp",
    `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°${tempUnit}`
    );
    const minTemp = createElem(
    "div",
    "mintemp",
    `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°${tempUnit}`
    );
    const humidity = createElem(
    "div",
    "humidity",
    `Humidity ${weatherObj.current.humidity}%`
    );
    const wind = createElem(
    "div",
    "wind",
    `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`
    );
    return [time,icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImgDiv = (icon, altText) => {
    const img = document.createElement("img");
    img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    img.alt = altText;
    return img;
};

const createMapDivs = (weatherObj) => {
    const map = createElem(
        "div",
        "map",
        ''
    );
   
    const mapURL = `<iframe class="geolocation-iframe" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBWWZnqHV3asW7DM3yCQ0dxSHjj_J9LkwE&amp;q=${weatherObj.lat},${weatherObj.lon}&zoom=10"></iframe>`;

    map.innerHTML = mapURL;
    const position = createElem(
        "div",
        "position",
        `Lat: ${weatherObj.lat} | Lon: ${weatherObj.lon}`
    );
    return [map, position]
}

const createElem = (elemType, divClassName, divText, unit) => {
    const div = document.createElement(elemType);
    div.className = divClassName;
    if (divText) {
      div.textContent = divText;
    }
    if (divClassName === "temp") {
      const unitDiv = document.createElement("div");
      unitDiv.className = "unit";
      unitDiv.textContent = unit;
      div.appendChild(unitDiv);
    }
    return div;
};

const displayCurrentConditions = (currentConditionsArray) => {
    const ccContainer = document.getElementById("current-forecast__conditions");
    currentConditionsArray.forEach((cc) => {
        ccContainer.appendChild(cc);
    });
};

const displayMap = (currentMapArray) => {
    const mapContainer = document.getElementById("geolocation");
    currentMapArray.forEach((map) => {
        mapContainer.appendChild(map);
    });
};

const displaySixDayForecast = (weatherJson) => {
    for (let i = 1; i <= 6; i++) {
      const dfArray = createDailyForecastDivs(weatherJson.daily[i]);
      displayDailyForecast(dfArray);
    }
};

const createDailyForecastDivs = (dayWeather) => {
    const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
    const dayAbbreviation = createElem(
        "p",
        "dayAbbreviation",
        dayAbbreviationText
    );
    const dayIcon = createDailyForecastIcon(
        dayWeather.weather[0].icon,
        dayWeather.weather[0].description
    );
    const dayHigh = createElem(
        "p",
        "dayHigh",
        `High ${Math.round(Number(dayWeather.temp.max))}°`
    );
    const dayLow = createElem(
        "p",
        "dayLow",
        `Low ${Math.round(Number(dayWeather.temp.min))}°`
    );
    return [dayAbbreviation, dayIcon, dayHigh, dayLow];
  };

const getDayAbbreviation = (data) => {
    const dateObj = new Date(data * 1000);
    const utcString = dateObj.toUTCString();
    return utcString.slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText) => {
    const img = document.createElement("img");
    if (window.innerWidth < 768 || window.innerHeight < 1025) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    } else {
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    img.alt = altText;
    return img;
};

const displayDailyForecast = (dfArray) => {
    const dayDiv = createElem("div", "forecastDay");
    dfArray.forEach((el) => {
       dayDiv.appendChild(el);
    });
    const dailyForecastContainer = document.getElementById("daily-forecast__contents");
    dailyForecastContainer.appendChild(dayDiv);
};
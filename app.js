// Select elements
const searchBtn = document.querySelector('#search-btn');
const appHeader = document.querySelector('#app-header');
const temp = document.querySelector('#temp');
const conditions = document.querySelector('#conditions');
const humidities = document.querySelector('#humidity');
const pressures = document.querySelector('#pressure');
const wind = document.querySelector('#wind');
const searchvalue = document.querySelector('#search-value');
const appHeaderScreen = document.querySelector('.app-header__screen');

let bodyIcons = document.querySelector('.app-body__icon');
let cityId;
let mainTitle = document.querySelector('#city-name');
let loader = document.querySelector('#loader');

// App data
const current = {};

current.temperature = {
    unit: "celsius"
};

const KELVIN = 273;

// API KEY
const KEY = 'b2bac8750d4b90c809c688456a5ad2cb';

// CHECK IF THE BROWSER SUPPORTS GEOLOCATION
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
    loader.innerHTML = `<img src="./img/loader.gif" alt="Loading results" width="80">`;
} else {
    mainTitle.innerHTML = "Location is not supported by browser.";
    loader.style.display = 'none';
}

// SHOW ERROR WHEN THERE IS AN ISSUE WITH GEOLOCATION SERVICE
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            mainTitle.innerHTML = "Location denied. Try manual search."
            loader.style.display = 'none';
            break;
        case error.POSITION_UNAVAILABLE:
            mainTitle.innerHTML = "Location information is unavailable."
            loader.style.display = 'none';
            break;
        case error.TIMEOUT:
            mainTitle.innerHTML = "Location request timed out."
            loader.style.display = 'none';
            break;
        case error.UNKNOWN_ERROR:
            mainTitle.innerHTML = "An unknown error."
            loader.style.display = 'none';
            break;
    }
}

// SET USER'S POSITION
function setPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    displayWeather(latitude, longitude);
}


// DISPLAY WHEATER FROM API PROVIDER
function displayWeather(latitude, longitude) {
    let api = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&
    exclude=hourly,daily,minutely&appid=${KEY}`;
    fetch(api)
        .then((response) => {
            let data = response.json();
            return data;
        })
        .then((data) => {
            let windSpeed = data.current.wind_speed;
            let timezone = data.timezone;
            let weatherIcon = data.current.weather[0].icon;
            let description = data.current.weather[0].description;
            let main = data.current.weather[0].main;
            let tempNow = Math.floor(data.current.temp - KELVIN);
            let humidity = Math.floor(data.current.humidity);
            let pressure = Math.floor(data.current.pressure);
            loader.style.display = 'none';
            if (searchvalue.value === '') {
                mainTitle.innerHTML = timezone;
            } else {
                mainTitle.innerHTML = searchvalue.value.toUpperCase();
            }


            temp.innerHTML = `${tempNow}°<span>C</span>`;
            conditions.innerHTML = `<img src=./img/${weatherIcon}.png alt="Weather conditions" class="weather-img"> 
                                        <span>${main}, ${description}</span>
        `;
            wind.innerText = windSpeed;
            humidities.innerText = humidity;
            pressures.innerText = pressure;

        })
        .catch(showError);
}

function findCity() {
    const citySearch = searchvalue.value;

    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: citySearch,
                key: 'AIzaSyBqI4_07koFtGiQmvN9lb7gZcTN5jZMUs4'
            }
        })
        .then((response) => {
            var lat = response.data.results[0].geometry.location.lat;
            var lng = response.data.results[0].geometry.location.lng;
            displayWeather(lat, lng);
        })
        .catch(showError);
}

searchBtn.addEventListener('click', findCity, false);

// Make sure serviceWorker are supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./sw.js')
            .then(reg => console.log(`Service Worker: Registered: ${reg}`))
            .catch(err => console.log(`Service Worker: Error: ${err}`));
    }, false);
}

// Make a localStorage
localStorage.setItem('searchListing', findCity);

const saved = localStorage.getItem('searchListing');

// check if it exists and if so set HTML to value
if (saved) {
    findCity = saved;
}
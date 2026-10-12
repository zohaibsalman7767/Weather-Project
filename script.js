
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

// HTML elements
const cityName = document.getElementById("cityName");
const localTime = document.getElementById("localTime");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const feelsLike = document.getElementById("feelsLike");
const feelsLikeDetail = document.getElementById("feelsLikeDetail");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const precipitation = document.getElementById("precipitation");

// Weather codes from Open-Meteo
function getWeatherInfo(code, isDay) {
    if (code === 0) {
        return {
            text: "Clear sky",
            icon: isDay ? "☀️" : "🌙"
        };
    }

    if (code === 1 || code === 2) {
        return {
            text: "Partly cloudy",
            icon: isDay ? "🌤️" : "☁️"
        };
    }

    if (code === 3) {
        return { text: "Overcast", icon: "☁️" };
    }

    if ([45, 48].includes(code)) {
        return { text: "Foggy", icon: "🌫️" };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return { text: "Drizzle", icon: "🌦️" };
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { text: "Rainy", icon: "🌧️" };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { text: "Snowy", icon: "❄️" };
    }

    if ([95, 96, 99].includes(code)) {
        return { text: "Thunderstorm", icon: "⛈️" };
    }

    return { text: "Unknown conditions", icon: "🌡️" };
}

// Search form submit event
searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
    message.textContent = "Getting weather information...";

    try {
        // Step 1: Find the city's coordinates
        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try another name.");
        }

        const place = geoData.results[0];
        const latitude = place.latitude;
        const longitude = place.longitude;

        // Step 2: Get the current weather
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,` +
            `is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Step 3: Get weather description and icon
        const info = getWeatherInfo(
            current.weather_code,
            current.is_day
        );

        // Step 4: Display the results
        const locationParts = [place.name];

        if (place.admin1 && place.admin1 !== place.name) {
            locationParts.push(place.admin1);
        }

        if (place.country) {
            locationParts.push(place.country);
        }

        cityName.textContent = locationParts.join(", ");
        weatherIcon.textContent = info.icon;
        temperature.textContent =
            `${Math.round(current.temperature_2m)}°C`;

        condition.textContent = info.text;

        feelsLike.textContent =
            `Feels like ${Math.round(current.apparent_temperature)}°C`;

        feelsLikeDetail.textContent =
            `${Math.round(current.apparent_temperature)}°C`;

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        windSpeed.textContent =
            `${current.wind_speed_10m} km/h`;

        precipitation.textContent =
            `${current.precipitation} mm`;

        // Show the city's local date and time
        const cityDate = new Date(weatherData.current.time);

        localTime.textContent = new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: weatherData.timezone
        }).format(cityDate);

        weatherCard.hidden = false;
        message.textContent = "Weather updated successfully!";

    } catch (error) {
        message.textContent = error.message.includes("fetch")
            ? "Network error. Please check your internet connection."
            : error.message;

        weatherCard.hidden = true;

    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
});

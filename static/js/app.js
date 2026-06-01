const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // REPLACE WITH YOUR REAL KEY

const FALLBACK_DISTRICTS = [
    { name: "Ariyalur", lat: 11.1394, lon: 79.0735 },
    { name: "Chengalpattu", lat: 12.6841, lon: 79.9836 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
    { name: "Cuddalore", lat: 11.7480, lon: 79.7714 },
    { name: "Dharmapuri", lat: 12.1273, lon: 78.1582 },
    { name: "Dindigul", lat: 10.3673, lon: 77.9803 },
    { name: "Erode", lat: 11.3410, lon: 77.7172 },
    { name: "Kallakurichi", lat: 11.7383, lon: 78.9639 },
    { name: "Kanchipuram", lat: 12.8342, lon: 79.7036 },
    { name: "Kanyakumari", lat: 8.0883, lon: 77.5385 },
    { name: "Karur", lat: 10.9601, lon: 78.0766 },
    { name: "Krishnagiri", lat: 12.5186, lon: 78.2137 },
    { name: "Madurai", lat: 9.9252, lon: 78.1198 },
    { name: "Mayiladuthurai", lat: 11.1030, lon: 79.6521 },
    { name: "Nagapattinam", lat: 10.7672, lon: 79.8449 },
    { name: "Namakkal", lat: 11.2189, lon: 78.1674 },
    { name: "Nilgiris (Ooty)", lat: 11.4102, lon: 76.6991 },
    { name: "Perambalur", lat: 11.2342, lon: 78.8820 },
    { name: "Pudukkottai", lat: 10.3833, lon: 78.8167 },
    { name: "Ramanathapuram", lat: 9.3639, lon: 78.8395 },
    { name: "Ranipet", lat: 12.9275, lon: 79.3325 },
    { name: "Salem", lat: 11.6643, lon: 78.1460 },
    { name: "Sivaganga", lat: 9.8433, lon: 78.4809 },
    { name: "Tenkasi", lat: 8.9591, lon: 77.3149 },
    { name: "Thanjavur", lat: 10.7870, lon: 79.1378 },
    { name: "Theni", lat: 10.0104, lon: 77.4768 },
    { name: "Thoothukudi", lat: 8.7642, lon: 78.1348 },
    { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047 },
    { name: "Tirunelveli", lat: 8.7139, lon: 77.7567 },
    { name: "Tirupathur", lat: 12.4942, lon: 78.5663 },
    { name: "Tiruppur", lat: 11.1085, lon: 77.3411 },
    { name: "Tiruvallur", lat: 13.1437, lon: 79.9111 },
    { name: "Tiruvannamalai", lat: 12.2274, lon: 79.0700 },
    { name: "Tiruvarur", lat: 10.7722, lon: 79.6362 },
    { name: "Vellore", lat: 12.9165, lon: 79.1325 },
    { name: "Viluppuram", lat: 11.9401, lon: 79.4861 },
    { name: "Virudhunagar", lat: 9.5872, lon: 77.9514 }
];

let TN_DISTRICTS = [];

let charts = {
    temp: null,
    precip: null,
    wind: null,
    cloud: null
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/districts');
        if (response.ok) {
            TN_DISTRICTS = await response.json();
        } else {
            console.warn("Failed to load districts from SQL database, using fallback.");
            TN_DISTRICTS = FALLBACK_DISTRICTS;
        }
    } catch (e) {
        console.warn("Error fetching districts, using fallback.");
        TN_DISTRICTS = FALLBACK_DISTRICTS;
    }

    initDropdown();
    if (TN_DISTRICTS.length > 0) {
        // Default Chennai
        const defaultDistrict = TN_DISTRICTS.find(d => d.name === "Chennai") || TN_DISTRICTS[0];
        loadWeatherData(defaultDistrict);
    }
    setInterval(updateTime, 1000);
    updateTime();
});

function updateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleString('en-US', { 
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    });
}

function initDropdown() {
    const select = document.getElementById('districtSelect');
    const trigger = select.querySelector('.custom-select__trigger');
    const list = document.getElementById('districtList');
    const search = document.getElementById('districtSearch');

    // Populate options
    function renderList(filter = "") {
        console.log("Refreshing district list. Filter:", filter);
        list.innerHTML = '';
        const filtered = TN_DISTRICTS.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()));
        
        filtered.forEach(district => {
            const item = document.createElement('div');
            item.className = 'custom-option';
            item.innerHTML = `<i class="bi bi-geo-alt"></i> <span>${district.name}</span>`;
            
            // Direct click handler for maximum reliability
            item.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Clicked district:", district.name);
                
                trigger.querySelector('span').textContent = district.name;
                select.classList.remove('open');
                
                loadWeatherData(district);
            };
            list.appendChild(item);
        });
    }

    trigger.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = select.classList.toggle('open');
        console.log("Dropdown open state:", isOpen);
        if (isOpen) {
            search.value = '';
            renderList();
            setTimeout(() => search.focus(), 50);
        }
    };

    search.addEventListener('input', (e) => {
        renderList(e.target.value);
    });

    search.addEventListener('click', (e) => e.stopPropagation());

    window.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });

    renderList();
}

async function loadWeatherData(district) {
    const { lat, lon, name } = district;
    console.log(`Fetching weather for: ${name} (${lat}, ${lon})`);
    
    // UI Loading state
    document.getElementById('cityName').textContent = name;
    document.getElementById('weatherDesc').textContent = "Updating data...";
    document.getElementById('currentTemp').textContent = "--°";
    
    const hero = document.getElementById('currentWeather');
    hero.classList.remove('fade-in');
    void hero.offsetWidth;
    hero.classList.add('fade-in');

    try {
        const [owmRes, meteoRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`).catch(e => ({ ok: false })),
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,cloudcover_max,relative_humidity_2m_max&hourly=visibility&timezone=auto`)
        ]);

        let owmData = {};
        if (owmRes.ok) owmData = await owmRes.json();
        const meteoData = await meteoRes.json();

        if (owmRes.ok && owmData.main) {
            updateCurrentUI(owmData);
        } else {
            console.warn("OWM data unavailable. Using Open-Meteo fallback.");
            updateCurrentUIFallback(meteoData, name);
        }

        renderCharts(meteoData);
        renderForecast(meteoData);
        
        saveToDatabase(name, owmData, meteoData);

        console.log("Dashboard updated successfully for", name);
    } catch (error) {
        console.error("Critical error in data load:", error);
        document.getElementById('weatherDesc').textContent = "Error loading data";
    }
}

async function saveToDatabase(districtName, owmData, meteoData) {
    try {
        let current = null;
        if (owmData && owmData.main) {
            current = {
                temp: owmData.main.temp,
                humidity: owmData.main.humidity,
                wind_speed: owmData.wind.speed,
                condition: owmData.weather[0].description
            };
        } else if (meteoData && meteoData.daily) {
            current = {
                temp: meteoData.daily.temperature_2m_max[0],
                humidity: meteoData.daily.relative_humidity_2m_max[0],
                wind_speed: meteoData.daily.windspeed_10m_max[0],
                condition: "Atmospheric Update"
            };
        }

        let forecast = [];
        if (meteoData && meteoData.daily) {
            const daily = meteoData.daily;
            for (let i = 0; i < 5; i++) {
                let icon = 'bi-cloud-sun';
                if (daily.precipitation_sum[i] > 1) icon = 'bi-cloud-rain';
                if (daily.temperature_2m_max[i] > 35) icon = 'bi-sun';
                
                forecast.push({
                    date: daily.time[i],
                    max_temp: daily.temperature_2m_max[i],
                    min_temp: daily.temperature_2m_min[i],
                    precipitation: daily.precipitation_sum[i],
                    icon: icon
                });
            }
        }

        const response = await fetch('/api/weather/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ district_name: districtName, current, forecast })
        });
        const result = await response.json();
        console.log("DB Save Result:", result);
    } catch (e) {
        console.error("Failed to save weather data to DB", e);
    }
}

function updateCurrentUI(data) {
    document.getElementById('currentTemp').textContent = `${Math.round(data.main.temp)}°`;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('visibility').textContent = `${data.visibility / 1000} km`;
    
    const iconCode = data.weather[0].icon;
    const iconMap = {
        '01': 'bi-sun', '02': 'bi-cloud-sun', '03': 'bi-cloud', '04': 'bi-clouds',
        '09': 'bi-cloud-rain', '10': 'bi-cloud-rain-heavy', '11': 'bi-cloud-lightning',
        '13': 'bi-snow', '50': 'bi-cloud-fog'
    };
    const baseCode = iconCode.substring(0, 2);
    document.getElementById('weatherIcon').className = `bi ${iconMap[baseCode] || 'bi-cloud'}`;
}

function updateCurrentUIFallback(meteo, name) {
    const daily = meteo.daily;
    const hourly = meteo.hourly;
    
    document.getElementById('currentTemp').textContent = `${Math.round(daily.temperature_2m_max[0])}°`;
    document.getElementById('weatherDesc').textContent = "Atmospheric Update";
    document.getElementById('humidity').textContent = `${daily.relative_humidity_2m_max[0]}%`;
    document.getElementById('windSpeed').textContent = `${daily.windspeed_10m_max[0]} km/h`;
    
    // Visibility fallback from hourly data
    if (hourly && hourly.visibility) {
        document.getElementById('visibility').textContent = `${Math.round(hourly.visibility[0] / 1000)} km`;
    } else {
        document.getElementById('visibility').textContent = "10 km";
    }

    document.getElementById('weatherIcon').className = `bi bi-cloud-sun`;
}

function renderCharts(data) {
    const daily = data.daily;
    const labels = daily.time.map(t => new Date(t).toLocaleDateString('en-US', { weekday: 'short' }));

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: { 
            legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'Outfit', size: 11 } } },
            tooltip: { backgroundColor: 'rgba(10, 20, 30, 0.9)', titleFont: { family: 'Outfit' }, bodyFont: { family: 'Outfit' } }
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }
        }
    };

    // Helper to clear and create chart
    const updateChart = (id, type, datasets) => {
        const key = id.replace('Chart', '');
        if (charts[key]) charts[key].destroy();
        const ctx = document.getElementById(id).getContext('2d');
        charts[key] = new Chart(ctx, { type, data: { labels, datasets }, options: commonOptions });
    };

    updateChart('tempChart', 'line', [{
        label: 'High Temp (°C)',
        data: daily.temperature_2m_max,
        borderColor: '#00d2ff',
        backgroundColor: 'rgba(0, 210, 255, 0.1)',
        fill: true, tension: 0.4
    }, {
        label: 'Low Temp (°C)',
        data: daily.temperature_2m_min,
        borderColor: '#3a7bd5',
        borderDash: [5, 5],
        tension: 0.4
    }]);

    updateChart('precipChart', 'bar', [{
        label: 'Humidity %',
        data: daily.relative_humidity_2m_max,
        backgroundColor: 'rgba(58, 123, 213, 0.4)',
        borderRadius: 8
    }, {
        label: 'Rain (mm)',
        data: daily.precipitation_sum,
        backgroundColor: '#00d2ff',
        borderRadius: 8
    }]);

    updateChart('windChart', 'line', [{
        label: 'Wind Speed (km/h)',
        data: daily.windspeed_10m_max,
        borderColor: '#f1c40f',
        backgroundColor: 'rgba(241, 196, 15, 0.1)',
        fill: true, tension: 0.4
    }]);

    updateChart('cloudChart', 'bar', [{
        label: 'Cloud Cover %',
        data: daily.cloudcover_max,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8
    }]);
}

function renderForecast(data) {
    const grid = document.getElementById('forecastGrid');
    grid.innerHTML = '';
    const daily = data.daily;
    
    for (let i = 0; i < 5; i++) {
        const dayName = new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' });
        const card = document.createElement('div');
        card.className = 'forecast-card glass-card fade-in';
        card.style.animationDelay = `${i * 0.1}s`;
        
        // Simple heuristic for icons in forecast
        let icon = 'bi-cloud-sun';
        if (daily.precipitation_sum[i] > 1) icon = 'bi-cloud-rain';
        if (daily.temperature_2m_max[i] > 35) icon = 'bi-sun';

        card.innerHTML = `
            <div class="day">${dayName}</div>
            <i class="bi ${icon}"></i>
            <div class="temps">
                <span class="high">${Math.round(daily.temperature_2m_max[i])}°</span>
                <span class="low">${Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
        `;
        grid.appendChild(card);
    }
}

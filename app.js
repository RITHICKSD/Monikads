const TN_DISTRICTS = [
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

const WEATHER_CODES = {
    0: { desc: "Clear Sky", icon: "bi-sun" },
    1: { desc: "Mainly Clear", icon: "bi-cloud-sun" },
    2: { desc: "Partly Cloudy", icon: "bi-cloud-sun" },
    3: { desc: "Overcast", icon: "bi-cloud" },
    45: { desc: "Fog", icon: "bi-cloud-fog" },
    48: { desc: "Depositing Rime Fog", icon: "bi-cloud-fog" },
    51: { desc: "Light Drizzle", icon: "bi-cloud-drizzle" },
    53: { desc: "Moderate Drizzle", icon: "bi-cloud-drizzle" },
    55: { desc: "Dense Drizzle", icon: "bi-cloud-drizzle" },
    61: { desc: "Slight Rain", icon: "bi-cloud-rain" },
    63: { desc: "Moderate Rain", icon: "bi-cloud-rain" },
    65: { desc: "Heavy Rain", icon: "bi-cloud-rain-heavy" },
    80: { desc: "Rain Showers", icon: "bi-cloud-rain" },
    95: { desc: "Thunderstorm", icon: "bi-cloud-lightning-rain" }
};

let tempChart, precipChart;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initDistrictSelector();
    loadWeatherData(TN_DISTRICTS[2]); // Default to Chennai
    updateDate();
});

function updateDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', options);
}

function initDistrictSelector() {
    const trigger = document.querySelector('.custom-select__trigger');
    const districtList = document.getElementById('districtList');
    const select = document.getElementById('districtSelect');
    const searchInput = document.getElementById('districtSearch');

    // Populate options
    function populateDistricts(filter = "") {
        districtList.innerHTML = '';
        const filtered = TN_DISTRICTS.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()));
        
        filtered.forEach(district => {
            const div = document.createElement('div');
            div.classList.add('custom-option');
            div.innerHTML = `<i class="bi bi-geo-alt"></i> ${district.name}`;
            div.onclick = (e) => {
                e.stopPropagation();
                trigger.querySelector('span').textContent = district.name;
                select.classList.remove('open');
                loadWeatherData(district);
            };
            districtList.appendChild(div);
        });
    }

    populateDistricts();

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        select.classList.toggle('open');
        if (select.classList.contains('open')) {
            searchInput.focus();
        }
    });

    searchInput.addEventListener('input', (e) => {
        populateDistricts(e.target.value);
    });

    searchInput.addEventListener('click', (e) => e.stopPropagation());

    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });
}

async function loadWeatherData(district) {
    const { lat, lon, name } = district;
    document.getElementById('cityName').textContent = name;
    
    const hero = document.querySelector('.hero-section');
    hero.classList.remove('fade-in');
    void hero.offsetWidth;
    hero.classList.add('fade-in');

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,relative_humidity_2m_max&timezone=auto`);
        const data = await response.json();
        
        updateUI(data);
        renderCharts(data);
        renderForecast(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function updateUI(data) {
    const current = data.current_weather;
    const daily = data.daily;
    const weather = WEATHER_CODES[current.weathercode] || { desc: "Unknown", icon: "bi-question" };

    document.getElementById('currentTemp').textContent = `${Math.round(current.temperature)}°`;
    document.getElementById('weatherDesc').textContent = weather.desc;
    document.getElementById('weatherIcon').className = `bi ${weather.icon}`;
    document.getElementById('humidity').textContent = `${daily.relative_humidity_2m_max[0]}%`;
    document.getElementById('windSpeed').textContent = `${current.windspeed} km/h`;
    document.getElementById('rainProb').textContent = `${daily.precipitation_sum[0]} mm`;
}

function renderCharts(data) {
    const daily = data.daily;
    const labels = daily.time.map(t => new Date(t).toLocaleDateString('en-US', { weekday: 'short' }));

    // Temperature Chart
    if (tempChart) tempChart.destroy();
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'High (°C)',
                data: daily.temperature_2m_max,
                borderColor: '#00d2ff',
                backgroundColor: 'rgba(0, 210, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00d2ff',
                pointRadius: 4
            }, {
                label: 'Low (°C)',
                data: daily.temperature_2m_min,
                borderColor: '#3a7bd5',
                borderDash: [5, 5],
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: chartOptions()
    });

    // Humidity/Rain Chart
    if (precipChart) precipChart.destroy();
    const ctxPrecip = document.getElementById('precipChart').getContext('2d');
    precipChart = new Chart(ctxPrecip, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity %',
                data: daily.relative_humidity_2m_max,
                backgroundColor: 'rgba(58, 123, 213, 0.4)',
                borderColor: '#3a7bd5',
                borderWidth: 1,
                borderRadius: 10
            }, {
                label: 'Rain (mm)',
                data: daily.precipitation_sum.map(v => v * 10), // Scale for visibility
                backgroundColor: 'rgba(0, 210, 255, 0.7)',
                borderRadius: 10
            }]
        },
        options: chartOptions()
    });
}

function chartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'Outfit', size: 12 } }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { family: 'Outfit' },
                bodyFont: { family: 'Outfit' },
                padding: 15,
                displayColors: false
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'Outfit' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'Outfit' } }
            }
        },
        interaction: { intersect: false, mode: 'index' }
    };
}

function renderForecast(data) {
    const grid = document.getElementById('forecastGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const weather = WEATHER_CODES[data.daily.weathercode[i]] || { desc: "Unknown", icon: "bi-question" };
        const day = new Date(data.daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' });
        
        const card = document.createElement('div');
        card.className = 'forecast-card glass-card fade-in';
        card.style.animationDelay = `${i * 0.1}s`;
        card.innerHTML = `
            <div class="day">${day}</div>
            <i class="bi ${weather.icon}"></i>
            <div class="temps">
                <span class="high">${Math.round(data.daily.temperature_2m_max[i])}°</span>
                <span class="low">${Math.round(data.daily.temperature_2m_min[i])}°</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 10px">${weather.desc}</div>
        `;
        grid.appendChild(card);
    }
}

import sqlite3
from flask import Flask, render_template, jsonify, request
from datetime import datetime

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('weather.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS districts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL UNIQUE,
                  lat REAL NOT NULL,
                  lon REAL NOT NULL)''')
    
    # Table 2: current_weather
    c.execute('''CREATE TABLE IF NOT EXISTS current_weather
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  district_name TEXT NOT NULL,
                  temperature REAL,
                  humidity INTEGER,
                  wind_speed REAL,
                  condition TEXT,
                  updated_at DATETIME,
                  UNIQUE(district_name))''')
                  
    # Table 3: forecast_data
    c.execute('''CREATE TABLE IF NOT EXISTS forecast_data
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  district_name TEXT NOT NULL,
                  forecast_date TEXT NOT NULL,
                  max_temp REAL,
                  min_temp REAL,
                  precipitation REAL,
                  condition_icon TEXT,
                  updated_at DATETIME,
                  UNIQUE(district_name, forecast_date))''')
    
    # Check if data exists in districts
    c.execute('SELECT COUNT(*) FROM districts')
    if c.fetchone()[0] == 0:
        districts = [
            ("Ariyalur", 11.1394, 79.0735),
            ("Chengalpattu", 12.6841, 79.9836),
            ("Chennai", 13.0827, 80.2707),
            ("Coimbatore", 11.0168, 76.9558),
            ("Cuddalore", 11.7480, 79.7714),
            ("Dharmapuri", 12.1273, 78.1582),
            ("Dindigul", 10.3673, 77.9803),
            ("Erode", 11.3410, 77.7172),
            ("Kallakurichi", 11.7383, 78.9639),
            ("Kanchipuram", 12.8342, 79.7036),
            ("Kanyakumari", 8.0883, 77.5385),
            ("Karur", 10.9601, 78.0766),
            ("Krishnagiri", 12.5186, 78.2137),
            ("Madurai", 9.9252, 78.1198),
            ("Mayiladuthurai", 11.1030, 79.6521),
            ("Nagapattinam", 10.7672, 79.8449),
            ("Namakkal", 11.2189, 78.1674),
            ("Nilgiris (Ooty)", 11.4102, 76.6991),
            ("Perambalur", 11.2342, 78.8820),
            ("Pudukkottai", 10.3833, 78.8167),
            ("Ramanathapuram", 9.3639, 78.8395),
            ("Ranipet", 12.9275, 79.3325),
            ("Salem", 11.6643, 78.1460),
            ("Sivaganga", 9.8433, 78.4809),
            ("Tenkasi", 8.9591, 77.3149),
            ("Thanjavur", 10.7870, 79.1378),
            ("Theni", 10.0104, 77.4768),
            ("Thoothukudi", 8.7642, 78.1348),
            ("Tiruchirappalli", 10.7905, 78.7047),
            ("Tirunelveli", 8.7139, 77.7567),
            ("Tirupathur", 12.4942, 78.5663),
            ("Tiruppur", 11.1085, 77.3411),
            ("Tiruvallur", 13.1437, 79.9111),
            ("Tiruvannamalai", 12.2274, 79.0700),
            ("Tiruvarur", 10.7722, 79.6362),
            ("Vellore", 12.9165, 79.1325),
            ("Viluppuram", 11.9401, 79.4861),
            ("Virudhunagar", 9.5872, 77.9514)
        ]
        c.executemany('INSERT INTO districts (name, lat, lon) VALUES (?, ?, ?)', districts)
        conn.commit()
    conn.close()

init_db()

def get_db_connection():
    conn = sqlite3.connect('weather.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/districts')
def api_districts():
    conn = get_db_connection()
    districts = conn.execute('SELECT * FROM districts ORDER BY name').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in districts])

@app.route('/api/weather/update', methods=['POST'])
def update_weather():
    data = request.json
    district_name = data.get('district_name')
    current = data.get('current')
    forecast = data.get('forecast')
    
    if not district_name:
        return jsonify({"error": "district_name is required"}), 400
        
    conn = get_db_connection()
    c = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Update current_weather
    if current:
        c.execute('''INSERT INTO current_weather (district_name, temperature, humidity, wind_speed, condition, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON CONFLICT(district_name) DO UPDATE SET
                     temperature=excluded.temperature,
                     humidity=excluded.humidity,
                     wind_speed=excluded.wind_speed,
                     condition=excluded.condition,
                     updated_at=excluded.updated_at''',
                  (district_name, current.get('temp'), current.get('humidity'), current.get('wind_speed'), current.get('condition'), now))
                  
    # Update forecast_data
    if forecast and isinstance(forecast, list):
        for day in forecast:
            c.execute('''INSERT INTO forecast_data (district_name, forecast_date, max_temp, min_temp, precipitation, condition_icon, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT(district_name, forecast_date) DO UPDATE SET
                         max_temp=excluded.max_temp,
                         min_temp=excluded.min_temp,
                         precipitation=excluded.precipitation,
                         condition_icon=excluded.condition_icon,
                         updated_at=excluded.updated_at''',
                      (district_name, day.get('date'), day.get('max_temp'), day.get('min_temp'), day.get('precipitation'), day.get('icon'), now))
    
    conn.commit()
    conn.close()
    
    return jsonify({"status": "success", "message": "Weather data saved to DB successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

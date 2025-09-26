<template>
  <div class="sensor-data-container">
    <h1>IoT Dashboard</h1>
    
    <!-- Servo Control Section -->
    <div class="control-section">
      <h2>Servo Control</h2>
      <div class="servo-control">
        <label for="servoSlider">Servo Position: {{ servoPosition }}°</label>
        <input 
          id="servoSlider"
          type="range" 
          min="0" 
          max="180" 
          v-model="servoPosition"
          @input="updateServo"
          class="slider"
        />
        <div class="servo-buttons">
          <button @click="setServoPosition(0)" class="servo-btn">0°</button>
          <button @click="setServoPosition(90)" class="servo-btn">90°</button>
          <button @click="setServoPosition(180)" class="servo-btn">180°</button>
        </div>
        <div v-if="servoStatus" class="servo-status">{{ servoStatus }}</div>
      </div>
    </div>

    <!-- Sensor Data Section -->
    <div class="data-section">
      <h2>Sensor Data</h2>
      <div v-if="loading" class="loading">Loading data...</div>
      <div v-else-if="error" class="error">Error: {{ error }}</div>
      <div v-else>
        <div class="data-count">Total Records: {{ sensorData.length }}</div>
        <ul class="sensor-list">
          <li v-for="data in sensorData" :key="data.id" class="sensor-item">
            <div class="data-row">
              <span class="temperature">Temperature: {{ data.temperature }}°C</span>
              <span class="humidity">Humidity: {{ data.humidity }}%</span>
              <span v-if="data.servoPosition !== undefined" class="servo-pos">
                Servo: {{ data.servoPosition }}°
              </span>
              <span class="timestamp" v-if="data.timestamp">
                {{ formatTimestamp(data.timestamp) }}
              </span>
            </div>
          </li>
        </ul>
        <button @click="fetchData" class="refresh-btn">Refresh Data</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SensorData',
  data() {
    return {
      sensorData: [],
      loading: false,
      error: null,
      servoPosition: 90,
      servoStatus: '',
      // Replace with the IP addresses of your devices
      serverUrl: 'https://corie-pareve-cruisingly.ngrok-free.dev/data',
      nodeMcuUrl: 'http://172.20.3.161/servo'
    };
  },
  created() {
    this.fetchData();
    this.getCurrentServoPosition();
    // Auto-refresh every 30 seconds
    this.interval = setInterval(this.fetchData, 30000);
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(this.serverUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        this.sensorData = await response.json();
        console.log('Fetched sensor data:', this.sensorData);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        this.error = `Failed to fetch data: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
    
    async getCurrentServoPosition() {
      try {
        const response = await fetch(this.nodeMcuUrl);
        if (response.ok) {
          const data = await response.json();
          this.servoPosition = data.position || 90;
        }
      } catch (error) {
        console.log('Could not get current servo position:', error.message);
      }
    },
    
    async updateServo() {
      await this.sendServoCommand(this.servoPosition);
    },
    
    async setServoPosition(position) {
      this.servoPosition = position;
      await this.sendServoCommand(position);
    },
    
    async sendServoCommand(position) {
      try {
        this.servoStatus = 'Updating servo...';
        
        const response = await fetch(this.nodeMcuUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ position: position })
        });
        
        if (response.ok) {
          const result = await response.json();
          this.servoStatus = `Servo moved to ${result.position}°`;
          setTimeout(() => { this.servoStatus = ''; }, 3000);
        } else {
          this.servoStatus = 'Failed to update servo';
        }
      } catch (error) {
        console.error('Error controlling servo:', error);
        this.servoStatus = `Error: ${error.message}`;
      }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return 'No timestamp';
      
      // Handle Firestore timestamp
      if (timestamp && timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleString();
      }
      
      // Handle regular date string/number
      return new Date(timestamp).toLocaleString();
    }
  }
};
</script>

<style scoped>
.sensor-data-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #FFFFFF;
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

.control-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.servo-control {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.servo-control label {
  font-weight: bold;
  color: #333;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
  border: none;
}

.servo-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.servo-btn {
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.servo-btn:hover {
  background-color: #1976d2;
}

.servo-status {
  text-align: center;
  padding: 10px;
  background-color: #e8f5e8;
  border-radius: 4px;
  color: #2e7d32;
  font-weight: bold;
}

.data-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.error {
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 4px;
}

.data-count {
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
  color: #666;
}

.sensor-list {
  list-style: none;
  padding: 0;
}

.sensor-item {
  background-color: #f5f5f5;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.temperature {
  color: #f44336;
  font-weight: bold;
}

.humidity {
  color: #2196f3;
  font-weight: bold;
}

.servo-pos {
  color: #9c27b0;
  font-weight: bold;
}

.timestamp {
  color: #666;
  font-size: 12px;
}

.refresh-btn {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover {
  background-color: #45a049;
}

@media (max-width: 600px) {
  .data-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .servo-buttons {
    flex-wrap: wrap;
  }
}
</style>
import axios from 'axios';

// Lal Kitab Horoscope API configuration
const LAL_KITAB_API_BASE_URL = 'https://json.astrologyapi.com/v1';
const API_KEY = import.meta.env.VITE_LAL_KITAB_API_KEY || 'YOUR_API_KEY_HERE';
const USER_ID = import.meta.env.VITE_LAL_KITAB_USER_ID || 'YOUR_USER_ID_HERE';

// Create axios instance for Lal Kitab API
const lalKitabApi = axios.create({
  baseURL: LAL_KITAB_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add authentication headers to requests
lalKitabApi.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    'Authorization': `Basic ${btoa(`${USER_ID}:${API_KEY}`)}`
  };
  return config;
});

// Response interceptor for error handling
lalKitabApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Lal Kitab API Error:', error.response || error.message);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error('Invalid request data. Please check your input.');
        case 401:
          throw new Error('Authentication failed. Please check your API credentials.');
        case 403:
          throw new Error('Access forbidden. Please check your permissions.');
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error('Server error. Please try again later.');
        case 503:
          throw new Error('Service unavailable. Please try again later.');
        default:
          throw new Error(data?.message || `API Error: ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred.');
    }
  }
);

// Lal Kitab Horoscope API service
export const lalKitabAPI = {
  /**
   * Get Lal Kitab horoscope based on birth details
   * @param {Object} birthData - Birth details
   * @param {number} birthData.day - Day of birth
   * @param {number} birthData.month - Month of birth
   * @param {number} birthData.year - Year of birth
   * @param {number} birthData.hour - Hour of birth
   * @param {number} birthData.min - Minute of birth
   * @param {number} birthData.lat - Latitude of birth place
   * @param {number} birthData.lon - Longitude of birth place
   * @param {string} birthData.tzone - Timezone of birth place
   * @returns {Promise<Object>} Horoscope data
   */
  getLalKitabHoroscope: async (birthData) => {
    try {
      // Validate required fields
      if (!birthData.day || !birthData.month || !birthData.year) {
        throw new Error('Birth date is required');
      }
      
      const response = await lalKitabApi.post('/lalkitab_horoscope', birthData);
      return response.data;
    } catch (error) {
      console.error('Error fetching Lal Kitab horoscope:', error);
      throw error;
    }
  },

  /**
   * Get Lal Kitab planetary details
   * @param {Object} birthData - Birth details
   * @returns {Promise<Object>} Planetary details
   */
  getLalKitabPlanets: async (birthData) => {
    try {
      // Validate required fields
      if (!birthData.day || !birthData.month || !birthData.year) {
        throw new Error('Birth date is required');
      }
      
      const response = await lalKitabApi.post('/lalkitab_planets', birthData);
      return response.data;
    } catch (error) {
      console.error('Error fetching Lal Kitab planetary details:', error);
      throw error;
    }
  },

  /**
   * Get Lal Kitab predictions
   * @param {Object} birthData - Birth details
   * @returns {Promise<Object>} Predictions data
   */
  getLalKitabPredictions: async (birthData) => {
    try {
      // Validate required fields
      if (!birthData.day || !birthData.month || !birthData.year) {
        throw new Error('Birth date is required');
      }
      
      const response = await lalKitabApi.post('/lalkitab_predictions', birthData);
      return response.data;
    } catch (error) {
      console.error('Error fetching Lal Kitab predictions:', error);
      throw error;
    }
  }
};

export default lalKitabApi;
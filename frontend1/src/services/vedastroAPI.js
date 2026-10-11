import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || (typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.hostname)
      ? 'https://astrology-run-backend.onrender.com/api'
      : 'http://localhost:5000/api');

/**
 * VedAstro API Service (via Backend Proxy)
 * Provides accurate Vedic astrology calculations using VedAstro's API through backend proxy
 */
export const vedastroAPI = {
  /**
   * Calculate complete Kundali (Birth Chart) via backend proxy
   * @param {Object} birthData - Birth details
   * @returns {Promise} Kundali data with planets, houses, and chart
   */
  async calculateKundali(birthData) {
    try {
      // Call backend proxy endpoint
      const response = await axios.post(`${API_BASE_URL}/kundali/generate-vedastro`, birthData);

      return response.data;

    } catch (error) {
      console.error('VedAstro API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to calculate Kundali using VedAstro. Please check your input data.');
    }
  }
};

export default vedastroAPI;

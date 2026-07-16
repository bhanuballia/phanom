const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  return 'https://astrology-backend-pink.vercel.app/api';
};

const API_BASE_URL = getBaseUrl();


// Helper function to build asset URLs
const buildAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }
  // For relative paths, prepend the base URL
  // Since we're using a proxy, we can use the path directly or construct the full URL
  const baseUrl = window.location.origin;
  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${baseUrl}${normalizedPath}`;
};

class AstrologerAPI {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
    console.log('Token set in localStorage:', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = { ...options.headers };

    // Only set application/json if not sending FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      headers,
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
      console.log('Using token for request:', endpoint);
    } else {
      console.log('No token available for request:', endpoint);
    }

    try {
      console.log('Making request to:', url);
      const response = await fetch(url, config);

      // Check content type before parsing
      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        // If response is HTML (like a 404 page), throw a more helpful error
        if (contentType && contentType.includes('text/html')) {
          console.error('Received HTML response instead of JSON. Backend might not be running or endpoint is incorrect.');
          throw new Error(`Server error: ${response.status}. Please ensure the backend server is running on the correct port.`);
        }

        // Try to parse JSON error
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'API request failed');
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      // Check if response is JSON
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        console.error('Expected JSON response but got:', contentType);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    console.log('Attempting login with email:', email);
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: 'astrologer' }),
    });

    if (data.user.role === 'astrologer') {
      this.setToken(data.token);
      return data;
    } else {
      throw new Error('Invalid role for astrologer portal');
    }
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, role: 'astrologer' }),
    });

    return data;
  }

  // Profile
  async getProfile() {
    return await this.request('/astrologer/profile');
  }

  async updateProfile(data) {
    return await this.request('/astrologer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Appointments
  async getAppointments(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/astrologer/appointments${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  async getAppointment(id) {
    return await this.request(`/astrologer/appointments/${id}`);
  }

  async updateAppointment(id, data) {
    return await this.request(`/astrologer/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Live Chat
  async getMySessions() {
    return await this.request('/live-chat/my-sessions');
  }

  async getChatHistory(astrologerId) {
    // Note: For astrologers, they pass the user's ID to get history with that user
    return await this.request(`/live-chat/history/${astrologerId}`);
  }

  async uploadFile(formData) {
    return await this.request('/live-chat/upload', {
      method: 'POST',
      body: formData, // fetch will handle Content-Type for FormData
      headers: {
        // Remove Content-Type so fetch can set the boundary automatically
      }
    });
  }

  // Dashboard
  async getUpcomingAppointments() {
    return await this.request('/astrologer/upcoming-appointments');
  }

  // Palmistry
  async getPalmistrySubmissions(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/palmistry/my-submissions${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  async getPalmistrySubmission(id) {
    return await this.request(`/palmistry/submissions/${id}`);
  }

  async updatePalmistrySubmission(id, data) {
    return await this.request(`/palmistry/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Prokerala Astro Tools
  async getAdvancedKundli(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/kundli-advanced?${queryParams}`);
  }

  async getChart(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/chart?${queryParams}`);
  }

  async getAdvancedSadesati(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/sade-sati-advanced?${queryParams}`);
  }

  async getDashaPeriods(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/dasha-periods?${queryParams}`);
  }

  async getAdvancedMatching(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/matching-advanced?${queryParams}`);
  }
  async getPersonalReport(data) {
    return await this.request('/astrologer/astro/personal-report', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getKaalSarpDosha(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/kaal-sarp-dosha?${queryParams}`);
  }

  async getMangalDoshaAdvanced(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/mangal-dosha-advanced?${queryParams}`);
  }

  async getPlanetPosition(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/planet-position?${queryParams}`);
  }

  async getDailyPredictionAdvanced(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/daily-prediction-advanced?${queryParams}`);
  }

  async getAdvancedPanchang(params) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/astrologer/astro/panchang-advanced?${queryParams}`);
  }
}

export default new AstrologerAPI();
export { buildAssetUrl };
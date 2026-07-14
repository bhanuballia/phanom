import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

const trimTrailingSlash = (url = '') => url.replace(/\/+$/, '');

const isLocalhost = (hostname) => /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(hostname || '');

const getEnvValue = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return undefined;
};

const computeApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (isLocalhost(hostname)) {
      return DEFAULT_API_BASE_URL;
    }
    // Relative path for unified deployment
    return '/api';
  }
  return DEFAULT_API_BASE_URL;
};

export const API_BASE_URL = computeApiBaseUrl();

const computeUploadsBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (isLocalhost(hostname)) {
      return 'http://localhost:5000/uploads';
    }
  }
  return '/uploads';
};

const UPLOADS_BASE_URL = computeUploadsBaseUrl();

export const buildAssetUrl = (assetPath) => {
  if (!assetPath) return '';

  // If it's already a full URL (http/https), return as-is
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  // Handle Cloudinary specific identifiers if they appear as paths
  if (assetPath.includes('cloudinary') || assetPath.includes('res.cloudinary.com')) {
    return assetPath;
  }

  // Normalize path (handle Windows slashes just in case)
  let cleanPath = assetPath.replace(/\\/g, '/');

  // If the path already includes 'uploads/', remove the redundant part
  // because UPLOADS_BASE_URL already contains /uploads
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.substring(8);
  } else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(9);
  }

  // Ensure leading slash for the clean path
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  return `${UPLOADS_BASE_URL}${normalizedPath}`;
};

export const getApiBaseUrl = () => API_BASE_URL;
export const getUploadsBaseUrl = () => UPLOADS_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If FormData is being sent, remove Content-Type header to let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => {
    // Debug: Log successful responses
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Debug: Log login response
      console.log('Login API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Login API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      // Ensure the error we throw has the message from the server if available
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  getAstrologers: () => api.get('/auth/astrologers'),
};

// Appointments API
export const appointmentsAPI = {
  create: (appointmentData) => api.post('/appointments', appointmentData),
  getAll: (params = {}) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, updateData) => api.put(`/appointments/${id}`, updateData),
  cancel: (id) => api.delete(`/appointments/${id}`),
  getAvailability: (astrologerId, date, duration) =>
    api.get(`/appointments/astrologer/${astrologerId}/availability`, { params: { date, duration } }),
  checkFirstTime: (email, phone) =>
    api.get('/appointments/check-first-time', { params: { email, phone } }),
};

// Kundali API
export const kundaliAPI = {
  generate: (kundaliData) => api.post('/kundali/generate', kundaliData),
  generateWithJKS: (kundaliData) => api.post('/kundali/generate-jks', kundaliData),
  sendToEmail: (emailData) => api.post('/kundali/send-email', emailData),
  sendToPhone: (smsData) => api.post('/kundali/send-sms', smsData),
  getPanchang: (panchangData) => api.post('/kundali/panchang', panchangData),
  generatePDF: (pdfData) => api.post('/kundali/generate-pdf', pdfData, { responseType: 'blob' }),
};

// Admin API
export const adminAPI = {
  // Astrologer Management
  createAstrologer: (astrologerData) => {
    // Axios automatically handles FormData and sets correct Content-Type
    return api.post('/admin/astrologers', astrologerData);
  },
  getAstrologers: (params = {}) => api.get('/admin/astrologers', { params }),
  getAstrologerById: (id) => api.get(`/admin/astrologers/${id}`),
  updateAstrologer: (id, updateData) => api.put(`/admin/astrologers/${id}`, updateData),
  deleteAstrologer: (id) => api.delete(`/admin/astrologers/${id}`),

  // Appointment Management
  getAppointments: (params = {}) => api.get('/admin/appointments', { params }),
  getAppointmentById: (id) => api.get(`/admin/appointments/${id}`),
  cancelAppointment: (id, data) => api.put(`/admin/appointments/${id}/cancel`, data),
  rescheduleAppointment: (id, data) => api.put(`/admin/appointments/${id}/reschedule`, data),

  // Dashboard Statistics
  getStats: () => api.get('/admin/stats'),

  // User Management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (id, roleData) => api.put(`/admin/users/${id}/role`, roleData),

  // UGC Video Management
  getUGCVideos: (params = {}) => api.get('/ugc-videos', { params }),
  updateUGCVideo: (id, updateData) => api.put(`/ugc-videos/${id}`, updateData),
  deleteUGCVideo: (id) => api.delete(`/ugc-videos/${id}`),

  // New function for home page video upload
  uploadHomePageVideo: (formData) => {
    return api.post('/ugc-videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Lord Ganesha Image Management
  uploadLordGaneshaImage: (formData) => {
    return api.post('/admin/lord-ganesha-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getLordGaneshaImage: () => api.get('/admin/lord-ganesha-image'),

  // Kundali Matching Background Image Management
  uploadKundaliMatchingBackground: (formData) => {
    return api.post('/admin/kundali-matching-background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getKundaliMatchingBackground: () => api.get('/admin/kundali-matching-background'),

  // Home Page Background Image Management
  uploadHomePageBackground: (formData) => {
    return api.post('/admin/homepage-background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getHomePageBackground: () => api.get('/admin/homepage-background'),
  getAuditReport: () => api.get('/audit/report')
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/chat', { message }),
  sendMessageWithContext: (message, context = {}) => api.post('/chatbot/chat/user', { message, ...context }),
  getPopularQuestions: () => api.get('/chatbot/popular-questions'),
};

// N8n Video API
export const n8nVideoAPI = {
  getLatestVideo: () => api.get('/n8n-videos/latest'),
  createVideoRequest: (formData) => api.post('/n8n-videos/request', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAllVideoRequests: (params = {}) => api.get('/n8n-videos', { params }),
  updateVideoRequest: (id, updateData) => api.put(`/n8n-videos/${id}`, updateData),
  deleteVideoRequest: (id) => api.delete(`/n8n-videos/${id}`),
};

// Shopping Portal API
// Geolocation API
export const geoAPI = {
  searchPlaces: (query) => api.get(`/geo/search?q=${encodeURIComponent(query)}`),
  getTimezone: (lat, lon) => api.get(`/geo/timezone?lat=${lat}&lon=${lon}`)
};

export const shoppingAPI = {
  // Product Management
  getProducts: (params = {}) => api.get('/shopping/products', { params }),
  getProductById: (id) => api.get(`/shopping/products/${id}`),
  createProduct: (productData) => api.post('/shopping/products', productData),
  updateProduct: (id, updateData) => api.put(`/shopping/products/${id}`, updateData),
  deleteProduct: (id) => api.delete(`/shopping/products/${id}`),

  // Category Management
  getCategories: () => api.get('/shopping/categories'),
  getCategoryById: (id) => api.get(`/shopping/categories/${id}`),
  createCategory: (categoryData) => api.post('/shopping/categories', categoryData),
  updateCategory: (id, updateData) => api.put(`/shopping/categories/${id}`, updateData),
  deleteCategory: (id) => api.delete(`/shopping/categories/${id}`),
};

export const ugcAPI = {
  // UGC Video Management
  getUGCVideos: (params = {}) => api.get('/ugc-videos', { params }),
  updateUGCVideo: (id, updateData) => api.put(`/ugc-videos/${id}`, updateData),
  deleteUGCVideo: (id) => api.delete(`/ugc-videos/${id}`),

  // New function to get home page featured video
  getHomePageFeaturedVideo: () => {
    return api.get('/ugc-videos/homepage-featured');
  }
};

// Palmistry API
export const palmistryAPI = {
  submitPalmistry: (formData) => {
    return api.post('/palmistry/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getAllSubmissions: (params = {}) => api.get('/palmistry/submissions', { params }),
  getSubmissionById: (id) => api.get(`/palmistry/submissions/${id}`),
  updateSubmission: (id, updateData) => api.put(`/palmistry/submissions/${id}`, updateData),
  deleteSubmission: (id) => api.delete(`/palmistry/submissions/${id}`),
  getMySubmissions: () => api.get('/palmistry/my-submissions')
};

export default api;
// Live Chat API
export const liveChatAPI = {
  getAvailableAstrologers: () => api.get('/live-chat/astrologers'),
  getChatHistory: (astrologerId) => api.get(`/live-chat/history/${astrologerId}`),
  getAdminAllHistory: () => api.get('/live-chat/admin/all-history'),
  getAdminSessions: () => api.get('/live-chat/admin/sessions'),
  uploadFile: (formData) => api.post('/live-chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getBirthReport: (datetime, coordinates) => api.get('/live-chat/birth-report', {
    params: { datetime, coordinates }
  }),
  getDakshinaStatus: (astrologerId) => api.get(`/live-chat/dakshina-status/${astrologerId}`),
  createDakshinaPayment: (astrologerId, amount) => api.post('/live-chat/dakshina-payment', { astrologerId, amount }),
  confirmDakshinaPayment: (paymentId) => api.post('/live-chat/dakshina-confirm', { paymentId }),
};


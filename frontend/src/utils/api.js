import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add UTM parameters to request data if present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmMedium = urlParams.get('utm_medium');

    if (config.data && typeof config.data === 'object') {
      config.data.utmSource = utmSource || config.data.utmSource || null;
      config.data.utmCampaign = utmCampaign || config.data.utmCampaign || null;
      config.data.utmMedium = utmMedium || config.data.utmMedium || null;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const createLead = async (leadData) => {
  const response = await api.post('/leads', leadData);
  return response.data;
};

export default api;

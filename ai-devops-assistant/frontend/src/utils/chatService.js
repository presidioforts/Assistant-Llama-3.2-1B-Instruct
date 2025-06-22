import axios from 'axios';
import { API_CONFIG, KB_CONFIG } from './config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const kbApiClient = axios.create({
  baseURL: KB_CONFIG.BASE_URL,
  timeout: KB_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor for KB API logging
kbApiClient.interceptors.request.use(
  (config) => {
    console.log('KB API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('KB API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for KB API error handling
kbApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('KB API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatService = {
  async checkHealth() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      throw new Error('Backend service is not available');
    }
  },

  async sendMessage(messages) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS, {
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      if (error.response?.status === 503) {
        throw new Error('AI model is not ready. Please try again in a moment.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      } else {
        throw new Error(error.response?.data?.error || 'Failed to get response from AI assistant');
      }
    }
  },

  async searchKnowledge(query) {
    try {
      const response = await kbApiClient.post(KB_CONFIG.ENDPOINTS.TROUBLESHOOT, {
        value: { text: query }
      });

      if (response.data && response.data.response) {
        return response.data.response;
      } else {
        throw new Error('Invalid response format from KB service');
      }
    } catch (error) {
      if (error.response?.status === 503) {
        throw new Error('KB service is not ready. Please try again in a moment.');
      } else if (error.response?.status >= 500) {
        throw new Error('KB service error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('KB service request timeout. Please try again.');
      } else if (error.code === 'ECONNREFUSED' || error.response?.status === 404) {
        throw new Error('KB service is not available. Please check if the service is running.');
      } else {
        throw new Error(error.response?.data?.error || 'Failed to search knowledge base');
      }
    }
  }
}; 
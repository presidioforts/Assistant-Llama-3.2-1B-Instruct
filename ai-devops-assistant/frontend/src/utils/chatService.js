import axios from 'axios';
import { API_CONFIG, KB_CONFIG } from './config';

// Preprocessing function for KB responses
const preprocessKBResponse = (rawResponse) => {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return rawResponse;
  }

  let processed = rawResponse;

  // 1. Fix common HTML/Markdown issues
  processed = processed
    // Fix malformed line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    
    // Ensure proper spacing around headers
    .replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2')
    
    // Fix list formatting
    .replace(/^[\s]*[-*+]\s*/gm, '- ')
    .replace(/^[\s]*(\d+\.)\s*/gm, '$1 ')
    
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    
    // Fix code blocks
    .replace(/```(\w*)\n/g, '```$1\n')
    
    // Ensure paragraphs have proper spacing
    .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2');

  // 2. Convert common HTML to Markdown (if needed)
  processed = processed
    // Convert <br/> to line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    
    // Convert <p> tags to paragraphs
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    
    // Convert basic HTML formatting
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`');

  // 3. Custom formatting fixes (add your specific cases here)
  processed = processed
    // Add your specific KB formatting fixes
    .replace(/\[ERROR\]/g, '⚠️ **ERROR**')
    .replace(/\[INFO\]/g, 'ℹ️ **INFO**')
    .replace(/\[WARNING\]/g, '⚠️ **WARNING**')
    .replace(/\[SUCCESS\]/g, '✅ **SUCCESS**');

  // 4. Clean up final result
  processed = processed
    .trim()
    .replace(/\n{3,}/g, '\n\n');

  console.log('KB Response Processed:', processed);
  return processed;
};

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
        text: query
      });

      if (response.data && response.data.response) {
        console.log('KB Response Raw:', response.data.response);
        console.log('KB Response Type:', typeof response.data.response);
        
        // Temporarily disable preprocessing to test
        // const processedResponse = preprocessKBResponse(response.data.response);
        // return processedResponse;
        
        // Return raw response for now
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
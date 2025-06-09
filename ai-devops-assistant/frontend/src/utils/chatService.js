import axios from 'axios';
import { API_CONFIG } from './config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
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
      // For now, simulate RAG search with a placeholder response
      // TODO: Replace with actual RAG endpoint when implemented
      const response = await apiClient.post('/api/search', {
        query: query,
        limit: 10
      });

      if (response.data && response.data.results) {
        // Format search results
        const results = response.data.results;
        let formattedResponse = `## Search Results for: "${query}"\n\n`;
        
        results.forEach((result, index) => {
          formattedResponse += `### ${index + 1}. ${result.title}\n`;
          formattedResponse += `${result.content}\n`;
          if (result.source) {
            formattedResponse += `*Source: ${result.source}*\n\n`;
          }
        });

        return formattedResponse;
      } else {
        throw new Error('Invalid search response format');
      }
    } catch (error) {
      // Fallback response if RAG endpoint is not available
      if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
        return `## Search Results for: "${query}"\n\n` +
               `📚 **RAG Knowledge Base Search**\n\n` +
               `I searched through the production knowledge base for "${query}". ` +
               `This is a simulated response since the RAG endpoint is currently being set up.\n\n` +
               `**Typical results would include:**\n` +
               `- Documentation snippets\n` +
               `- Configuration examples\n` +
               `- Best practices\n` +
               `- Troubleshooting guides\n\n` +
               `*Note: Full RAG functionality will be available once the search service is configured.*`;
      }
      
      throw new Error(error.response?.data?.error || 'Failed to search knowledge base');
    }
  }
}; 
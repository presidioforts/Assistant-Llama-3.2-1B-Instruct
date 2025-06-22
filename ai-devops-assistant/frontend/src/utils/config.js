export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    HEALTH: '/v1/health',
    CHAT_COMPLETIONS: '/v1/chat/completions'
  },
  TIMEOUT: 320000 // 5 minutes 20 seconds (matches backend + buffer)
};

export const KB_CONFIG = {
  BASE_URL: 'http://10.0.2.10:8000',
  ENDPOINTS: {
    TROUBLESHOOT: '/troubleshoot'
  },
  TIMEOUT: 320000 // Same as chat - 5 minutes 20 seconds
};

export const UI_CONFIG = {
  MAX_MESSAGE_LENGTH: 4000,
  TYPING_DELAY: 100,
  AUTO_SCROLL_DELAY: 100
}; 
import os

class Config:
    """Configuration settings for the DevOps AI Assistant"""
    
    # Server Configuration
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8000))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Model Configuration - Using local model files
    MODEL_NAME = os.getenv('MODEL_NAME', './models/llama-3.2-1B-instruct')
    
    # Generation Parameters
    MAX_NEW_TOKENS = int(os.getenv('MAX_NEW_TOKENS', 512))
    TEMPERATURE = float(os.getenv('TEMPERATURE', 0.7))
    MAX_INPUT_LENGTH = int(os.getenv('MAX_INPUT_LENGTH', 2048))
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    @classmethod
    def validate(cls):
        """Validate configuration settings"""
        assert cls.PORT > 0, "Port must be positive"
        assert 0.0 <= cls.TEMPERATURE <= 2.0, "Temperature must be between 0.0 and 2.0"
        assert cls.MAX_NEW_TOKENS > 0, "Max new tokens must be positive" 
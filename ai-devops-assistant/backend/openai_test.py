from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from openai import OpenAI

# Load environment variables (optional)
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass  # Continue without .env file

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Model configuration
MODEL_NAME = os.getenv('OPENAI_MODEL', 'o3-mini')  # Default to o3-mini
MAX_TOKENS = int(os.getenv('OPENAI_MAX_TOKENS', '4000'))  # Increased for detailed responses
TEMPERATURE = float(os.getenv('OPENAI_TEMPERATURE', '0.7'))

logger.info(f"Using OpenAI model: {MODEL_NAME}")

@app.route('/v1/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "provider": "openai"})

@app.route('/v1/chat/completions', methods=['POST'])
@app.route('/troubleshoot', methods=['POST'])
def chat_completions():
    """Single endpoint for both chat and troubleshoot"""
    try:
        data = request.get_json()
        
        # Handle different request formats
        if 'messages' in data:
            # Standard chat format
            messages = data['messages']
        elif 'text' in data:
            # Troubleshoot format - convert to chat format with detailed system prompt
            messages = [
                {"role": "system", "content": "You are a comprehensive DevOps AI Assistant. CRITICAL: Always provide COMPLETE, WORKING code examples with actual content. Never use empty code blocks or placeholder text. When showing code:\n\n1. Fill in ALL code blocks with real, working examples\n2. Use actual commands, not placeholders like 'your-app' or 'example.com'\n3. Provide complete files, not snippets\n4. Include proper syntax and real values\n\nUse proper markdown formatting including headers, code blocks, tables, and lists. Cover all aspects of the topic including best practices, potential issues, and solutions."},
                {"role": "user", "content": data['text']}
            ]
        else:
            return jsonify({"error": "Missing 'messages' or 'text' in request body"}), 400
        
        # Call OpenAI - handle different parameter names for different models
        api_params = {
            "model": MODEL_NAME,
            "messages": messages
        }
        
        # o3 models use different parameters
        if MODEL_NAME.startswith('o3'):
            api_params["max_completion_tokens"] = MAX_TOKENS
            # o3 models don't support temperature parameter
        else:
            api_params["max_tokens"] = MAX_TOKENS
            api_params["temperature"] = TEMPERATURE
            
        response = client.chat.completions.create(**api_params)
        
        content = response.choices[0].message.content
        
        # Return appropriate format based on endpoint
        if request.endpoint == 'troubleshoot':
            return jsonify({"response": content})
        else:
            return jsonify({"choices": [{"message": {"role": "assistant", "content": content}}]})
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True) 
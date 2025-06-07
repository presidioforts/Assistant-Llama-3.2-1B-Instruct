from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from model.loader import ModelLoader
from model.inference import ModelInference
from utils.config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Global model instances
model_loader = None
model_inference = None

def initialize_model():
    """Initialize the Llama model at startup"""
    global model_loader, model_inference
    try:
        logger.info("Loading Llama-3.2-1B-Instruct model...")
        model_loader = ModelLoader()
        model_inference = ModelInference(model_loader)
        logger.info("Model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

@app.route('/v1/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if model_loader and model_inference:
        return jsonify({"status": "healthy"})
    else:
        return jsonify({"status": "unhealthy", "error": "Model not loaded"}), 503

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    """Chat completions endpoint"""
    try:
        if not model_inference:
            return jsonify({"error": "Model not loaded"}), 503
        
        data = request.get_json()
        
        if not data or 'messages' not in data:
            return jsonify({"error": "Missing 'messages' in request body"}), 400
        
        messages = data['messages']
        
        # Generate response using the model
        response_content = model_inference.generate_response(messages)
        
        return jsonify({
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": response_content
                    }
                }
            ]
        })
        
    except Exception as e:
        logger.error(f"Error in chat completions: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Initialize model at startup
    if initialize_model():
        logger.info("Starting Flask server...")
        app.run(
            host=Config.HOST,
            port=Config.PORT,
            debug=Config.DEBUG
        )
    else:
        logger.error("Failed to initialize model. Exiting.")
        exit(1) 
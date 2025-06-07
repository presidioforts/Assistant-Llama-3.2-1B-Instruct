# DevOps AI Assistant - Backend

This is the backend service for the DevOps AI Assistant, built with Flask and powered by Llama-3.2-1B-Instruct.

## Setup

### Prerequisites
- Python 3.9 or above
- pip package manager

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

The application uses environment variables for configuration. You can set these in your environment or create a `.env` file:

```env
HOST=0.0.0.0
PORT=8000
DEBUG=false
MODEL_NAME=meta-llama/Llama-3.2-1B-Instruct
MAX_NEW_TOKENS=512
TEMPERATURE=0.7
MAX_INPUT_LENGTH=2048
```

## Running the Application

1. Start the Flask server:
```bash
python app/main.py
```

2. The server will start on `http://localhost:8000`

3. Check health status:
```bash
curl http://localhost:8000/v1/health
```

## API Endpoints

### GET /v1/health
Returns the health status of the service.

**Response:**
```json
{
  "status": "healthy"
}
```

### POST /v1/chat/completions
Accepts chat messages and returns AI assistant response.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "How do I fix this CI error?" }
  ]
}
```

**Response:**
```json
{
  "choices": [
    { "message": { "role": "assistant", "content": "Here's how you fix..." } }
  ]
}
```

## Deployment Notes

- Ensure adequate system resources (RAM/GPU) for model loading
- The model is loaded once at startup for optimal performance
- Use a reverse proxy (nginx) in production for better performance
- Consider using gunicorn or uwsgi for production deployment 
# DevOps AI Assistant

An intelligent AI-powered assistant for DevOps questions and troubleshooting, built with React frontend and Flask backend powered by Llama-3.2-1B-Instruct.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend**: Python Flask API with Llama-3.2-1B-Instruct model
- **Frontend**: React application with Material UI
- **Documentation**: Architecture and API documentation

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm
- 8GB+ RAM (recommended for model loading)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python app/main.py
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure 

## 🔧 Configuration

### Backend Configuration

Create environment variables or `.env` file in the backend directory:

```env
HOST=0.0.0.0
PORT=8000
DEBUG=false
MODEL_NAME=meta-llama/Llama-3.2-1B-Instruct
MAX_NEW_TOKENS=512
TEMPERATURE=0.7
```

### Frontend Configuration

Create `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

## 🔄 API Endpoints

### Health Check
```
GET /v1/health
```

### Chat Completions
```
POST /v1/chat/completions
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "How do I fix this CI error?" }
  ]
}
```

## 🚀 Deployment

### Development
- Backend: `python app/main.py`
- Frontend: `npm start`

### Production
- Backend: Use gunicorn or uwsgi with a reverse proxy (nginx)
- Frontend: Build static files with `npm run build` and serve with nginx

## 🤖 AI Model

The application uses Meta's Llama-3.2-1B-Instruct model for generating responses. The model is:

- Loaded once at startup for optimal performance
- Optimized for conversational interactions
- Supports both CPU and GPU inference
- Configurable generation parameters

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## 🔒 Security Notes

- Configure CORS properly for production
- Implement rate limiting as needed
- Use HTTPS in production
- Consider authentication for production use

## ⚡ Performance

- Model loads once at startup (~2-3GB memory usage)
- Response times: ~1-3 seconds depending on hardware
- Stateless backend design for horizontal scaling
- Frontend optimized for fast interactions

## 🛠️ Development

### Running Tests
```bash
# Backend tests (if implemented)
cd backend && python -m pytest

# Frontend tests
c 
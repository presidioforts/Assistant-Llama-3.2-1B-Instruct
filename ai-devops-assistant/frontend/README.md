# DevOps AI Assistant - Frontend

This is the frontend application for the DevOps AI Assistant, built with React and Material UI.

## Setup

### Prerequisites
- Node.js 16+ and npm
- Backend service running on port 8000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the frontend directory to configure the API endpoint:

```env
REACT_APP_API_URL=http://localhost:8000
```

## Running the Application

1. Start the development server:
```bash
npm start
```

2. The application will open in your browser at `http://localhost:3000`

3. Make sure the backend service is running on `http://localhost:8000`

## Building for Production

1. Create a production build:
```bash
npm run build
```

2. The build files will be created in the `build/` directory

3. Serve the build files using a web server (nginx, Apache, etc.)

## Features

- **Chat Interface**: Clean and intuitive chat UI with Material UI components
- **Real-time Communication**: Seamless communication with the backend AI service
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful handling of network errors and API failures
- **Loading States**: Visual feedback during AI response generation

## Components

- **ChatWindow**: Main chat interface container
- **MessageBubble**: Individual message display component
- **MessageInput**: Text input component for user messages
- **Loader**: Loading spinner component for AI responses

## Deployment Notes

- Configure `REACT_APP_API_URL` to point to your production backend
- Use a reverse proxy (nginx) to serve the static files
- Ensure CORS is properly configured in the backend for your domain

### AI Model (Llama-3.2-1B-Instruct)
- **Model**: Meta's Llama-3.2-1B-Instruct
- **Purpose**: Generates intelligent responses to DevOps queries
- **Key Features**:
  - Loaded once at startup for performance
  - Optimized for conversation format
  - Configurable generation parameters
  - Support for both CPU and GPU inference

## Data Flow

1. **User Input**: User types a message in the frontend chat interface
2. **API Request**: Frontend sends POST request to `/v1/chat/completions` with message history
3. **Model Inference**: Backend processes the message through the Llama model
4. **Response Generation**: Model generates an appropriate response
5. **API Response**: Backend returns the response in structured JSON format
6. **UI Update**: Frontend displays the AI response in the chat interface

## Request/Response Flow 
# DevOps AI Assistant - Frontend

This is the frontend application for the DevOps AI Assistant, built with React and Material UI.

## 🚀 Quick Start

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

### Configuration

Create a `.env` file in the frontend directory to configure the API endpoint:

```env
REACT_APP_API_URL=http://localhost:8000
```

### Running the Application

1. Start the development server:
```bash
npm start
```

2. The application will open in your browser at `http://localhost:3000`

3. Make sure the backend service is running on `http://localhost:8000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ChatWindow.js       # Main chat interface container
│   ├── MessageBubble.js    # Individual message display component
│   ├── MessageInput.js     # Text input component for user messages
│   └── Loader.js           # Loading spinner component for AI responses
├── utils/
│   └── chatService.js      # API communication service
├── App.js                  # Main React application component
├── index.js                # React entry point
└── index.css               # Global styles
```

## 🎨 Components Overview

### ChatWindow
The main chat interface that manages the conversation state and orchestrates all other components.

**Features:**
- Message history management
- Real-time message updates
- Auto-scrolling to latest messages
- Loading state handling
- Error handling and recovery

### MessageBubble
Displays individual messages with different styling for user and assistant messages.

**Features:**
- Markdown rendering for assistant responses
- Syntax highlighting for code blocks
- Responsive design for mobile/desktop
- Timestamp display
- Error state visualization

### MessageInput
Handles user input with send functionality and loading states.

**Features:**
- Text input with send button
- Enter key submission
- Input validation
- Disabled state during API calls
- Character limit handling

### Loader
Shows loading animation while waiting for AI responses.

**Features:**
- Animated loading dots
- Consistent Material UI styling
- Accessible loading indicator

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend API base URL |

### Material UI Theme

The application uses Material UI's default theme with custom styling for:
- Chat bubbles (user vs assistant)
- Code syntax highlighting
- Loading animations
- Responsive breakpoints

## 📱 Features

### Chat Interface
- **Clean and Intuitive UI**: Material Design components for professional appearance
- **Real-time Communication**: Seamless integration with backend AI service
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Markdown Support**: Rich text rendering for AI responses with syntax highlighting

### User Experience
- **Loading States**: Visual feedback during AI response generation
- **Error Handling**: Graceful handling of network errors and API failures
- **Auto-scroll**: Automatic scrolling to keep latest messages visible
- **Message History**: Maintains conversation context throughout the session

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast**: Readable color scheme for accessibility compliance
- **Focus Management**: Clear focus indicators and logical tab order

## 🎯 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Development Guidelines

1. **Component Structure**: Follow React functional component patterns with hooks
2. **State Management**: Use React's built-in state for local component state
3. **API Integration**: All API calls go through the `chatService` utility
4. **Styling**: Use Material UI components and sx prop for styling
5. **Error Handling**: Implement proper error boundaries and user feedback

### Dependencies

**Core Dependencies:**
- `react` (^18.0.0): React framework
- `@mui/material` (^5.0.0): Material UI components
- `@emotion/react` & `@emotion/styled`: Material UI styling engine
- `axios`: HTTP client for API communication

**Markdown Rendering:**
- `react-markdown`: Markdown rendering component
- `rehype-highlight`: Syntax highlighting for code blocks
- `rehype-raw`: Raw HTML support in markdown
- `remark-gfm`: GitHub Flavored Markdown support

## 🚀 Building for Production

### Create Production Build

1. Build the application:
```bash
npm run build
```

2. The build files will be created in the `build/` directory

3. Serve the build files using a web server:

#### Using nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to backend
    location /v1/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Using serve (for testing)
```bash
npx serve -s build -l 3000
```

### Environment Configuration

For production deployment:

1. Update `.env` with production backend URL:
```env
REACT_APP_API_URL=https://your-api-domain.com
```

2. Ensure CORS is properly configured in the backend for your domain

3. Use HTTPS for secure communication

## 🔒 Security Considerations

- **API Communication**: Always use HTTPS in production
- **Environment Variables**: Never expose sensitive data in frontend environment variables
- **Input Validation**: Client-side validation for user inputs
- **XSS Protection**: React's built-in XSS protection through JSX
- **Content Security Policy**: Implement CSP headers for additional security

## 📊 Performance Optimization

- **Code Splitting**: React's lazy loading for components
- **Bundle Analysis**: Use `npm run build` with bundle analyzer
- **Caching**: Leverage browser caching for static assets
- **Image Optimization**: Optimize any images or assets
- **API Optimization**: Efficient API request patterns

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors:**
- Verify backend is running on correct port
- Check CORS configuration
- Confirm API URL in environment variables

**Build Failures:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility
- Verify all dependencies are correctly installed

**Styling Issues:**
- Ensure Material UI theme is properly configured
- Check for CSS conflicts
- Verify responsive breakpoints

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [Material UI Documentation](https://mui.com/getting-started/installation/)
- [React Markdown Documentation](https://github.com/remarkjs/react-markdown)
- [Backend API Documentation](../docs/api.md)
- [Architecture Overview](../docs/architecture.md)

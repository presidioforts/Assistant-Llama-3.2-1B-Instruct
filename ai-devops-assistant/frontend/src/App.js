import React from 'react';
import { Container, Typography, Box, AppBar, Toolbar } from '@mui/material';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DevOps AI Assistant
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to DevOps AI Assistant
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your intelligent companion for DevOps questions and troubleshooting
          </Typography>
        </Box>
        
        <ChatWindow />
      </Container>
    </div>
  );
}

export default App; 
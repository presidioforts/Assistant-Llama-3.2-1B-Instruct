import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'flex-end',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask me anything about DevOps..."
        disabled={disabled}
        variant="outlined"
        size="small"
        sx={{ mr: 1 }}
      />
      
      <IconButton 
        type="submit"
        color="primary"
        disabled={disabled || !message.trim()}
        sx={{ p: 1 }}
      >
        <Send />
      </IconButton>
    </Box>
  );
};

export default MessageInput; 
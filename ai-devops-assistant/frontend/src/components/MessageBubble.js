import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Person, SmartToy, Error } from '@mui/icons-material';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1,
        alignItems: 'flex-start'
      }}
    >
      {!isUser && (
        <Box sx={{ mr: 1, mt: 1 }}>
          {isError ? (
            <Error color="error" />
          ) : (
            <SmartToy color="primary" />
          )}
        </Box>
      )}
      
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          backgroundColor: isUser 
            ? 'primary.main' 
            : isError 
              ? 'error.light' 
              : 'grey.100',
          color: isUser ? 'white' : 'text.primary'
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>
        
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 1, 
            opacity: 0.7,
            fontSize: '0.75rem'
          }}
        >
          {message.timestamp.toLocaleTimeString()}
        </Typography>
      </Paper>
      
      {isUser && (
        <Box sx={{ ml: 1, mt: 1 }}>
          <Person color="action" />
        </Box>
      )}
    </Box>
  );
};

export default MessageBubble; 
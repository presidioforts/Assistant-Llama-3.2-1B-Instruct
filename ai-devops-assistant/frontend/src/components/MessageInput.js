import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Chip, Typography, Fade, Zoom } from '@mui/material';
import { KeyboardArrowUp, Chat, Search } from '@mui/icons-material';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState('ask');
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const inputRef = useRef();

  // Available modes
  const modes = [
    {
      id: 'ask',
      label: 'Ask',
      fullLabel: 'Ask (Llama-3.2-1B instruct)',
      icon: <Chat fontSize="small" />,
      placeholder: 'Ask me anything about DevOps...',
      description: 'Chat with AI assistant'
    },
    {
      id: 'search',
      label: 'Search',
      fullLabel: 'Search (RAG production system)',
      icon: <Search fontSize="small" />,
      placeholder: 'Search through knowledge base...',
      description: 'Search existing documentation'
    }
  ];

  const currentMode = modes.find(mode => mode.id === selectedMode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      setIsButtonPressed(true);
      setTimeout(() => setIsButtonPressed(false), 150);
      
      setLastMessage(message);
      onSendMessage(message.trim(), selectedMode);
      setMessage('');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && !message) {
      setMessage(lastMessage);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 0);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !disabled) {
        handleSubmit(e);
      }
    }
  };

  const handleModeChange = (modeId) => {
    setSelectedMode(modeId);
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: '#fafafa',
        pb: 2,
        px: 3,
      }}
    >
      <Fade in={true} timeout={800}>
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 1300,
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            px: 3,
            py: 2.5,
            minHeight: 80,
            boxShadow: '0 8px 32px 0 rgba(60,60,60,0.10)',
            bgcolor: '#fff',
            border: '1.5px solid #e0e0e0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 12px 40px 0 rgba(60,60,60,0.15)',
              borderColor: '#FFCD41',
            }
          }}
        >
          {/* Mode Selection Chips */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            {modes.map((mode) => (
              <Chip
                key={mode.id}
                label={mode.label}
                icon={mode.icon}
                onClick={() => handleModeChange(mode.id)}
                variant={selectedMode === mode.id ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: selectedMode === mode.id ? '#FFCD41' : 'transparent',
                  color: selectedMode === mode.id ? '#1F1F1F' : 'text.primary',
                  borderColor: selectedMode === mode.id ? '#FFCD41' : '#e0e0e0',
                  fontWeight: selectedMode === mode.id ? 600 : 400,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateY(0px)',
                  '&:hover': {
                    backgroundColor: selectedMode === mode.id ? '#E6B800' : '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                    transition: 'transform 0.1s',
                  },
                  '& .MuiChip-icon': {
                    color: selectedMode === mode.id ? '#1F1F1F' : 'text.secondary',
                    transition: 'color 0.3s ease',
                  }
                }}
              />
            ))}
          </Box>

          {/* Input field and send button */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              minRows={1}
              maxRows={8}
              variant="standard"
              placeholder={currentMode?.placeholder + " (Shift+Enter for newline)"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: 16,
                  bgcolor: 'transparent',
                  borderRadius: 0,
                  px: 1,
                  pl: 1.5,
                  minHeight: 38,
                  alignItems: 'center',
                  boxShadow: 'none',
                  border: 'none',
                  transition: 'all 0.3s ease',
                },
              }}
              inputProps={{
                'aria-label': 'Message input',
                style: { paddingRight: 0 },
              }}
              sx={{ 
                ml: 0, 
                flex: 1, 
                minWidth: 0, 
                '& fieldset': { border: 'none' },
                '& .MuiInputBase-root': {
                  '&:focus-within': {
                    backgroundColor: 'rgba(255, 205, 65, 0.05)',
                    borderRadius: '8px',
                  }
                }
              }}
            />

            {/* Send Button */}
            <Zoom in={true} timeout={300}>
              <IconButton
                onClick={handleSubmit}
                disabled={disabled || !message.trim()}
                sx={{
                  bgcolor: disabled || !message.trim() ? '#f5f5f5' : '#1F1F1F',
                  color: disabled || !message.trim() ? '#bbb' : '#fff',
                  borderRadius: '50%',
                  width: 44,
                  height: 44,
                  ml: 1,
                  border: disabled || !message.trim() ? '1px solid #e0e0e0' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isButtonPressed ? 'scale(0.95)' : 'scale(1)',
                  '&:hover': {
                    bgcolor: disabled || !message.trim() ? '#f0f0f0' : '#333',
                    transform: disabled || !message.trim() ? 'scale(1)' : 'scale(1.05)',
                    boxShadow: disabled || !message.trim() ? 'none' : '0 6px 20px rgba(31, 31, 31, 0.3)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  '&:disabled': {
                    bgcolor: '#f5f5f5',
                    color: '#bbb',
                    border: '1px solid #e0e0e0',
                  }
                }}
                aria-label="Send message"
              >
                <KeyboardArrowUp 
                  sx={{
                    transition: 'transform 0.3s ease',
                    transform: message.trim() ? 'translateY(0px)' : 'translateY(2px)',
                  }}
                />
              </IconButton>
            </Zoom>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default MessageInput; 
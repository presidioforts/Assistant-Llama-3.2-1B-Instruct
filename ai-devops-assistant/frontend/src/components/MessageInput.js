import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Chip, Typography } from '@mui/material';
import { KeyboardArrowUp, Chat, Search } from '@mui/icons-material';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState('ask');
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
        setLastMessage(message);
        onSendMessage(message.trim(), selectedMode);
        setMessage('');
      }
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: 'transparent',
        pb: 2,
        px: 3,
      }}
    >
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
        }}
      >
        {/* Mode Selection Chips */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          {modes.map((mode) => (
            <Chip
              key={mode.id}
              label={mode.label}
              icon={mode.icon}
              onClick={() => setSelectedMode(mode.id)}
              variant={selectedMode === mode.id ? 'filled' : 'outlined'}
              sx={{
                backgroundColor: selectedMode === mode.id ? '#FFCD41' : 'transparent',
                color: selectedMode === mode.id ? '#1F1F1F' : 'text.primary',
                borderColor: selectedMode === mode.id ? '#FFCD41' : '#e0e0e0',
                fontWeight: selectedMode === mode.id ? 600 : 400,
                '&:hover': {
                  backgroundColor: selectedMode === mode.id ? '#E6B800' : '#f5f5f5',
                },
                '& .MuiChip-icon': {
                  color: selectedMode === mode.id ? '#1F1F1F' : 'text.secondary',
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
              },
            }}
            inputProps={{
              'aria-label': 'Message input',
              style: { paddingRight: 0 },
            }}
            sx={{ ml: 0, flex: 1, minWidth: 0, '& fieldset': { border: 'none' } }}
          />

          {/* Send Button */}
          <IconButton
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            sx={{
              bgcolor: disabled || !message.trim() ? '#eee' : '#1F1F1F',
              color: disabled || !message.trim() ? '#aaa' : '#fff',
              borderRadius: '50%',
              width: 44,
              height: 44,
              ml: 1,
              '&:hover': {
                bgcolor: disabled || !message.trim() ? '#eee' : '#333',
              },
            }}
            aria-label="Send message"
          >
            <KeyboardArrowUp />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageInput; 
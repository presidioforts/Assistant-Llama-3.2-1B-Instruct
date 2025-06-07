import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Loader from './Loader';
import { chatService } from '../utils/chatService';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your DevOps AI Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage([...messages, userMessage]);
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '70vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {messages.map((message, index) => (
          <MessageBubble 
            key={index} 
            message={message} 
          />
        ))}
        {isLoading && <Loader />}
        <div ref={messagesEndRef} />
      </Box>
      
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={isLoading}
      />
    </Paper>
  );
};

export default ChatWindow; 
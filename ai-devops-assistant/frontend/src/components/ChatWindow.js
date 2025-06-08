import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Loader from './Loader';
import { chatService } from '../utils/chatService';

const ChatWindow = ({ 
  messages, 
  onMessagesUpdate, 
  activeConversation 
}) => {
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

    const updatedMessages = [...messages, userMessage];
    onMessagesUpdate(updatedMessages);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(updatedMessages);
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      onMessagesUpdate([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      onMessagesUpdate([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* Header at same level as New Chat button */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        minHeight: '64px', // Same height as New Chat button area
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
          Enterprise DevOps Assistant - Ask anything about infrastructure, deployment, monitoring
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: 'grey.50',
          minHeight: 0 // Allow flex child to shrink
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexGrow: 1,
            textAlign: 'center',
            color: 'text.secondary',
            minHeight: '300px', // Ensure minimum height for visibility
            py: 6
          }}>
            <Typography variant="h4" gutterBottom sx={{ 
              fontWeight: 600, 
              mb: 3,
              color: 'text.primary' // Make it more visible
            }}>
              👋 Welcome to DevOps AI Assistant
            </Typography>
            <Typography variant="body1" sx={{ 
              maxWidth: 500, 
              lineHeight: 1.6,
              mb: 2,
              color: 'text.secondary'
            }}>
              Start a conversation by asking about Docker, Kubernetes, CI/CD pipelines, 
              infrastructure automation, monitoring, or any DevOps-related topic.
            </Typography>
            <Typography variant="body2" sx={{ 
              mt: 2,
              color: 'text.secondary',
              fontWeight: 500
            }}>
              Enterprise-grade AI assistance for your DevOps needs
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <MessageBubble 
              key={index} 
              message={message} 
            />
          ))
        )}
        {isLoading && <Loader />}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Input Area */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={isLoading}
      />
    </Box>
  );
};

export default ChatWindow; 
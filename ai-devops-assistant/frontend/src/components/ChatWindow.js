import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Loader from './Loader';
import { chatService } from '../utils/chatService';
import { useConversations } from '../hooks/useConversations';

const ChatWindow = ({ 
  messages, 
  onMessagesUpdate, 
  activeConversation 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get the enhanced conversation functions
  const { 
    addMessageFeedback, 
    updateMessageStatus,
    addMessageToConversation,
    createMessage 
  } = useConversations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle feedback for messages
  const handleMessageFeedback = (messageId, feedback) => {
    if (feedback.type === 'edit') {
      // Update the message content and resend
      if (!activeConversation) return;
      const editedMessages = messages.map((m) =>
        m.id === messageId ? { ...m, content: feedback.content } : m
      );
      onMessagesUpdate(editedMessages);
      // Resend to backend
      resendEditedMessage(editedMessages);
      return;
    }
    if (activeConversation) {
      addMessageFeedback(activeConversation.id, messageId, feedback);
    }
  };

  const resendEditedMessage = async (editedMessages) => {
    // show sending placeholder
    const assistantMsg = createMessage(
      'assistant',
      '',
      editedMessages[editedMessages.length - 1].mode || 'ask',
      activeConversation?.id,
      'sending'
    );
    const withSending = [...editedMessages, assistantMsg];
    onMessagesUpdate(withSending);
    setIsLoading(true);
    try {
      const response = await chatService.sendMessage(editedMessages);
      const finalAssistant = { ...assistantMsg, content: response, status: 'sent' };
      const finalMessages = [...editedMessages, finalAssistant];
      onMessagesUpdate(finalMessages);
    } catch (err) {
      const errorAssistant = { ...assistantMsg, status: 'error', isError: true, content: 'Error processing edited message.' };
      onMessagesUpdate([...editedMessages, errorAssistant]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageContent, mode = 'ask') => {
    if (!messageContent.trim()) return;

    // Create user message with proper structure
    const userMessage = createMessage(
      'user',
      messageContent,
      mode,
      activeConversation?.id,
      'sent'
    );

    // Add user message to conversation
    const updatedMessages = [...messages, userMessage];
    onMessagesUpdate(updatedMessages);
    
    // Create assistant message with 'sending' status
    const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sendingMessage = createMessage(
      'assistant',
      '',
      mode,
      activeConversation?.id,
      'sending'
    );
    sendingMessage.id = assistantMessageId; // Override ID to track this specific message

    // Show sending status
    const messagesWithSending = [...updatedMessages, sendingMessage];
    onMessagesUpdate(messagesWithSending);
    setIsLoading(true);

    try {
      let response;
      
      if (mode === 'search') {
        // RAG search mode
        response = await chatService.searchKnowledge(messageContent);
      } else {
        // Regular AI chat mode
        response = await chatService.sendMessage(updatedMessages);
      }
      
      // Create successful assistant message
      const assistantMessage = createMessage(
        'assistant',
        response,
        mode,
        activeConversation?.id,
        'sent'
      );

      // Replace sending message with successful response
      const finalMessages = [...updatedMessages, assistantMessage];
      onMessagesUpdate(finalMessages);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create error message
      const errorMessage = createMessage(
        'assistant',
        mode === 'search' 
          ? 'I apologize, but I encountered an error while searching the knowledge base. Please try again.'
          : 'I apologize, but I encountered an error while processing your request. Please try again.',
        mode,
        activeConversation?.id,
        'error'
      );
      errorMessage.isError = true;

      // Replace sending message with error
      const errorMessages = [...updatedMessages, errorMessage];
      onMessagesUpdate(errorMessages);
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
          bgcolor: '#fafafa',
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
          messages.map((message) => (
            <MessageBubble 
              key={message.id || `fallback-${messages.indexOf(message)}`} // Use ID or fallback
              message={message}
              onFeedback={handleMessageFeedback}
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
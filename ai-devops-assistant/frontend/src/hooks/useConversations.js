import { useState, useEffect } from 'react';

const STORAGE_KEY = 'devops_ai_conversations';

// Generate unique message ID
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate unique conversation ID
const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create a properly structured message
const createMessage = (role, content, mode = 'ask', conversationId = null, status = 'sent') => {
  return {
    id: generateMessageId(),
    conversationId,
    role,
    content,
    timestamp: new Date().toISOString(),
    mode,
    status,
    feedback: null,
    metadata: {}
  };
};

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConversations = JSON.parse(stored);
        setConversations(parsedConversations);
        
        // Set active conversation to the most recent one
        if (parsedConversations.length > 0) {
          const mostRecent = parsedConversations.reduce((latest, current) => 
            new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
          );
          setActiveConversation(mostRecent);
        }
      }
    } catch (error) {
      console.error('Error loading conversations from localStorage:', error);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations to localStorage:', error);
    }
  }, [conversations]);

  // Generate conversation title from first message
  const generateConversationTitle = (messages) => {
    if (messages.length === 0) return 'New Conversation';
    
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      // Truncate to 50 characters and add ellipsis if needed
      const title = firstUserMessage.content.trim();
      return title.length > 50 ? title.substring(0, 50) + '...' : title;
    }
    
    return 'New Conversation';
  };

  // Create a new conversation
  const createNewConversation = () => {
    const conversationId = generateConversationId();
    const newConversation = {
      id: conversationId,
      title: 'New Conversation',
      messages: [],
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation);
    
    return newConversation;
  };

  // Find a message by ID within a conversation
  const findMessageById = (conversationId, messageId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return null;
    
    return conversation.messages.find(msg => msg.id === messageId);
  };

  // Update a specific message by ID
  const updateMessageById = (conversationId, messageId, updates) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = conv.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          );
          
          const updatedConv = {
            ...conv,
            messages: updatedMessages,
            lastModified: new Date().toISOString()
          };
          
          // Update active conversation if it's the current one
          if (activeConversation?.id === conversationId) {
            setActiveConversation(updatedConv);
          }
          
          return updatedConv;
        }
        return conv;
      })
    );
  };

  // Add feedback to a specific message
  const addMessageFeedback = (conversationId, messageId, feedback) => {
    const feedbackData = {
      type: feedback.type,
      comment: feedback.comment || null,
      timestamp: new Date().toISOString()
    };
    
    updateMessageById(conversationId, messageId, { feedback: feedbackData });
  };

  // Update message status (sending, sent, error)
  const updateMessageStatus = (conversationId, messageId, status) => {
    updateMessageById(conversationId, messageId, { status });
  };

  // Add a new message to a conversation
  const addMessageToConversation = (conversationId, role, content, mode = 'ask', status = 'sent') => {
    const newMessage = createMessage(role, content, mode, conversationId, status);
    
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, newMessage];
          const updatedConv = {
            ...conv,
            messages: updatedMessages,
            title: generateConversationTitle(updatedMessages),
            lastModified: new Date().toISOString()
          };
          
          // Update active conversation if it's the current one
          if (activeConversation?.id === conversationId) {
            setActiveConversation(updatedConv);
          }
          
          return updatedConv;
        }
        return conv;
      })
    );
    
    return newMessage;
  };

  // Update conversation messages (legacy support)
  const updateConversationMessages = (conversationId, messages) => {
    // Ensure all messages have proper structure
    const structuredMessages = messages.map(msg => {
      if (!msg.id) {
        // Convert legacy message to new structure
        return createMessage(
          msg.role,
          msg.content,
          msg.mode || 'ask',
          conversationId,
          msg.status || 'sent'
        );
      }
      return {
        ...msg,
        conversationId: msg.conversationId || conversationId,
        feedback: msg.feedback || null,
        metadata: msg.metadata || {}
      };
    });

    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: structuredMessages,
            title: generateConversationTitle(structuredMessages),
            lastModified: new Date().toISOString()
          };
          
          // Update active conversation if it's the current one
          if (activeConversation?.id === conversationId) {
            setActiveConversation(updatedConv);
          }
          
          return updatedConv;
        }
        return conv;
      })
    );
  };

  // Select a conversation
  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  // Delete a conversation
  const deleteConversation = (conversationId) => {
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.id !== conversationId);
      
      // If we deleted the active conversation, set a new active one
      if (activeConversation?.id === conversationId) {
        const newActive = filtered.length > 0 ? filtered[0] : null;
        setActiveConversation(newActive);
      }
      
      return filtered;
    });
  };

  // Get current conversation messages
  const getCurrentMessages = () => {
    return activeConversation?.messages || [];
  };

  // Update current conversation messages (legacy support)
  const updateCurrentMessages = (messages) => {
    if (activeConversation) {
      updateConversationMessages(activeConversation.id, messages);
    }
  };

  // Get messages by status
  const getMessagesByStatus = (conversationId, status) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return [];
    
    return conversation.messages.filter(msg => msg.status === status);
  };

  return {
    // Existing functions
    conversations,
    activeConversation,
    createNewConversation,
    selectConversation,
    deleteConversation,
    getCurrentMessages,
    updateCurrentMessages,
    updateConversationMessages,
    
    // NEW: Granular message operations
    findMessageById,
    updateMessageById,
    addMessageFeedback,
    updateMessageStatus,
    addMessageToConversation,
    getMessagesByStatus,
    
    // NEW: Utilities
    createMessage,
    generateMessageId,
    generateConversationId
  };
}; 
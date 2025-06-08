import { useState, useEffect } from 'react';

const STORAGE_KEY = 'devops_ai_conversations';

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
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation);
    
    return newConversation;
  };

  // Update conversation messages
  const updateConversationMessages = (conversationId, messages) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages,
            title: generateConversationTitle(messages),
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

  // Update current conversation messages
  const updateCurrentMessages = (messages) => {
    if (activeConversation) {
      updateConversationMessages(activeConversation.id, messages);
    }
  };

  return {
    conversations,
    activeConversation,
    createNewConversation,
    selectConversation,
    deleteConversation,
    getCurrentMessages,
    updateCurrentMessages,
    updateConversationMessages
  };
}; 
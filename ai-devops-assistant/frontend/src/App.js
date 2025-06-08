import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  useTheme,
  useMediaQuery,
  ThemeProvider
} from '@mui/material';
import enterpriseTheme from './theme/enterpriseTheme';
import { ChatBubble as ChatIcon, Menu as MenuIcon } from '@mui/icons-material';
import ChatWindow from './components/ChatWindow';
import ConversationSidebar from './components/ConversationSidebar';
import { useConversations } from './hooks/useConversations';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(enterpriseTheme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const {
    conversations,
    activeConversation,
    createNewConversation,
    selectConversation,
    deleteConversation,
    getCurrentMessages,
    updateCurrentMessages
  } = useConversations();

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewChat = () => {
    createNewConversation();
  };

  const handleSelectConversation = (conversation) => {
    selectConversation(conversation);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleMessagesUpdate = (messages) => {
    // If no active conversation, create one
    if (!activeConversation) {
      const newConv = createNewConversation();
      updateCurrentMessages(messages);
    } else {
      updateCurrentMessages(messages);
    }
  };

  return (
    <ThemeProvider theme={enterpriseTheme}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Top App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPiIKob-dEwvFz5_JE2QYKzkz7jdmc3O-YZQdRsGT8fuYl5dP3" 
              alt="Wells Fargo Logo"
              style={{
                height: '32px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            DevOps AI Assistant
          </Typography>
          
          {/* Future: User menu, settings, theme toggle */}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <ConversationSidebar
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: isMobile ? 0 : (sidebarOpen ? '320px' : 0),
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginTop: '64px', // Account for AppBar height
          height: 'calc(100vh - 64px)',
          width: isMobile ? '100%' : (sidebarOpen ? 'calc(100vw - 320px)' : '100%'),
          margin: 0,
          padding: 0
        }}
      >
        <ChatWindow
          messages={getCurrentMessages()}
          onMessagesUpdate={handleMessagesUpdate}
          activeConversation={activeConversation}
        />
      </Box>
    </Box>
    </ThemeProvider>
  );
}

export default App; 
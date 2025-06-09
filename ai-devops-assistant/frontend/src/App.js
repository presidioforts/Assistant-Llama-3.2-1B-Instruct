import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  useTheme,
  useMediaQuery,
  ThemeProvider,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import enterpriseTheme from './theme/enterpriseTheme';
import { ChatBubble as ChatIcon, Menu as MenuIcon, Settings, Person } from '@mui/icons-material';
import ChatWindow from './components/ChatWindow';
import ConversationSidebar from './components/ConversationSidebar';
import { useConversations } from './hooks/useConversations';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(enterpriseTheme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Profile state
  const [userName, setUserName] = useState('');
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [tempName, setTempName] = useState('');

  // Load user name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('devops_ai_user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

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

  // Profile functions
  const handleProfileClick = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleSetupProfile = () => {
    setTempName(userName);
    setNameDialogOpen(true);
    handleProfileMenuClose();
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('devops_ai_user_name', tempName.trim());
    }
    setNameDialogOpen(false);
    setTempName('');
  };

  const handleCancelName = () => {
    setNameDialogOpen(false);
    setTempName('');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
          
          {/* Profile Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleProfileClick}
              sx={{ ml: 2 }}
            >
              <Avatar 
                sx={{ 
                  width: 40,
                  height: 40,
                  bgcolor: userName ? '#D71921' : 'grey.500',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: 2
                }}
              >
                {userName ? getInitials(userName) : <Person fontSize="small" />}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleSetupProfile}>
          <Settings sx={{ mr: 1 }} fontSize="small" />
          {userName ? 'Edit Profile' : 'Setup Profile'}
        </MenuItem>
      </Menu>

      {/* Name Setup Dialog */}
      <Dialog open={nameDialogOpen} onClose={handleCancelName} maxWidth="sm" fullWidth>
        <DialogTitle>
          {userName ? 'Edit Your Profile' : 'Welcome! Setup Your Profile'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Name"
            fullWidth
            variant="outlined"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Enter your full name"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelName}>Cancel</Button>
          <Button 
            onClick={handleSaveName} 
            variant="contained"
            disabled={!tempName.trim()}
            sx={{ 
              bgcolor: '#FFCD41', 
              color: '#1F1F1F',
              '&:hover': { bgcolor: '#E6B800' }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
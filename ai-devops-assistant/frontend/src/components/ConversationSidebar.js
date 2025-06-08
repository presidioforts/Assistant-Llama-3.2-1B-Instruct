import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon
} from '@mui/icons-material';

const ConversationSidebar = ({ 
  isOpen, 
  onToggle, 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onNewChat 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    yesterday: true,
    lastWeek: true,
    older: false
  });

  // Group conversations by time period
  const groupConversationsByTime = (conversations) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return conversations.reduce((groups, conv) => {
      const convDate = new Date(conv.timestamp);
      
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= lastWeek) {
        groups.lastWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
      
      return groups;
    }, {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: []
    });
  };

  const groupedConversations = groupConversationsByTime(conversations);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const ConversationGroup = ({ title, conversations, sectionKey }) => {
    if (conversations.length === 0) return null;

    return (
      <>
        <ListItemButton 
          onClick={() => toggleSection(sectionKey)}
          sx={{ py: 1 }}
        >
          <ListItemText 
            primary={title} 
            primaryTypographyProps={{
              variant: 'subtitle2',
              fontWeight: 600,
              color: 'text.secondary'
            }}
          />
          {expandedSections[sectionKey] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={expandedSections[sectionKey]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {conversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                selected={activeConversation?.id === conv.id}
                onClick={() => onSelectConversation(conv)}
                sx={{ 
                  pl: 4,
                  py: 1,
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }
                }}
              >
                <ChatIcon sx={{ mr: 2, fontSize: 16 }} />
                <ListItemText 
                  primary={conv.title || 'New Conversation'}
                  primaryTypographyProps={{
                    variant: 'body2',
                    noWrap: true
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </>
    );
  };

  const sidebarContent = (
    <Box sx={{ 
      width: isMobile ? 280 : 320, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" fontWeight={600}>
          🔧 DevOps AI
        </Typography>
        {isMobile && (
          <IconButton onClick={onToggle} size="small">
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* New Chat Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewChat}
          color="warning"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: '#FFCD41',
            color: '#1F1F1F',
            '&:hover': {
              backgroundColor: '#E6B800'
            }
          }}
        >
          New Chat
        </Button>
      </Box>

      {/* Conversations List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 0 }}>
          <ConversationGroup 
            title="Today" 
            conversations={groupedConversations.today}
            sectionKey="today"
          />
          <ConversationGroup 
            title="Yesterday" 
            conversations={groupedConversations.yesterday}
            sectionKey="yesterday"
          />
          <ConversationGroup 
            title="Last 7 Days" 
            conversations={groupedConversations.lastWeek}
            sectionKey="lastWeek"
          />
          <ConversationGroup 
            title="Older" 
            conversations={groupedConversations.older}
            sectionKey="older"
          />
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        bgcolor: 'grey.50'
      }}>
        <Typography variant="caption" color="text.secondary">
          Enterprise DevOps Assistant
        </Typography>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      sx={{
        width: isOpen ? 320 : 0,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          position: 'relative',
          boxShadow: 'none'
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default ConversationSidebar; 
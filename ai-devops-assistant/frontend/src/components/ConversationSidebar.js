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
  Collapse,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import ChatHistoryIcon from './ChatHistoryIcon';

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
  
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('All Time');

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

  // Filter conversations based on search query
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter(conv => {
      const title = (conv.title || 'New Conversation').toLowerCase();
      const hasMatches = title.includes(query);
      
      // Also search in message content if available
      if (conv.messages && Array.isArray(conv.messages)) {
        const messageMatches = conv.messages.some(msg => 
          msg.content && msg.content.toLowerCase().includes(query)
        );
        return hasMatches || messageMatches;
      }
      
      return hasMatches;
    });
  }, [conversations, searchQuery]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleBackClick = () => {
    setIsHistoryExpanded(false);
    setSearchQuery('');
  };

  const handleHistoryClick = () => {
    setIsHistoryExpanded(!isHistoryExpanded);
    // Clear search when collapsing
    if (isHistoryExpanded) {
      setSearchQuery('');
    }
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
      width: isMobile ? 280 : (isHistoryExpanded ? 500 : 320), 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
      transition: 'width 0.3s ease'
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
        {isHistoryExpanded ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleBackClick} size="small" sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                Chat History
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="h6" fontWeight={600}>
            🔧 DevOps AI
          </Typography>
        )}
        {isMobile && (
          <IconButton onClick={onToggle} size="small">
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* New Chat Button + History Icon */}
      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewChat}
          color="warning"
          sx={{ 
            flex: 1,
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
        
        {/* Chat History Icon */}
        <IconButton
          onClick={handleHistoryClick}
          sx={{ 
            backgroundColor: isHistoryExpanded ? '#E6B800' : '#FFCD41',
            color: '#1F1F1F',
            borderRadius: 2,
            padding: '12px',
            minWidth: '48px',
            '&:hover': {
              backgroundColor: '#E6B800'
            }
          }}
        >
          <ChatHistoryIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Conversations List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isHistoryExpanded ? (
          // Expanded view with search and all conversations
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search Box */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  sx: {
                    backgroundColor: 'white',
                    borderRadius: 2,
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#FFCD41',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFCD41',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Box>
            
            {/* Conversations List */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <List sx={{ pt: 1, px: 1 }}>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
                  {searchQuery ? `Search Results (${filteredConversations.length})` : 'All Conversations'}
                </Typography>
                {filteredConversations.map((conv) => (
                  <ListItemButton
                    key={conv.id}
                    selected={activeConversation?.id === conv.id}
                    onClick={() => onSelectConversation(conv)}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <ChatIcon sx={{ mr: 2, fontSize: 16 }} />
                      <ListItemText 
                        primary={conv.title || 'New Conversation'}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                          noWrap: true
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ ml: 4, mt: 0.5 }}
                    >
                      {new Date(conv.timestamp).toLocaleDateString()} • {conv.messageCount || 0} messages
                    </Typography>
                  </ListItemButton>
                ))}
                
                {/* No Results Message */}
                {searchQuery && filteredConversations.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No conversations found for "{searchQuery}"
                    </Typography>
                  </Box>
                )}
              </List>
            </Box>
          </Box>
        ) : (
          // Collapsed view with grouped conversations
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
        )}
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
        width: isOpen ? (isHistoryExpanded ? 500 : 320) : 0,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: isHistoryExpanded ? 500 : 320,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          position: 'relative',
          boxShadow: 'none',
          transition: 'width 0.3s ease'
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default ConversationSidebar; 
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Snackbar,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  Person, 
  SmartToy, 
  Error, 
  ThumbUp, 
  ThumbDown, 
  ContentCopy,
  ThumbUpOutlined,
  ThumbDownOutlined,
  Schedule,
  CheckCircle,
  ErrorOutline,
  Edit, Save, Close
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

// Configure rehype-highlight to handle unknown languages gracefully
const rehypeHighlightConfig = {
  ignoreMissing: true,  // Don't throw errors for unknown languages
  subset: false,        // Allow all languages
  plainText: ['text', 'plain', 'txt'], // Fallback languages
  aliases: {
    'dockerfile': 'docker',
    'yml': 'yaml',
    'shell': 'bash',
    'sh': 'bash'
  }
};

const MessageBubble = ({ message, onFeedback }) => {
  const isUser = message.role === 'user';
  const isError = message.isError || message.status === 'error';
  
  // Feedback state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(message.content);

  const handleEditStart = () => {
    setIsEditing(true);
    setDraftText(message.content);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSave = () => {
    if (draftText.trim() && onFeedback) {
      // Reuse onFeedback prop slot for edit callback to avoid API change
      // We send special feedback type 'edit'
      onFeedback(message.id, { type: 'edit', content: draftText });
    }
    setIsEditing(false);
  };

  // Handle like button
  const handleLike = () => {
    const feedback = {
      type: 'like',
      timestamp: new Date().toISOString()
    };
    
    if (onFeedback) {
      onFeedback(message.id, feedback);
    }
  };

  // Handle dislike button - opens feedback dialog
  const handleDislike = () => {
    setFeedbackDialogOpen(true);
  };

  // Submit dislike feedback with optional text
  const handleSubmitDislike = () => {
    const feedback = {
      type: 'dislike',
      comment: feedbackText.trim() || null,
      timestamp: new Date().toISOString()
    };
    
    if (onFeedback) {
      onFeedback(message.id, feedback);
    }
    
    setFeedbackDialogOpen(false);
    setFeedbackText('');
  };

  // Cancel feedback dialog
  const handleCancelFeedback = () => {
    setFeedbackDialogOpen(false);
    setFeedbackText('');
  };

  // Copy message content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopySnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySnackbarOpen(true);
    }
  };

  // Check if message has existing feedback
  const hasLiked = message.feedback?.type === 'like';
  const hasDisliked = message.feedback?.type === 'dislike';

  // Get status icon and color
  const getStatusIndicator = () => {
    if (isUser) return null;
    
    switch (message.status) {
      case 'sending':
        return (
          <Chip 
            icon={<Schedule fontSize="small" />} 
            label="Sending..." 
            size="small" 
            variant="outlined"
            sx={{ ml: 1, height: '20px' }}
          />
        );
      case 'error':
        return (
          <Chip 
            icon={<ErrorOutline fontSize="small" />} 
            label="Error" 
            size="small" 
            color="error"
            variant="outlined"
            sx={{ ml: 1, height: '20px' }}
          />
        );
      case 'sent':
      default:
        return (
          <Chip 
            icon={<CheckCircle fontSize="small" />} 
            label="Sent" 
            size="small" 
            color="success"
            variant="outlined"
            sx={{ ml: 1, height: '20px', opacity: 0.6 }}
          />
        );
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 1,
          alignItems: 'flex-start'
        }}
      >
        {!isUser && (
          <Box sx={{ mr: 1, mt: 1 }}>
            {isError ? (
              <Error color="error" />
            ) : (
              <SmartToy color="primary" />
            )}
          </Box>
        )}
        
        <Box sx={{ maxWidth: '70%', minWidth: 280 }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: isError 
                ? 'error.light' 
                : isUser 
                  ? '#f0f2f5' // ChatGPT-like light grey for user messages
                  : '#ffffff',
              color: isError ? 'white' : 'text.primary',
              borderRadius: 2, // smoother rounded corners (theme spacing*2)
              border: '1px solid #e0e0e0'
            }}
          >
            <Box
              sx={{
                '& p': {
                  margin: '0 0 8px 0',
                  '&:last-child': { margin: 0 }
                },

                '& ul, & ol': {
                  paddingLeft: '20px',
                  margin: '8px 0',
                },
                '& li': {
                  margin: '4px 0',
                },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: isUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  paddingLeft: '12px',
                  margin: '8px 0',
                  fontStyle: 'italic',
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  margin: '16px 0 8px 0',
                  fontWeight: 'bold',
                  '&:first-child': { marginTop: 0 }
                },
                '& h1': { fontSize: '1.5rem' },
                '& h2': { fontSize: '1.3rem' },
                '& h3': { fontSize: '1.1rem' },
                '& table': {
                  borderCollapse: 'collapse',
                  width: '100%',
                  margin: '8px 0',
                },
                '& th, & td': {
                  border: '1px solid',
                  borderColor: isUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  padding: '6px 8px',
                  textAlign: 'left',
                },
                '& th': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  fontWeight: 'bold',
                },
                '& a': {
                  color: isUser ? 'lightblue' : 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {isUser ? (
                isEditing ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      multiline
                      fullWidth
                      minRows={3}
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={handleEditSave}>
                        <Save fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleEditCancel}>
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                )
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[[rehypeHighlight, rehypeHighlightConfig], rehypeRaw]}
                  components={{
                      p: ({ children }) => (
                        <Typography variant="body1" component="p">
                          {children}
                        </Typography>
                      ),
                      img: ({ node, alt, src, title, ...props }) => {
                        // Handle images with error fallback
                        return (
                          <Box
                            component="img"
                            src={src}
                            alt={alt || 'Image'}
                            title={title}
                            onError={(e) => {
                              // Hide broken images or show placeholder
                              e.target.style.display = 'none';
                              console.warn('Failed to load image:', src);
                            }}
                            sx={{
                              maxWidth: '100%',
                              height: 'auto',
                              borderRadius: 1,
                              mt: 1,
                              mb: 1,
                              border: '1px solid #e0e0e0'
                            }}
                            {...props}
                          />
                        );
                      },
                      code: ({ node, inline, className, children, ...props }) => {
                        if (inline) {
                          // Inline code (single backticks)
                          return (
                            <code
                              style={{
                                backgroundColor: 'rgba(0,0,0,0.08)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        // Block code (triple backticks) - use enhanced CodeBlock
                        return (
                          <CodeBlock 
                            className={className} 
                            {...props}
                          >
                            {children}
                          </CodeBlock>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
              )}
            </Box>
            
            {/* Timestamp and Status */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mt: 1 
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: '0.75rem'
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
              
              {getStatusIndicator()}
            </Box>
          </Paper>
          
          {/* Action buttons for assistant messages only */}
          {!isUser && !isError && message.status === 'sent' && (
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5, 
              mt: 1, 
              justifyContent: 'flex-start',
              opacity: 0.7,
              transition: 'opacity 0.2s ease',
              '&:hover': { opacity: 1 }
            }}>
              <Tooltip title={hasLiked ? 'You liked this response' : 'Like this response'}>
                <IconButton 
                  size="small" 
                  onClick={handleLike}
                  disabled={hasDisliked} // Can't like if already disliked
                  sx={{ 
                    color: hasLiked ? '#ffffff' : 'text.secondary',
                    bgcolor: hasLiked ? 'warning.main' : 'transparent',
                    '&:hover': { 
                      bgcolor: hasLiked ? 'warning.dark' : 'action.hover',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {hasLiked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={hasDisliked ? 'You disliked this response' : 'Dislike this response'}>
                <IconButton 
                  size="small" 
                  onClick={handleDislike}
                  disabled={hasLiked} // Can't dislike if already liked
                  sx={{ 
                    color: hasDisliked ? '#ffffff' : 'text.secondary',
                    bgcolor: hasDisliked ? 'error.main' : 'transparent',
                    '&:hover': { 
                      bgcolor: hasDisliked ? 'error.dark' : 'action.hover',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {hasDisliked ? <ThumbDown fontSize="small" /> : <ThumbDownOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Copy message">
                <IconButton 
                  size="small" 
                  onClick={handleCopy}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      bgcolor: 'action.hover',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Show feedback comment if exists */}
          {message.feedback?.comment && (
            <Box sx={{ 
              mt: 1, 
              p: 1, 
              bgcolor: 'action.hover', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Your feedback: "{message.feedback.comment}"
              </Typography>
            </Box>
          )}
        </Box>
        
        {isUser && (
          <Box sx={{ ml: 1, mt: 1 }}>
            <Person color="action" />
          </Box>
        )}
        {isUser && !isEditing && (
          <IconButton size="small" onClick={handleEditStart} sx={{ ml: 1 }}>
            <Edit fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Feedback Dialog for Dislikes */}
      <Dialog 
        open={feedbackDialogOpen} 
        onClose={handleCancelFeedback}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Help us improve
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            What could have been better about this response? (Optional)
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            placeholder="Tell us what went wrong or how we can improve..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelFeedback}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitDislike}
            variant="contained"
            color="primary"
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={2000}
        onClose={() => setCopySnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopySnackbarOpen(false)} 
          severity="success" 
          variant="filled"
        >
          Message copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default MessageBubble; 
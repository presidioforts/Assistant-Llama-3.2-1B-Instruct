import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Person, SmartToy, Error } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
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
      
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          backgroundColor: isUser 
            ? 'primary.main' 
            : isError 
              ? 'error.light' 
              : 'grey.100',
          color: isUser ? 'white' : 'text.primary'
        }}
      >
        <Box
          sx={{
            '& p': {
              margin: '0 0 8px 0',
              '&:last-child': { margin: 0 }
            },
            '& pre': {
              backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto',
              margin: '8px 0',
              fontSize: '0.875rem',
              fontFamily: 'Monaco, "Roboto Mono", monospace',
            },
            '& code': {
              backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontFamily: 'Monaco, "Roboto Mono", monospace',
            },
            '& pre code': {
              backgroundColor: 'transparent',
              padding: 0,
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
              backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              fontWeight: 'bold',
            },
            '& a': {
              color: isUser ? 'lightblue' : 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          {isUser ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                p: ({ children }) => (
                  <Typography variant="body1" component="p">
                    {children}
                  </Typography>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 1, 
            opacity: 0.7,
            fontSize: '0.75rem'
          }}
        >
          {message.timestamp.toLocaleTimeString()}
        </Typography>
      </Paper>
      
      {isUser && (
        <Box sx={{ ml: 1, mt: 1 }}>
          <Person color="action" />
        </Box>
      )}
    </Box>
  );
};

export default MessageBubble; 
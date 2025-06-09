import React, { useState } from 'react';
import { Box, IconButton, Typography, Alert, Snackbar } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ 
  children, 
  className, 
  language = '', 
  showLineNumbers = true,
  style = {}
}) => {
  const [copied, setCopied] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Extract language from className (format: "language-javascript")
  const detectedLanguage = className ? className.replace('language-', '') : language;
  const displayLanguage = detectedLanguage || 'text';

  // Code content
  const codeContent = typeof children === 'string' ? children : children?.props?.children || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setShowSnackbar(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = codeContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setShowSnackbar(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  // Language mapping for better display names
  const languageMap = {
    'js': 'JavaScript',
    'jsx': 'React JSX',
    'ts': 'TypeScript',
    'tsx': 'React TSX',
    'py': 'Python',
    'bash': 'Bash',
    'sh': 'Shell',
    'yaml': 'YAML',
    'yml': 'YAML',
    'json': 'JSON',
    'dockerfile': 'Dockerfile',
    'sql': 'SQL',
    'xml': 'XML',
    'html': 'HTML',
    'css': 'CSS',
    'terraform': 'Terraform',
    'hcl': 'HCL'
  };

  const displayName = languageMap[displayLanguage.toLowerCase()] || displayLanguage.toUpperCase();

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #333',
          mb: 2,
          fontFamily: '"JetBrains Mono", "Roboto Mono", "Courier New", monospace',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          ...style
        }}
      >
        {/* Header with language and copy button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#2d2d2d',
            px: 2,
            py: 1,
            borderBottom: '1px solid #404040'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#cccccc',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.5px',
              fontFamily: '"Inter", "Roboto", sans-serif'
            }}
          >
            {displayName}
          </Typography>
          
          <IconButton
            onClick={handleCopy}
            size="small"
            sx={{
              color: copied ? '#4ade80' : '#cccccc',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: copied ? '#4ade80' : '#ffffff'
              }
            }}
          >
            {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
          </IconButton>
        </Box>

        {/* Enhanced syntax highlighting */}
        <SyntaxHighlighter
          language={displayLanguage.toLowerCase()}
          style={oneDark}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '16px',
            backgroundColor: 'transparent',
            fontFamily: '"JetBrains Mono", "Roboto Mono", "Courier New", monospace',
            fontSize: '0.875rem',
            lineHeight: 1.5
          }}
          lineNumberStyle={{
            color: '#858585',
            backgroundColor: '#252526',
            paddingLeft: '12px',
            paddingRight: '12px',
            borderRight: '1px solid #404040',
            userSelect: 'none'
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </Box>

      {/* Copy success snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ 
            backgroundColor: '#4ade80',
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff'
            }
          }}
        >
          Code copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default CodeBlock; 
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
  let detectedLanguage = className ? className.replace('language-', '') : language;
  
  // Handle "hljs [language]" format by converting to "hljs-[language]"
  if (detectedLanguage && detectedLanguage.startsWith('hljs ')) {
    detectedLanguage = detectedLanguage.replace('hljs ', 'hljs-');
  }
  
  const displayLanguage = detectedLanguage || 'text';

  // Code content extraction - handle string, array, or nested props
  let codeContent = '';
  if (typeof children === 'string') {
    codeContent = children;
  } else if (Array.isArray(children)) {
    // Extract text from each array element, handling nested React elements to avoid [object Object]
    codeContent = children.map((child) => {
      if (typeof child === 'string') {
        return child;
      }
      if (child && typeof child === 'object' && child.props && child.props.children) {
        if (typeof child.props.children === 'string') {
          return child.props.children;
        }
        if (Array.isArray(child.props.children)) {
          return child.props.children.join('');
        }
      }
      // Non-string child – ignore to prevent [object Object]
      return '';
    }).join('');
  } else if (children && typeof children === 'object' && children.props && children.props.children) {
    // Nested React element with its own children
    if (typeof children.props.children === 'string') {
      codeContent = children.props.children;
    } else if (Array.isArray(children.props.children)) {
      codeContent = children.props.children.join('');
    }
  }

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

  // Language mapping for syntax highlighting and display names
  const languageMap = {
    'js': { highlight: 'javascript', display: 'JavaScript' },
    'jsx': { highlight: 'jsx', display: 'React JSX' },
    'ts': { highlight: 'typescript', display: 'TypeScript' },
    'tsx': { highlight: 'tsx', display: 'React TSX' },
    'py': { highlight: 'python', display: 'Python' },
    'python': { highlight: 'python', display: 'Python' },
    'bash': { highlight: 'bash', display: 'Bash' },
    'sh': { highlight: 'bash', display: 'Shell' },
    'shell': { highlight: 'bash', display: 'Shell' },
    'yaml': { highlight: 'yaml', display: 'YAML' },
    'yml': { highlight: 'yaml', display: 'YAML' },
    'k8s': { highlight: 'yaml', display: 'Kubernetes YAML' },
    'kubernetes': { highlight: 'yaml', display: 'Kubernetes YAML' },
    'json': { highlight: 'json', display: 'JSON' },
    'dockerfile': { highlight: 'docker', display: 'Dockerfile' },
    'docker': { highlight: 'docker', display: 'Docker' },
    'sql': { highlight: 'sql', display: 'SQL' },
    'xml': { highlight: 'xml', display: 'XML' },
    'html': { highlight: 'html', display: 'HTML' },
    'css': { highlight: 'css', display: 'CSS' },
    'terraform': { highlight: 'hcl', display: 'Terraform' },
    'hcl': { highlight: 'hcl', display: 'HCL' },
    'tf': { highlight: 'hcl', display: 'Terraform' },
    'javascript': { highlight: 'javascript', display: 'JavaScript' },
    'text': { highlight: 'text', display: 'Text' },
    'plaintext': { highlight: 'text', display: 'Plain Text' },
    
    // HLJS prefixed languages (highlight.js format)
    'hljs-dockerfile': { highlight: 'docker', display: 'Dockerfile' },
    'hljs-docker': { highlight: 'docker', display: 'Docker' },
    'hljs-yaml': { highlight: 'yaml', display: 'YAML' },
    'hljs-python': { highlight: 'python', display: 'Python' },
    'hljs-javascript': { highlight: 'javascript', display: 'JavaScript' },
    'hljs-bash': { highlight: 'bash', display: 'Bash' },
    'hljs-sql': { highlight: 'sql', display: 'SQL' },
    'hljs-json': { highlight: 'json', display: 'JSON' },
    'hljs-hcl': { highlight: 'hcl', display: 'HCL' },
    'hljs-terraform': { highlight: 'hcl', display: 'Terraform' }
  };
  
  // Get language info or fallback to text
  const langKey = displayLanguage.toLowerCase();
  const langInfo = languageMap[langKey] || { highlight: 'text', display: displayLanguage.toUpperCase() };
  const highlightLanguage = langInfo.highlight;
  const displayName = langInfo.display;
  
  // Debug logging and handling for empty content
  if (!codeContent.trim()) {
    console.warn(`Empty code block detected with language: ${displayLanguage}`, { 
      className, 
      children,
      childrenType: typeof children,
      childrenStructure: children 
    });
    
    // If content is empty, show a placeholder
    const placeholderContent = `# ${displayName} code example would go here\n# Content appears to be empty or not parsed correctly`;
    
    return (
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px dashed #666', // Dashed border to indicate placeholder
          mb: 2,
          fontFamily: '"JetBrains Mono", "Roboto Mono", "Courier New", monospace',
          fontSize: '0.875rem',
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
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
            {displayName} (Empty)
          </Typography>
        </Box>
        
        {/* Placeholder content */}
        <Box sx={{ p: 2, color: '#888', fontStyle: 'italic' }}>
          <Typography variant="body2">
            Code block detected but content is empty or not parsed correctly.
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Language: {displayLanguage} | Expected: {displayName}
          </Typography>
        </Box>
      </Box>
    );
  }

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

        {/* Enhanced syntax highlighting with error handling */}
        <SyntaxHighlighter
          language={highlightLanguage}
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
          onError={(error) => {
            console.warn(`Syntax highlighting failed for language '${highlightLanguage}':`, error);
            // Fallback to plain text if highlighting fails
            return false;
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
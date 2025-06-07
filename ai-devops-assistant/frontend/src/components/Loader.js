import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { SmartToy } from '@mui/icons-material';

const Loader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        mb: 1,
        ml: 2
      }}
    >
      <Box sx={{ mr: 1 }}>
        <SmartToy color="primary" />
      </Box>
      
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: 2,
          backgroundColor: 'grey.100',
          borderRadius: 2
        }}
      >
        <CircularProgress size={20} sx={{ mr: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Thinking...
        </Typography>
      </Box>
    </Box>
  );
};

export default Loader; 
import React from 'react';
import { SvgIcon } from '@mui/material';

const ChatHistoryIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* List lines */}
      <rect x="3" y="4" width="10" height="2" fill="currentColor" />
      <rect x="3" y="8" width="8" height="2" fill="currentColor" />
      <rect x="3" y="12" width="6" height="2" fill="currentColor" />
      <rect x="3" y="16" width="4" height="2" fill="currentColor" />
      
      {/* Magnifying glass */}
      <circle 
        cx="15.5" 
        cy="14.5" 
        r="3" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      <line 
        x1="17.5" 
        y1="16.5" 
        x2="20.5" 
        y2="19.5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};

export default ChatHistoryIcon; 
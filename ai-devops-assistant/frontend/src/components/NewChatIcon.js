import React from 'react';
import { SvgIcon } from '@mui/material';

const NewChatIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Large chat bubble with tail pointing right (outgoing message) */}
      <path
        d="M2 2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4l4 4v-4H2c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z"
        fill="#D71921"
        stroke="#D71921"
        strokeWidth="0.2"
      />
      {/* White plus sign - centered and prominent */}
      <path
        d="M12 5v10M7 10h10"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};

export default NewChatIcon; 
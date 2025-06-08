import { createTheme } from '@mui/material/styles';

// Enterprise DevOps Color Palette
const enterpriseColors = {
  primary: '#1e3a8a',        // Deep blue - professional and trustworthy
  primaryLight: '#3b82f6',   // Lighter blue for hover states
  primaryDark: '#1e40af',    // Darker blue for accents
  
  secondary: '#64748b',      // Slate gray - neutral and professional
  secondaryLight: '#94a3b8', // Light slate for subtle elements
  secondaryDark: '#475569',  // Dark slate for text
  
  success: '#10b981',        // Emerald green - for success states
  successLight: '#34d399',   // Light emerald for backgrounds
  successDark: '#059669',    // Dark emerald for text
  
  warning: '#FFCD41',        // Wells Fargo yellow - for warnings and accent
  warningLight: '#FFF59D',   // Light Wells Fargo yellow for backgrounds
  warningDark: '#E6B800',    // Darker Wells Fargo yellow for text
  
  error: '#ef4444',          // Red - for errors
  errorLight: '#f87171',     // Light red for backgrounds
  errorDark: '#dc2626',      // Dark red for text
  
  background: '#ffffff',     // White background
  surface: '#f8fafc',        // Very light blue-gray for surfaces
  surfaceDark: '#e2e8f0',    // Slightly darker surface
  
  text: '#0f172a',           // Very dark blue-gray for primary text
  textSecondary: '#475569',  // Medium gray for secondary text
  textMuted: '#94a3b8',      // Light gray for muted text
  
  border: '#e2e8f0',         // Light border color
  divider: '#cbd5e1',        // Divider color
};

const enterpriseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: enterpriseColors.primary,
      light: enterpriseColors.primaryLight,
      dark: enterpriseColors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: enterpriseColors.secondary,
      light: enterpriseColors.secondaryLight,
      dark: enterpriseColors.secondaryDark,
      contrastText: '#ffffff',
    },
    success: {
      main: enterpriseColors.success,
      light: enterpriseColors.successLight,
      dark: enterpriseColors.successDark,
      contrastText: '#ffffff',
    },
    warning: {
      main: enterpriseColors.warning,
      light: enterpriseColors.warningLight,
      dark: enterpriseColors.warningDark,
      contrastText: '#ffffff',
    },
    error: {
      main: enterpriseColors.error,
      light: enterpriseColors.errorLight,
      dark: enterpriseColors.errorDark,
      contrastText: '#ffffff',
    },
    background: {
      default: enterpriseColors.background,
      paper: enterpriseColors.surface,
    },
    text: {
      primary: enterpriseColors.text,
      secondary: enterpriseColors.textSecondary,
    },
    divider: enterpriseColors.divider,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: enterpriseColors.text,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      color: enterpriseColors.text,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      color: enterpriseColors.text,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      color: enterpriseColors.text,
    },
    h5: {
      fontWeight: 600,
      color: enterpriseColors.text,
    },
    h6: {
      fontWeight: 600,
      color: enterpriseColors.text,
    },
    subtitle1: {
      fontWeight: 500,
      color: enterpriseColors.textSecondary,
    },
    subtitle2: {
      fontWeight: 500,
      color: enterpriseColors.textSecondary,
    },
    body1: {
      color: enterpriseColors.text,
      lineHeight: 1.7,
    },
    body2: {
      color: enterpriseColors.textSecondary,
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
        MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFCD41',
          color: '#1F1F1F',
          boxShadow: '0 1px 3px rgba(255, 205, 65, 0.12), 0 1px 2px rgba(255, 205, 65, 0.24)',
          borderBottom: `1px solid #E6B800`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${enterpriseColors.border}`,
          backgroundColor: enterpriseColors.surface,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: enterpriseColors.primary,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: enterpriseColors.primaryDark,
            },
            '& .MuiListItemIcon-root': {
              color: '#ffffff',
            },
            '& .MuiListItemText-primary': {
              color: '#ffffff',
              fontWeight: 600,
            },
          },
          '&:hover': {
            backgroundColor: enterpriseColors.primaryLight + '10',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: enterpriseColors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: enterpriseColors.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default enterpriseTheme; 
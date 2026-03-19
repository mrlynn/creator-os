import { createTheme } from '@mui/material/styles';

// Creator OS brand colors from logo: orange→yellow, purple→magenta, blue→cyan
export const brandColors = {
  orange: '#FF8C00',
  gold: '#FFD700',
  purple: '#8A2BE2',
  magenta: '#D946EF',
  blue: '#2563EB',
  cyan: '#06B6D4',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: brandColors.purple,
      light: brandColors.magenta,
      dark: '#6D28D9',
      contrastText: '#fff',
    },
    secondary: {
      main: brandColors.cyan,
      light: '#22D3EE',
      dark: '#0891B2',
      contrastText: '#fff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: [
      'var(--font-inter)',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Roboto"',
      '"Oxygen"',
      '"Ubuntu"',
      '"Cantarell"',
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0,0,0,0.08)',
    '0 2px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
    '0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.04)',
    '0 8px 20px -4px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.04)',
    '0 12px 28px -4px rgba(0,0,0,0.1), 0 6px 12px -2px rgba(0,0,0,0.04)',
    '0 16px 36px -4px rgba(0,0,0,0.1), 0 8px 16px -2px rgba(0,0,0,0.04)',
    '0 20px 44px -4px rgba(0,0,0,0.12), 0 10px 20px -2px rgba(0,0,0,0.06)',
    '0 24px 52px -4px rgba(0,0,0,0.12), 0 12px 24px -2px rgba(0,0,0,0.06)',
    '0 28px 60px -4px rgba(0,0,0,0.14), 0 14px 28px -2px rgba(0,0,0,0.08)',
    '0 32px 68px -4px rgba(0,0,0,0.14), 0 16px 32px -2px rgba(0,0,0,0.08)',
    '0 36px 76px -4px rgba(0,0,0,0.16), 0 18px 36px -2px rgba(0,0,0,0.08)',
    '0 40px 84px -4px rgba(0,0,0,0.16), 0 20px 40px -2px rgba(0,0,0,0.1)',
    '0 44px 92px -4px rgba(0,0,0,0.18), 0 22px 44px -2px rgba(0,0,0,0.1)',
    '0 48px 100px -4px rgba(0,0,0,0.18), 0 24px 48px -2px rgba(0,0,0,0.1)',
    '0 52px 108px -4px rgba(0,0,0,0.2), 0 26px 52px -2px rgba(0,0,0,0.12)',
    '0 56px 116px -4px rgba(0,0,0,0.2), 0 28px 56px -2px rgba(0,0,0,0.12)',
    '0 60px 124px -4px rgba(0,0,0,0.22), 0 30px 60px -2px rgba(0,0,0,0.14)',
    '0 64px 132px -4px rgba(0,0,0,0.22), 0 32px 64px -2px rgba(0,0,0,0.14)',
    '0 68px 140px -4px rgba(0,0,0,0.24), 0 34px 68px -2px rgba(0,0,0,0.14)',
    '0 72px 148px -4px rgba(0,0,0,0.24), 0 36px 72px -2px rgba(0,0,0,0.16)',
    '0 76px 156px -4px rgba(0,0,0,0.26), 0 38px 76px -2px rgba(0,0,0,0.16)',
    '0 80px 164px -4px rgba(0,0,0,0.26), 0 40px 80px -2px rgba(0,0,0,0.16)',
    '0 84px 172px -4px rgba(0,0,0,0.28), 0 42px 84px -2px rgba(0,0,0,0.18)',
    '0 88px 180px -4px rgba(0,0,0,0.28), 0 44px 88px -2px rgba(0,0,0,0.18)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
          borderRadius: 10,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          '@media (pointer: fine)': {
            minHeight: 36,
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #8A2BE2 0%, #A855F7 100%)',
          boxShadow: '0 2px 8px -2px rgba(138, 43, 226, 0.4), 0 1px 2px rgba(0,0,0,0.06)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
            boxShadow: '0 4px 12px -2px rgba(138, 43, 226, 0.5), 0 2px 4px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 10,
          '@media (pointer: fine)': {
            padding: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        },
      },
    },
  },
});

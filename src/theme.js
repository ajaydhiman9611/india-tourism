import { createTheme, alpha } from '@mui/material/styles';

const SAFFRON = '#E05A1B';
const FOREST  = '#1B7A3E';
const NAVY    = '#1C1C2E';
const GOLD    = '#C9A84C';
const CREAM   = '#FAFAF8';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: SAFFRON,
      light: '#F07A45',
      dark: '#B84814',
      contrastText: '#fff',
    },
    secondary: {
      main: FOREST,
      light: '#2DA357',
      dark: '#145C2F',
      contrastText: '#fff',
    },
    background: {
      default: CREAM,
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1C2E',
      secondary: '#5A5A72',
    },
    divider: 'rgba(0,0,0,0.08)',
    gold: {
      main: GOLD,
      light: '#D9C070',
      dark: '#A88630',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
    },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
    '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
    '0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04)',
    '0 25px 50px rgba(0,0,0,0.10)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${SAFFRON} 0%, #F07A45 100%)`,
          boxShadow: `0 4px 14px ${alpha(SAFFRON, 0.35)}`,
          '&:hover': {
            background: `linear-gradient(135deg, #B84814 0%, ${SAFFRON} 100%)`,
            boxShadow: `0 6px 20px ${alpha(SAFFRON, 0.5)}`,
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${FOREST} 0%, #2DA357 100%)`,
          boxShadow: `0 4px 14px ${alpha(FOREST, 0.35)}`,
          '&:hover': {
            boxShadow: `0 6px 20px ${alpha(FOREST, 0.5)}`,
            transform: 'translateY(-1px)',
          },
        },
        outlinedPrimary: {
          borderColor: alpha(SAFFRON, 0.6),
          '&:hover': { borderColor: SAFFRON, background: alpha(SAFFRON, 0.05) },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
          '&:hover': {
            boxShadow: '0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04)',
            transform: 'translateY(-3px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
        elevation1: { boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)' },
        elevation2: { boxShadow: '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)' },
        elevation3: { boxShadow: '0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.78rem',
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(SAFFRON, 0.15)}`,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: CREAM,
          scrollbarColor: `${alpha(SAFFRON, 0.4)} transparent`,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(SAFFRON, 0.35),
            borderRadius: '999px',
            '&:hover': { background: alpha(SAFFRON, 0.6) },
          },
        },
      },
    },
  },
});

export default theme;

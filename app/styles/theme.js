// app/styles/theme.ts
'use client'; // This directive is important for client-side functionality in Next.js App Router

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Force light mode
    // You can customize other palette properties here if needed,
    // for example, primary and secondary colors:
    // primary: {
    //   main: '#1976d2',
    // },
    // secondary: {
    //   main: '#dc004e',
    // },
  },
  // You can also add custom typography, components, etc. here
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Example: disable shadows on buttons by default
      },
      styleOverrides: {
        root: {
          textTransform: 'none', // Example: prevent uppercase buttons by default
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled', // Ensure TextFields use 'filled' variant by default if desired
        size: 'small', // Ensure TextFields use 'small' size by default if desired
      },
    },
  },
});

export default theme;
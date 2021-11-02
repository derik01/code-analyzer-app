import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import React from 'react';

declare module '@mui/material/styles' {
  interface Palette {
    bg: Palette['primary'];
  }

  interface PaletteOptions {
    bg?: PaletteOptions['primary'];
  }

  // interface PaletteColor {
  //   white0?: string;
  // }
  // interface SimplePaletteColorOptions {
  //   white0?: string;
  // }
}

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6'
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    bg: {
      main: '#ffffff'
    }
  },
});

export default theme;
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function Index() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Code Analyizer
          </Typography>
          <Button
            href="/login"
            id="loginBtn"
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            position="right"
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            href="/register"
            id="loginBtn"
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            position="right"
            sx={{ mr: 2 }}
          >
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
import React, { FC } from 'react';

import {
    Toolbar, 
    IconButton,
    Typography, 
    Button,
    Tooltip
} from '@mui/material';

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import MenuIcon from '@mui/icons-material/Menu';

import { styled } from '@mui/material/styles';

import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

import { drawerWidth } from '../constants';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

type EventCallback = (event: React.KeyboardEvent | React.MouseEvent) => void;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}
  
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const HeaderBar : FC = () =>  (
    <AppBar
        position="static"
        color="bg"
        sx={{
            marginBottom: '3em',
        }}
    >
        <Toolbar color="primary">
            <IconButton
                color="primary"
                aria-label="code analyzer-logo" 
                size="large"
            >
                <CodeIcon
                    fontSize="inherit"
                />            
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Code Analyzer
            </Typography>
            <Button 
                color="primary"
                variant="outlined"
            >Logout</Button>
        </Toolbar>
    </AppBar>
);

type ProjectBarProps = {
    handleOpenTree: EventCallback;
    treeIsOpen: boolean;
    sharing: boolean;
};

const ProjectBar : FC<ProjectBarProps> = ({
    treeIsOpen,
    handleOpenTree,
    sharing
} : ProjectBarProps) => (
    <AppBar
      position="fixed"
      open={treeIsOpen}
      sx={{
        zIndex: 10000
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleOpenTree}
          edge="start"
          sx={{ mr: 2, ...(treeIsOpen && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }} noWrap component="div">
          Analysis Results
        </Typography>
        { !sharing ? (<>
            <Tooltip title="Copy Sharing Link">
                <IconButton
                    size="large"
                    aria-label="sharing link"
                    aria-haspopup="true"
                    color="inherit"
                    onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.append('sharing', 'true');
                        navigator.clipboard.writeText(url.toString());
                    }}
                >
                    <LinkIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Dashboard">
                <IconButton
                    size="large"
                    aria-label="return to dashboard"
                    aria-haspopup="true"
                    color="inherit"
                    href="/dashboard"
                >
                    <KeyboardReturnIcon />
                </IconButton>
            </Tooltip>
            </>) 
            : undefined 
        }
      </Toolbar>
    </AppBar>
);

export { DrawerHeader, ProjectBar };

export default HeaderBar;
import { Grid, Typography } from '@mui/material';
import React, { FC, useState } from 'react';

import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import TreeItem from '@mui/lab/TreeItem';
import Drawer from '@mui/material/Drawer';

import CODE_STRING from './tmp_codefile';

import SyntaxHighlighter from 'react-syntax-highlighter';
import stackoverflow from 'react-syntax-highlighter/dist/cjs/styles/hljs/stackoverflow-dark';

import { styled, useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import { SourceMap } from '../lib/LinterAnalysis';

const drawerWidth = 360;

type EventCallback = (event: React.KeyboardEvent | React.MouseEvent) => void;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'treeIsOpen' })<{
  treeIsOpen?: boolean;
}>(({ theme, treeIsOpen }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(treeIsOpen && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


type CodeTreeProps = {
  treeIsOpen: boolean;
  handleCloseTree: EventCallback;
  sourceMap: SourceMap;
};

const CodeTree : FC<CodeTreeProps> = ({treeIsOpen, handleCloseTree, sourceMap} : CodeTreeProps) => {
    const theme = useTheme();  

    const items = Object.entries(sourceMap).map(([fileName, sourceFile]) => {
      return (
      <TreeItem 
        nodeId={sourceFile.id} 
        label={fileName} 
        key={sourceFile.id}
      >
        {
          sourceFile.Diagnostics.map((diagnostic, idx) => {
            const uniqueKey = `${sourceFile.id}${idx}`;

            return (
              <TreeItem 
                key={uniqueKey}
                nodeId={uniqueKey}
                label={diagnostic.DiagnosticMessage.Message}
              />
            );
          })
        }
      </TreeItem>
      );
    })

    return (
      <Drawer
        anchor={'left'}
        open={treeIsOpen}
        onClose={handleCloseTree}
        variant="persistent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleCloseTree}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
            <TreeView
              aria-label="file system navigator"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{ height: 240, flexGrow: 1, maxWidth: 360, overflowY: 'auto' }}
            >
              {items}
            </TreeView>
      </Drawer>
    );
};

type CodeViewerProps = {
  treeIsOpen: boolean;
};

const CodeViewer : FC<CodeViewerProps> = ({treeIsOpen} : CodeViewerProps) => {
    return (
      <Main treeIsOpen={treeIsOpen}>
        <DrawerHeader />
        <Typography variant="h4" gutterBottom>DLList.cpp</Typography>
        <SyntaxHighlighter 
            language='cpp' 
            style={{
                ...stackoverflow
            }}
            customStyle={{
              fontFamily: "'Fira Code', 'monospace'",
              borderRadius: '10px'
            }}
            showLineNumbers
            wrapLongLines
        >
            {CODE_STRING}
        </SyntaxHighlighter>
      </Main>
    );
};

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

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


type ProjectBarProps = {
  handleOpenTree: EventCallback;
  treeIsOpen: boolean;
};

import LinkIcon from '@mui/icons-material/Link';
import { SourceMap, UploadResult } from '../lib/LinterAnalysis';

const ProjectBar : FC<ProjectBarProps> = ({treeIsOpen, handleOpenTree} : ProjectBarProps) => (
  <AppBar position="fixed" open={treeIsOpen}>
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
        Project 2
      </Typography>
      <IconButton
              size="large"
              aria-label="sharing link"
              //aria-controls={mobileMenuId}
              aria-haspopup="true"
              //onClick={handleMobileMenuOpen}
              color="inherit"
      >
        <LinkIcon />
      </IconButton>
    </Toolbar>
  </AppBar>
);



export default function Analyizer() {
  const [treeIsOpen, setTreeIsOpen] = useState(true);
  const sourceMap : SourceMap = {
    "DLList.h": {
      id: 'fe95fa5f81f6dc8615b1436cae8b3101d8657cd0',
      Diagnostics: [{
        BuildDirectory: '/back-end',
        DiagnosticName: 'Unexpected token',
        DiagnosticMessage: {
          FileOffset: 26,
          Path: 'DLList.h',
          Message: 'Issue with token',
          Replacements: ''
        },
        Level: 'Warning',
      }]
    },
    "DLList.cpp": {
      id: 'fd1dd50450c76b4b43a4f9dc251ee73356c9a2c7',
      Diagnostics: []
    },
    "DLList-main.cpp": {
      id: '4a1906115e6eccb7692350644a9480585ae0371e',
      Diagnostics: []
    }
  };

  const toggleTree =
    (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setTreeIsOpen(open);
  };


    return (
        <Box sx={{ display: 'flex' }}>
          <ProjectBar 
            treeIsOpen={treeIsOpen} 
            handleOpenTree={toggleTree(true)}
          />
          <CodeTree 
            treeIsOpen={treeIsOpen}
            sourceMap={sourceMap}
            handleCloseTree={toggleTree(false)}
          />
          <CodeViewer treeIsOpen={treeIsOpen} />
        </Box>
    );
}
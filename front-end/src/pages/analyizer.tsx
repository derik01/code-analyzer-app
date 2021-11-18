import React, { FC, useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { Typography } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';

import { Box } from '@mui/system';

import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';

import SyntaxHighlighter from 'react-syntax-highlighter';
import stackoverflow from 'react-syntax-highlighter/dist/cjs/styles/hljs/stackoverflow-dark';

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
  onFileSelect: (file_id : string, idx : number | null) => void;
};

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const CodeTree : FC<CodeTreeProps> = ({onFileSelect, treeIsOpen, handleCloseTree, sourceMap} : CodeTreeProps) => {
    const theme = useTheme();

    const handleSelect = (event: React.SyntheticEvent, nodeIds: string) => {
      if(nodeIds.length > 0) {
        let file_id : string | null = null;
        let idx : number | null = null;

        if(nodeIds.indexOf('_') == - 1) {
          file_id = nodeIds;
        } else { 
          const parts = nodeIds.split('_');
          file_id = parts[0];
          idx = Number.parseInt(parts[1]);
        }

        onFileSelect(file_id, idx);
      }
    };

    const mapEntries = Object.entries(sourceMap);

    const items = mapEntries.map(([fileId, sourceFile]) => {
      let suggestionsItems = undefined;

      if(sourceFile.Diagnostics) {
        suggestionsItems = sourceFile.Diagnostics.map((diagnostic, idx) => {
          const uniqueKey = [fileId, idx].join('_');

          return (
            <TreeItem 
              key={uniqueKey}
              nodeId={uniqueKey}
              label={diagnostic.DiagnosticMessage.Message}
              endIcon={diagnostic.Level === 'Warning' ? <WarningAmberIcon/> : <ErrorOutlineIcon/>}
            />
          );
        });
      }

      return (
      <TreeItem 
        nodeId={fileId} 
        label={sourceFile.name} 
        key={fileId}
      >
        {suggestionsItems}
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
              onNodeSelect={handleSelect}
              defaultSelected={mapEntries.length > 0 ? mapEntries[0][0] : undefined}
              sx={{ height: 240, flexGrow: 1, maxWidth: 360, overflowY: 'auto' }}
            >
              {items}
            </TreeView>
      </Drawer>
    );
};

const fetcher = (url : string) => fetch(url).then((res) => res.json());

const useSourceMap = (analyisId : string) => {
  const { data, error } = useSWR<SourceMap>(`/user/analysis/${analyisId}`, fetcher);

  return {
    sourceMap: data,
    err: error
  };
}

const useSourceFile = (analyisId : string, fileId : string) => {
  const search = new URLSearchParams();
  search.append('file_id', fileId);

  const { data, error } = useSWR<string>(
    `/user/analysis/${analyisId}/get_file?${search.toString()}`, 
    (url : string) => fetch(url).then((res) => res.text())
  );
  
  return {
    sourceFile: data,
    err: error
  };
}

type CodeViewerProps = {
  treeIsOpen: boolean;
  fileId: string;
  fileName: string;
  analyisId: string;
};

const CodeViewer : FC<CodeViewerProps> = ({analyisId, treeIsOpen, fileId, fileName} : CodeViewerProps) => {
    const { sourceFile, err } = useSourceFile(analyisId, fileId);

    return (
      <Main treeIsOpen={treeIsOpen}>
        <DrawerHeader />
        <Typography variant="h4" gutterBottom>{fileName}</Typography>
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
            {sourceFile ? sourceFile : ""}
        </SyntaxHighlighter>
      </Main>
    );
};

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
        Analysis Results
      </Typography>
      <IconButton
              size="large"
              aria-label="sharing link"
              aria-haspopup="true"
              color="inherit"
      >
        <LinkIcon />
      </IconButton>
    </Toolbar>
  </AppBar>
);

export default function Analyizer() {
  const router = useRouter();

  const analysis_id = router.query.analysis_id as string | undefined;

  if(!analysis_id) {
    return <h1>No analysis id provided</h1>;
  }

  const { sourceMap, err } = useSourceMap(analysis_id);
  const [treeIsOpen, setTreeIsOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

    if(!sourceMap) {
      return <h1>Loading</h1>;
    }

    let selection = selectedFile;

    if(!selection) {
      const fileId = Object.keys(sourceMap!);

      if(fileId.length > 0)
        selection = fileId[0];
    }

    const fileName = sourceMap[selection!].name;

    return (
        <Box sx={{ display: 'flex' }}>
          <ProjectBar 
            treeIsOpen={treeIsOpen} 
            handleOpenTree={toggleTree(true)}
          />
            <CodeTree
              treeIsOpen={treeIsOpen}
              sourceMap={sourceMap!}
              handleCloseTree={toggleTree(false)}
              onFileSelect={(file_id, idx) => {
                setSelectedFile(file_id);
              }}
            />
            <CodeViewer 
              treeIsOpen={treeIsOpen}
              fileId={selection!}
              fileName={fileName}
              analyisId={analysis_id}
            />
        </Box>
    );
}
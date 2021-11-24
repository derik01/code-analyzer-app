import React, { FC } from 'react';

import { useTheme } from '@mui/material/styles';

import { Drawer, IconButton } from '@mui/material';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';

import { DrawerHeader } from '../Header';
import { SourceMap } from '../../../lib/LinterAnalysis';

import { drawerWidth } from '../constants';

type EventCallback = (event: React.KeyboardEvent | React.MouseEvent) => void;

export type CodeTreeProps = {
    treeIsOpen: boolean;
    handleCloseTree: EventCallback;
    sourceMap: SourceMap;
    setSelectedSuggest: (suggestion_id : string | null) => void;
    onFileSelect: (file_id : string) => void;
};

const CodeTree : FC<CodeTreeProps> = ({
    onFileSelect, 
    setSelectedSuggest, 
    treeIsOpen, 
    handleCloseTree, 
    sourceMap
} : CodeTreeProps) => {
    const theme = useTheme();

    const handleSelect = (event: React.SyntheticEvent, nodeIds: string) => {
      if(nodeIds.length > 0) {
        let file_id : string | null = null;
        let suggest_id : string | null = null;

        if(nodeIds.indexOf('_') == -1) {
          file_id = nodeIds;
        } else { 
          const parts = nodeIds.split('_');
          file_id = parts[0];
          suggest_id = parts[1];
        }

        onFileSelect(file_id);
        setSelectedSuggest(suggest_id);
      }
    };

    const mapEntries = Object.entries(sourceMap);

    const items = mapEntries.map(([fileId, sourceFile]) => {
      let suggestionsItems = undefined;

      if(sourceFile.Diagnostics) {
        suggestionsItems = sourceFile.Diagnostics.map(({ DiagnosticId, DiagnosticName, Level }) => {
          const uniqueKey = [fileId, DiagnosticId].join('_');

          return (
            <TreeItem 
              key={uniqueKey}
              nodeId={uniqueKey}
              label={DiagnosticName}
              endIcon={Level === 'Warning' ? <WarningAmberIcon/> : <ErrorOutlineIcon/>}
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
              aria-label="warnings listed by file"
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

export default CodeTree;
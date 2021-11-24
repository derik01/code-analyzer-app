import React, { FC, ReactChild, ReactElement, useState } from 'react';
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
import solarized from 'react-syntax-highlighter/dist/cjs/styles/hljs/solarized-dark';

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
  setSelectedSuggest: (suggestion_id : string | null) => void;
  onFileSelect: (file_id : string) => void;
};

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const CodeTree : FC<CodeTreeProps> = ({onFileSelect, setSelectedSuggest, treeIsOpen, handleCloseTree, sourceMap} : CodeTreeProps) => {
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

import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    maxWidth: 350
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#f5f5f9',
  }
}));

import { Diagnostic } from '../lib/LinterAnalysis';


type SuggestionEnumeration = {
  invMap: { [fileId : string]: number };
  enum: [string, string][];
  indexOf: (fileId : string) => number;
  suggestionOf: (idx : number) => [string, string];
};

type SuggestionControl = {
  closeSuggestionCallback: (suggest : string) => () => void;
  openSuggestionCallback: (suggest : string) => () => void;
  selectedSuggest : string | null;
};

interface CodeSuggestionProps {
  Diagnostic: Diagnostic;
  control: SuggestionControl;
  enumerated: SuggestionEnumeration; 
}

import Chip from '@mui/material/Chip';

const CodeSuggestion : FC<CodeSuggestionProps> = ({children, Diagnostic, control, enumerated, ...props}) => {
  const Icon = Diagnostic.Level === "Warning" ? WarningAmberIcon : ErrorOutlineIcon;
  const open = control.selectedSuggest === Diagnostic.DiagnosticId;

  return (
    <HtmlTooltip
      title={
        <>
          <div
            style={{
              lineHeight: '2rem',
              display: 'flex'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
              <Icon
                sx={{
                  display: 'inline-block',
                  verticalAlign: 'text-top',
                  marginRight: '0.4rem'
                }}
              />
              {Diagnostic.DiagnosticName}
            </Typography>
          </div>
          <div style={{
            margin: '0.25em 0'
          }}>
          <Typography variant="body2">
            {Diagnostic.DiagnosticMessage.Message}
          </Typography>
          </div>
          <div style={{display: 'flex'}}>
            <div style={{flexGrow: 1}} />
            <div>
              <Chip
                label={
                  `${enumerated.indexOf(Diagnostic.DiagnosticId) + 1}/${enumerated.enum.length}`
                }
                size="small"
              />
            </div>
          </div>
        </>
      }
      onOpen={control.openSuggestionCallback(Diagnostic.DiagnosticId)}
      onClose={control.closeSuggestionCallback(Diagnostic.DiagnosticId)}
      open={open}
      arrow
    >
      {children}
    </HtmlTooltip>
  );
}

type AnnotatedDiagnostic = [charnum: number, diagnostics: Diagnostic];

type LineMap = {
  [linenum : number]: AnnotatedDiagnostic[] | undefined;
};

const WrappingRenderer = (diagnostics? : Diagnostic[], control : SuggestionControl, enumerated : SuggestionEnumeration) => {
  const lineMap : LineMap = {};
  const eofSuggestions : Diagnostic[] = [];

  if(diagnostics) {
    for(let diagnostic of diagnostics!) {
      const [linenum, charnum] = diagnostic.DiagnosticMessage.Location;

      if(lineMap[linenum] === undefined)
        lineMap[linenum] = [[charnum, diagnostic]];
      else
        lineMap[linenum]!.push([charnum, diagnostic]);

      if(diagnostic.DiagnosticMessage.EOF)
        eofSuggestions.push(diagnostic);
    }
  }

  const CodeTag : FC = ({children, ...props}) => {

    const postRendered = React.Children.map(children, (codeSegment, i) => {

      if(codeSegment === null || codeSegment === undefined) {
        return codeSegment;
      }

      const _lineDiagnostics = lineMap[i];

      if(_lineDiagnostics === undefined) {
        return codeSegment;
      }

      const lineDiagnostics = _lineDiagnostics.sort(
        ([charA, _a], [charB, _b]) => charA - charB
      ) as AnnotatedDiagnostic[];

      let offset = 0;
      let diagIdx = 0;

      const n_tags = React.Children.count(codeSegment.props.children);

      const annotatedSegments = React.Children.map(codeSegment.props.children, function(codeTag, i) {
        if (i === 0 || diagIdx >= lineDiagnostics.length || codeTag === undefined || codeTag == null) {
          return codeTag;
        }

        let textContent = "";
        if (typeof(codeTag) === "string") {
          textContent = codeTag;
        } else {
          const n_children = React.Children.count(codeTag.props.children);

          if(n_children !== 1) {
            console.error("Expected one child");
            return codeTag;
          }

          textContent = codeTag.props.children[0];
        }

        let wrapped = codeTag;

        while(diagIdx < lineDiagnostics.length && textContent.length + offset > lineDiagnostics[diagIdx][0]) {
          let endStyle = {};

          if(i === n_tags - 1) {
            endStyle = {
              minWidth: 10
            };
          }

          const diagnostic = lineDiagnostics[diagIdx][1];
          
          wrapped = (
            <CodeSuggestion
              Diagnostic={diagnostic}
              control={control}
              enumerated={enumerated}
            >
              <div
                style={{
                  border: '1px solid #657b83',
                  borderRadius: '3px',
                  ...endStyle
                }}
              >
                {wrapped}
              </div>
            </CodeSuggestion>
          );

          diagIdx++;
        }

        offset += textContent.length;

        return wrapped;
      });

      return React.cloneElement(codeSegment, [], annotatedSegments);
    });

    let eofSuggestion = null;
    for(let diagnostic of eofSuggestions) {
      if(eofSuggestion === null) {
        eofSuggestion = <div style={{
          minWidth: 10
        }} />
      }

      eofSuggestion = (
        <CodeSuggestion
          Diagnostic={diagnostic}
          control={control}
          enumerated={enumerated}
        >
          {eofSuggestion}
        </CodeSuggestion>
      );
    }

    if(eofSuggestions !== null) {
      postRendered?.push(eofSuggestion);
    }

    return <code
      {...props}
    >
      {postRendered}
    </code>;
  };

  return CodeTag;
};

type CodeViewerProps = {
  treeIsOpen: boolean;
  fileId: string;
  fileName: string;
  analyisId: string;
  suggestionControl: SuggestionControl;
  sourceMap: SourceMap;
  enumerated: SuggestionEnumeration;
};

const CodeViewer : FC<CodeViewerProps> = ({
  analyisId,
  treeIsOpen,
  fileId,
  fileName,
  sourceMap,
  suggestionControl,
  enumerated
} : CodeViewerProps) => {
    const { sourceFile, err } = useSourceFile(analyisId, fileId);
    
    const diagnostics = sourceMap[fileId].Diagnostics;

    const CodeTag = WrappingRenderer(diagnostics, suggestionControl, enumerated);

    return (
      <Main treeIsOpen={treeIsOpen}>
        <DrawerHeader />
        <Typography variant="h4" gutterBottom>{fileName}</Typography>
        <SyntaxHighlighter 
            language='cpp' 
            style={{
                ...solarized
            }}
            customStyle={{
              fontFamily: "'Fira Code', 'monospace'",
              borderRadius: '10px',
              lineHeight: '1.2rem'
            }}
            showLineNumbers
            wrapLongLines
            lineProps={(lineNumber : number) => ({
              id: `code-viewer-line-${lineNumber}`,
            })}
            CodeTag={CodeTag}
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

const enumerateSuggestions = (sourceMap : SourceMap) => {
  const suggestions : [string, string][] = [];
  const suggestionEnumeration : { [fileId : string]: number } = {};
  
  if(sourceMap !== undefined) {
    for(let [fileId, sourceFile] of Object.entries(sourceMap!)) {
      if(sourceFile.Diagnostics) {
        for(let { DiagnosticId } of sourceFile.Diagnostics!) {
          suggestionEnumeration[DiagnosticId] = suggestions.length; 
          suggestions.push([fileId, DiagnosticId]);
        }
      }
    }
  }

  return {
    invMap: suggestionEnumeration,
    enum: suggestions,
    indexOf: (fileId : string) => suggestionEnumeration[fileId],
    suggestionOf: (idx : number) => suggestions[idx],
  } as SuggestionEnumeration;
}



import { Fab } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Stack } from '@mui/material';

export default function Analyizer() {
  const router = useRouter();

  const analysis_id = router.query.analysis_id as string | undefined;

  if(!analysis_id) {
    return <h1>No analysis id provided</h1>;
  }

  const { sourceMap, err } = useSourceMap(analysis_id);
  const [treeIsOpen, setTreeIsOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedSuggest, setSelectedSuggest] = useState<string | null>(null);

  const enumerated = enumerateSuggestions(sourceMap!);

  const rotateSelection = (amount : number) => () => {
    let idx = selectedSuggest === null ? -amount : enumerated.indexOf(selectedSuggest!);
    idx = ((idx + amount) + enumerated.enum.length) % enumerated.enum.length;
 
    const [fileId, diagnosticId] = enumerated.suggestionOf(idx);

    setSelectedFile(fileId);
    setSelectedSuggest(diagnosticId);
  }

  const closeSuggestionCallback = (suggest : string) => () => {
    if(selectedSuggest === suggest) {
      setSelectedSuggest(null);
    }
  };

  const openSuggestionCallback = (suggest : string) => () => {
    setSelectedSuggest(suggest);
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
        <>
          <Box sx={{ display: 'flex' }}>
            <ProjectBar 
              treeIsOpen={treeIsOpen} 
              handleOpenTree={toggleTree(true)}
            />
            <CodeTree
              setSelectedSuggest={setSelectedSuggest}
              treeIsOpen={treeIsOpen}
              sourceMap={sourceMap!}
              handleCloseTree={toggleTree(false)}
              onFileSelect={(file_id) => {
                setSelectedFile(file_id);
              }}
            />
            <CodeViewer
              suggestionControl={{
                closeSuggestionCallback,
                openSuggestionCallback,
                selectedSuggest
              }}
              sourceMap={sourceMap}
              treeIsOpen={treeIsOpen}
              fileId={selection!}
              fileName={fileName}
              analyisId={analysis_id}
              enumerated={enumerated}
            />
            <Stack
              sx={{
                position: 'absolute',
                right: '1em',
                bottom: '1em'
              }}
              spacing={1}
              direction="row"
            >
              <Fab
                color="secondary"
                aria-label="add"
                onClick={rotateSelection(-1)}
              >
                <NavigateBeforeIcon />
              </Fab>
              <Fab
                color="secondary"
                aria-label="edit"
                onClick={rotateSelection(1)}
              >
                <NavigateNextIcon />
              </Fab>
            </Stack>
          </Box>
        </>
    );
}
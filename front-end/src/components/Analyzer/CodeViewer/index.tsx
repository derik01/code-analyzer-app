import React, { FC } from 'react';

import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import IndirectRenderer from './IndirectRenderer';
import { DrawerHeader } from '../Header';
import { useSourceFile } from '../../../lib/data';
import { SourceMap } from '../../../lib/LinterAnalysis';

import { SuggestionControl, SuggestionEnumeration } from '../suggestion';

import { drawerWidth } from '../constants';

// @ts-ignore
import SyntaxHighlighter from 'react-syntax-highlighter';
// @ts-ignore
import solarized from 'react-syntax-highlighter/dist/cjs/styles/hljs/solarized-dark';


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
  

export type CodeViewerProps = {
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
    
    const diagnostics = sourceMap[fileId].Diagnostics!;

    const CodeTag = IndirectRenderer(diagnostics, suggestionControl, enumerated);

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

export default CodeViewer;
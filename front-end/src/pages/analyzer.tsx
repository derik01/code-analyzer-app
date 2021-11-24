import React, { FC, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import {
  Fab,
  Stack,
  Box
} from '@mui/material';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

import CodeViewer from '../components/Analyzer/CodeViewer';
import CodeTree from '../components/Analyzer/CodeTree';
import { ProjectBar } from '../components/Analyzer/Header';

import { useSourceMap } from '../lib/data';

import enumerateSuggestions from '../components/Analyzer/enumerateSuggestions';

type NextPrevButtonProps = {
  onNextClick: () => void;
  onPrevClick: () => void;
};

const NextPrevButtons : FC<NextPrevButtonProps> = ({onNextClick, onPrevClick}) => (
  <Stack
    sx={{
      position: 'fixed',
      right: '1em',
      bottom: '1em'
    }}
    spacing={1}
    direction="row"
  >
    <Fab
      color="secondary"
      aria-label="previous diagnostic"
      onClick={onPrevClick}
    >
      <NavigateBeforeIcon />
    </Fab>
    <Fab
      color="secondary"
      aria-label="next diagnostic"
      onClick={onNextClick}
    >
      <NavigateNextIcon />
    </Fab>
  </Stack>
);

export default function Analyzer() {
  const router = useRouter();

  const analysis_id = router.query.analysis_id as string | undefined;

  if(!analysis_id) {
    return <h1>No analysis id provided</h1>;
  }

  const { sourceMap, err } = useSourceMap(analysis_id);
  const [treeIsOpen, setTreeIsOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedSuggest, setSelectedSuggest] = useState<string | null>(null);
  const scrollTarget = useRef<string | null>(null);

  const enumerated = enumerateSuggestions(sourceMap!);

  useEffect(() => {
    function scrollToElement(
      pageElement : HTMLElement | null,
      offset: [number, number]  
    ) {
      let positionX = 0,
          positionY = 0;
  
      while(pageElement != null){        
          positionX += pageElement.offsetLeft;        
          positionY += pageElement.offsetTop;        
          pageElement = pageElement.offsetParent as HTMLElement | null;
          window.scrollTo(positionX + offset[0], positionY + offset[1]);
      }
      
      scrollTarget.current = null;
    }

    const diagnosticId = scrollTarget.current;
    if(diagnosticId !== null) {
      const el = document.getElementById(diagnosticId);
      if(el !== null) {
        scrollToElement(el, [0, -window.innerHeight / 2]);
      }
    }

  });

  const rotateSelection = (amount : number) => () => {
    let idx = selectedSuggest === null ? -amount : enumerated.indexOf(selectedSuggest!);
    idx = ((idx + amount) + enumerated.enum.length) % enumerated.enum.length;
 
    const [fileId, diagnosticId] = enumerated.suggestionOf(idx);

    setSelectedFile(fileId);
    setSelectedSuggest(diagnosticId);
    scrollTarget.current = diagnosticId;
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
              setSelectedSuggest={(diagnosticId : string | null) => {
                setSelectedSuggest(diagnosticId);
                scrollTarget.current = diagnosticId;
              }}
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
            <NextPrevButtons
              onNextClick={rotateSelection(1)}
              onPrevClick={rotateSelection(-1)}
            />
          </Box>
        </>
    );
}
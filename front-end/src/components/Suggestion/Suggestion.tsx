import Chip from "@mui/material/Chip";
import Alert, { AlertColor } from '@mui/material/Alert';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import styles from './Suggestion.module.scss';
import { AlertTitle, Stack } from "@mui/material";
import { FC } from 'react';
import { Diagnostic } from "../../lib/LinterAnalysis";

export type SuggestionProps = {
    Diagnostic : Diagnostic;
    fileName : string;
};

const Suggestion : FC<SuggestionProps> = ({Diagnostic, fileName, ...props} : SuggestionProps) => (
    <Alert
        severity={Diagnostic.Level.toLowerCase() as AlertColor}
        classes={{message : styles.alertMessage}}
        {...props}
    >
        
        <Stack
        direction = "row"
        justifyContent = "space-between"
        alignItems="Center"
        spacing = {2}>
            <AlertTitle >{Diagnostic.Level}</AlertTitle>
            <Chip label={`${fileName} ${Diagnostic.DiagnosticMessage.FileOffset}`} icon={<FolderOpenIcon/>}/>
        </Stack>
        {Diagnostic.DiagnosticMessage.Message}
    </Alert>
   
    
);

export default Suggestion;
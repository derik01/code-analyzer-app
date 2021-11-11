import * as React from 'react';
import { FC } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { AlertTitle, Grid, Modal, Paper } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { Container, Stack } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useDropzone } from 'react-dropzone';
import { useState } from "react";
import Chip from "@mui/material/Chip";
import Alert from '@mui/material/Alert';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import styles from './dashboard.module.scss';
import AlertColor from '@mui/material/AlertColor';


declare module '@mui/material/AppBar' {
    interface AppBarColorOverrides {
        bg: true;
    }
}

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

type DropZoneProps = {
    onDrop : <T extends File>(acceptedFiles: T[]) => void;
};

const DropZone : FC<DropZoneProps> = ({ onDrop } : DropZoneProps) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    //test.cpp -> Diagnostics[0] -> DiagnosticMessage -> Message
    return (
        <div
            style={{
                padding: '1em',
            }}
        >
            <div
                style={{
                    outline: '0.15rem dashed grey',
                    borderRadius: '5px',
                    padding: '6em 0'
                }}
    
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <Stack
                    style={{
                        width: '300px',
                        margin: '0 auto'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <FileUploadIcon
                            color="primary"
                            style={{fontSize: '4rem', padding: '0.1em'}}
                        />
                    </div>
                    <span style={{marginBottom: '1.5em'}}>
                    <Typography 
                        variant="h5"
                        textAlign='center'
                    >
                        Drag and drop files 
                    </Typography>
                    </span>
                    <Button variant="contained" style={{display: 'inline'}}>Select Files</Button>
                </Stack>
            </div>
        </div>
    );
}

const UploadPannel : FC = () => ( 
    <Box
        sx={{
            padding: '2em'
        }}
    >
        <Typography
            variant="h4"
            gutterBottom
        >
            Upload a File
        </Typography>
        <Typography
            variant="subtitle1"
        >
            Code analyizer allow you to analyize and grade your c++ code. Simple choose a file to upload and await the results!
        </Typography>
    </Box>
);

type SuggestionsBoxProps = {
    name: string;
    message: string;
};

const ModalRec : FC<SuggestionsBoxProps> = ({ name, message } : SuggestionsBoxProps) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    return(
        <div>
            <Button disabled={name == ""} onClick={handleOpen}>View Recommendations</Button>
            <Modal
                aria-labelledby="unstyled-modal-title"
                aria-describedby="unstyled-modal-description"
                open={open}
                onClose={handleClose}
            >
                <Box sx={{
                    position: 'absolute' as 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Recommendations for file: {name}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
};

type DiagnosticeMessage = {
    FileOffset : number;
    Path : string;
    Message : string;
    Replacements : any;
};

type Diagnostic = {
    BuildDirectory : string;
    DiagnosticMessage : DiagnosticeMessage;
    DiagnosticName : string;
    Level : "Warning" | "Error";
};

type LinterAnalysis = {
    [fileName: string] : {
        Diagnostics: Diagnostic[];
        MainSourceFile : string;
    };
}

type SuggestionProps = {
    Diagnostic : Diagnostic;
    FileName : string;
};

const Suggestion : FC<SuggestionProps> = ({Diagnostic, FileName, ...props} : SuggestionProps) => {
    console.log(Diagnostic.DiagnosticMessage);
    return(
        <Alert
            severity = {Diagnostic.Level.toLowerCase() as AlertColor}
            classes = {{message : styles.alertMessage}}
            {...props}
        >
            
            <Stack
            direction = "row"
            justifyContent = "space-between"
            alignItems="Center"
            spacing = {2}>
            <AlertTitle >{Diagnostic.Level}</AlertTitle>
            <Chip label={`${FileName} ${Diagnostic.DiagnosticMessage.FileOffset}`} icon={<FolderOpenIcon/>}/>
            </Stack>
            {Diagnostic.DiagnosticMessage.Message}
        </Alert>
    )
};


export default function Dashboard() {
    // const [name, setName] = useState<string>("");
    // const [message, setMessage] = useState<string>("");
    const [response, setResponse] = useState<LinterAnalysis | null>(null);

    const onDrop = React.useCallback((acceptedFiles : File[]) => {
        acceptedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file, file.name);

            fetch('/user/upload', {
                method: 'POST',
                body: formData
            }).then(
                res => res.json()
            ).then(
                (success : LinterAnalysis) => {
                    console.log(success);
                    setResponse(success);
            }
            ).catch(
                err => console.log(err)
            );
          });
    }, []);

    let suggestions = undefined;
    if(response !== null){
        suggestions = Object.entries(response!).map(([file, diags]) =>
            diags.Diagnostics.map(Diagnostic =>
                    <Suggestion key = {`${file}${Diagnostic.DiagnosticMessage.FileOffset}`} Diagnostic = {Diagnostic} FileName = {file}/>
                )
        ).reduce((prev, next) => prev.concat(next))
    }


    return (
        <Box sx={{ flexGrow: 1 }}>
        <HeaderBar />
            <Container>
                {/* <ModalRec name={name} message={message} /> */}
                <Paper
                    elevation={3}
                >
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                    >
                        <Grid lg={6} md={7} sm={12} item>
                            <DropZone onDrop={onDrop} />
                        </Grid>
                        <Grid lg={6} md={5} sm={12} item>
                            <UploadPannel />
                        </Grid>
                    </Grid>
                    <Stack spacing = {2} sx ={{padding : "1em"}}>
                        {suggestions}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
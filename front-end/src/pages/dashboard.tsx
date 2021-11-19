import * as React from 'react';
import { FC } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Grid, Paper } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { Container, Stack } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useDropzone } from 'react-dropzone';
import { useState } from "react";
import Suggestion from '../components/Suggestion';
import { LinterAnalysis } from '../lib/LinterAnalysis';
import { DefaultPageProps } from "./_app";

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

export default function Dashboard({ showError } : DefaultPageProps) {
    const [response, setResponse] = useState<LinterAnalysis | null>(null);

    const onDrop = React.useCallback((acceptedFiles : File[]) => {
        const formData = new FormData();
        
        for(const file of acceptedFiles) {
            formData.append('files', file, file.name);
        }

        fetch('/user/upload', {
            method: 'POST',
            body: formData
        }).then(
            res => res.json()
        ).then(
            (success : LinterAnalysis) => { 
                console.log(success);
                setResponse(success) 
            }
        ).catch(
            err => showError({
                msg: `Failed to upload a file ${err.msg}`,
                ...err
            })
        );
    }, [showError]);

    let suggestions = undefined;
    if(response !== null){
        suggestions = Object.entries(response!).map(([fileName, diags]) =>
            diags.Diagnostics.map(Diagnostic =>
                <Suggestion
                    key={`${fileName}${Diagnostic.DiagnosticMessage.FileOffset}`}
                    Diagnostic={Diagnostic} 
                    fileName={fileName}
                />
            )
        ).reduce((prev, next) => prev.concat(next), [])
    }


    return (
        <>
        <Box sx={{ flexGrow: 1 }}>
        <HeaderBar />
            <Container>
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
        </>
    );
}
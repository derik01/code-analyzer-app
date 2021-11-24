import * as React from 'react';
import { FC } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { LinearProgress, Grid, Paper, CircularProgress } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { Container, Stack } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useDropzone } from 'react-dropzone';
import { useState } from "react";
import { DefaultPageProps } from "./_app";
import { useRouter } from 'next/router';
import { useServer } from '../lib/server';
import Header from "../components/Suggestion/header";

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
            Code analyzer allow you to analyize and grade your c++ code. Simple choose a file to upload and await the results!
        </Typography>
    </Box>
);

const randInt = (a : number, b : number) => {
    return Math.floor((b - a) * Math.random() + a);
}

export default function Dashboard({ showError } : DefaultPageProps) {
    const UPLOAD_SAYINGS = [
        'Discharging the flux capacitor',
        'Overflowing the semantic buffer',
        'Superimposing all quantum states',
        'Backpropagating the gradients',
        'Converting big-endian to little-endian',
        'Detecting program haults',
        'Caffinating the monkeys',
        'Calculating the cross-entropy',
        'Associating the cache'
    ];

    const router = useRouter();
    const server = useServer();
    const [uploading, setUploading] = useState(false);
    const [saying, setSaying] = useState({
        num: randInt(0, UPLOAD_SAYINGS.length)
    });

    if(uploading) {
        setTimeout(() => {
            setSaying({
                ...saying,
                num: (saying.num + 1) % UPLOAD_SAYINGS.length,
            });
        }, 2500);
    }

    const onDrop = React.useCallback((files : File[]) => {
        setUploading(true);

        server.upload_files(files)
        .then(res => {
            
            router.push({
                pathname: '/analyizer',
                query: {
                    analysis_id: res.analysis_id
                },
            });
        })
        .catch(
            err => {
            
            showError({
                msg: `Failed to upload a file ${err.msg}`,
                ...err
            });

            setUploading(false);
        }
        );
    }, []);

    const visableSaying = UPLOAD_SAYINGS[ saying.num % UPLOAD_SAYINGS.length ];

    return (
        <>
        <Box sx={{ flexGrow: 1 }}>
        <Header />
            <Container>
                <Paper
                    elevation={3}
                >

                        {uploading ? (
                            <>
                                    
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '3em 2em',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                marginBottom: '3em'
                                            }}
                                        >
                                            <Typography 
                                                textAlign="center"
                                                variant="h3"
                                            >
                                                Analyzing
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                minHeight: '10px',
                                                width: '80%'
                                            }}
                                        >
                                            <LinearProgress/>
                                        </Box>
                                        <Typography
                                            variant="h5"
                                            textAlign="center"
                                            sx={{
                                                marginTop: '1em'
                                            }}
                                        >
                                            {visableSaying}
                                        </Typography>
                                    </Box>
                            </>
                        ) : (
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
                        )}
                </Paper>
            </Container>
        </Box>
        </>
    );
}
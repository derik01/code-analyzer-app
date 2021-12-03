import * as React from 'react';
import { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { LinearProgress, Grid, Paper } from '@mui/material';
import { Container, Stack } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useDropzone } from 'react-dropzone';
import { useState } from "react";
import { DefaultPageProps } from "./_app";
import { useRouter } from 'next/router';
import { useServer } from '../lib/server';
import Header from "../components/Header";

declare module '@mui/material/AppBar' {
    interface AppBarColorOverrides {
        bg: true;
    }
}

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
            AutoCheck allows you to analyze your C++ code. It identifies common logic errors, 
            readability issues, and syntax errors. Simply choose source files to upload and await the 
            results! You can even share your results with an instructor or TA.
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
        'Detecting program halts',
        'Caffeinating the monkeys',
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
                pathname: '/analyzer',
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
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Grid, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CodeIcon from '@mui/icons-material/Code';
import { Container, Stack } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useDropzone } from 'react-dropzone';
//import { useState } from "react";
//import { DropzoneArea } from 'material-ui-dropzone';

declare module '@mui/material/AppBar' {
    interface AppBarColorOverrides {
        bg: true;
    }
}

function HeaderBar() {
    return (
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
}
// var input = document.querySelector('input[type="file"]')

// var data = new FormData()
// data.append('file', input.files[0])
// data.append('user', 'hubot')

// fetch('/avatars', {
//   method: 'POST',
//   body: data
// })
const DropZone = () => {
    //const [files, setFile] = useState<any>([]);
    const onDrop = React.useCallback(acceptedFiles => {
        console.log(`Accepting Length: ${acceptedFiles.length}`);
        acceptedFiles.map(async file => {
            console.log(file);
            var formData = new FormData();
            formData.append('file', file, file.name);

            fetch('/user/upload', {
            method: 'POST',
            body: formData
            }).then(
                res => res.json()
            ).then(
                success => console.log(success)
            ).catch(
                err => console.log(err)
            );
          });
        
 
        // var formData = new FormData();
        // formData.append('file', files[0]);

        // fetch('/user/upload', {
        // method: 'POST',
        // body: formData
        // }).then(
        //     res => res.json()
        // ).then(
        //     success => console.log(success)
        // ).catch(
        //     err => console.log(err)
        // );

    }, []);

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

const UploadPannel = () => ( 
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

export default function Dashboard() {
    return (   
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
                        <DropZone />
                    </Grid>
                    <Grid lg={6} md={5} sm={12} item>
                        <UploadPannel />
                    </Grid>
                </Grid>
            </Paper>
        </Container>
      </Box>
    );
}
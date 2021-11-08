import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Grid, Modal, Paper } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { Container, Stack } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useDropzone } from 'react-dropzone';
import { useState } from "react";

let e 
let name 
let message 

declare module '@mui/material/AppBar' {
    interface AppBarColorOverrides {
        bg: true;
    }
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

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

const DropZone = () => {
    const [files, setFile] = useState<any[]>([]);
    const [empty , setEmpty] = useState(true);
    const [filename, setName] = useState("");
    const [msg, setMsg] = useState(""); 
    
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
                success => {
                    
                   // const f = success;

                    setFile(success);
                    
                    setEmpty(false);
                    Object.keys(success).map((key) => (
                        //console.log(key)
                        setName(key)
                    ));
                    Object.values(success).map((m) => (
                        setMsg(m.Diagnostics[0].DiagnosticMessage.Message)
                   ));
                   //trying out useContext() hook
                   e = empty;
                   name = filename;
                   message = msg;
                   //console.log(filename);

                }
            ).catch(
                err => console.log(err)
            );
          });

    }, [files, empty, filename, msg]);
    
    e = empty;
    name = filename;
    message = msg;

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    
    //test.cpp -> Diagnostics[0] -> DiagnosticMessage -> Message
    if(empty){
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
    else{
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

const ModalRec = () => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    return(
        <div>
            <Button onClick={handleOpen}>View Recommendations</Button>
            <Modal
                aria-labelledby="unstyled-modal-title"
                aria-describedby="unstyled-modal-description"
                open={open}
                onClose={handleClose}
            >
            <Box sx={style}>
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



export default function Dashboard() {

    return (   
    <Box sx={{ flexGrow: 1 }}>
       <HeaderBar />
        <Container>
            <ModalRec></ModalRec>
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
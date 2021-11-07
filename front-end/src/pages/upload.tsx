import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import Component from 'react';
import {DropzoneArea} from 'material-ui-dropzone';
import {useDropzone} from 'react-dropzone';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const DropZone = () => {
    const onDrop = useCallback(acceptedFiles => {
        console.log(`Accepted Length: ${acceptedFiles.length}`);
        acceptedFiles.map(async file => {
            console.log(file);
            var formData = new FormData();

            fetch('user/upload', {
                method: 'POST',
                body:formData
            })
            .then(
                res => res.json
            )
            .then(
                success => console.log(success)
            )
            .catch(
                err => console.log(err)
            )
        })
        
    }, []);
}

export default function FileUpload(props: any) {
    const useStyles = makeStyles(theme => createStyles({
        previewChip: {
          minWidth: 160,
          maxWidth: 210
        },
      }));
      const classes = useStyles();
      <DropzoneArea
        showPreviews={true}
        showPreviewsInDropzone={false}
        useChipsForPreview
        previewGridProps={{container: { spacing: 1, direction: 'row' }}}
        previewChipProps={{classes: { root: classes.previewChip } }}
        previewText="Selected files"
      />

    const {getRootProps, getInputProps, open, acceptedFiles} = useDropzone({
        // Disable click and keydown behavior
        noClick: true,
        noKeyboard: true
      });

      
      
      
    return (
        <div className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here</p>
        <button type="button" onClick={open}>
          Open File Dialog
        </button>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
    </div>
        )
    }
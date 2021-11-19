import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { FC } from 'react';
import { Err } from '../../lib/server';

export type ErrorHandlerProps = {
    err: Err | null;
    onClose: () => void;
};

const ErrorHandler : FC<ErrorHandlerProps> = ({err, onClose, ...props}) => (
    <Snackbar open={err !== null} autoHideDuration={3000} onClose={onClose}>
        <Alert severity="error" variant="filled" onClose={onClose} {...props}>
            {err?.msg}
        </Alert>
    </Snackbar>
);

export default ErrorHandler;
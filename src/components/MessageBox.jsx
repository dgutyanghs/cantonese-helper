import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteIcon from '@mui/icons-material/Delete';
import { DICT_KEY } from '../constant';

function MessageBox({data, onDataUpdate}) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        console.log('OK, data:',data);

        // if (Array.isArray(data)) {
        //     data.length = 0;
        //     console.log("empty the data array");
        // }
        setOpen(false);
        onDataUpdate(); //info the parent component by callback
    };

    return (
        <div>
            <Button endIcon={<DeleteIcon />} variant="contained" color="error" onClick={handleClickOpen}>
                Delete All
            </Button>
            <Dialog open={open} onClose={handleCancel} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure to delete all words?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleOk} color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MessageBox;

import * as React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

export default function BuyMeACoffee() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Card>
        <CardMedia
          component="img"
          height="38"
          image="icons/BuyMeACoffee2.png"
          alt="Primary Image"
          onClick={handleClickOpen}
        />
        {/* <IconButton aria-label="add photo" onClick={handleClickOpen}>
          <PhotoCameraIcon />
        </IconButton> */}
      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle fontWeight={'bold'} textAlign={'center'} >Alipay</DialogTitle>
        <DialogContent>
          <CardMedia
            component="img"
            height="140"
            image="icons/Alipay.jpg"
            alt="Alipay"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
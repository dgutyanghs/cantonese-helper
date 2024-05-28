import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Fade from "@mui/material/Fade";
import React, { useState } from 'react'

export default function AlertMessage() {

  const [alertVisibility, setAlertVisibility] = useState(false);

  return(
    <Fade
       in={alertVisibility} //Write the needed condition here to make it appear
       timeout={{ enter: 1000, exit: 1000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
       addEndListener={() => {
         setTimeout(() => {
           setAlertVisibility(true)
         }, 2000);
       }}
       >
       <Alert severity="success" variant="standard" className="alert">
          <AlertTitle>Success</AlertTitle>
             Already add this word!
          </Alert>
    </Fade>
  )
}
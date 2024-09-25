import React, { useEffect } from 'react';
import KeySelect from './KeySelect';
import { Box, Typography } from '@mui/material';
import { Switch } from '@mui/material';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
// import { SWITCH_POPUP } from '../constant';



function App() {
    const [isToggled, setIsToggled] = React.useState(true); // main switch

    const handleSwitch = (event) => {
        const newState = event.target.checked;
        setIsToggled(newState);

        // Save the new state to storage
        chrome.storage.local.set({ isToggled: newState });

        // Send a message to the background script to update the icon
        chrome.runtime.sendMessage({ action: 'updateIcon', isOn: newState });
    };


    useEffect(() => {
        // for test local storage only
        chrome.storage.local.set({ A: 'Hello from popup.js' }, () => {
            console.log('A Value stored in local storage');
        });
        // let isToggled = true;
        chrome.storage.local.get(['isToggled'], (result) => {
            if (result.isToggled === undefined) { //first time
                console.log("popup.js, isToggled is undefined, set to true");
                setIsToggled(true);
            } else {
                const isToggled = result.isToggled;
                console.log("popup.js, result.isToggled=", isToggled);
                setIsToggled(isToggled);
            }
        });
    }, []);
    const gotoOptions = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    };

    return (
        <Box my={2} mx={1.5} sx={{
            width: 200
        }}>
            <Typography variant="h6" color="primary" fontWeight={'bold'}>Cantonese Helper</Typography>
            <Typography variant="caption" color="darkgrey" fontWeight={'bold'}>Main switch</Typography>
            <Box border={0.5} borderColor="primary.main" p={1} borderRadius={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography color="grey" variant="h6">
                    Off
                </Typography>
                <Switch checked={isToggled} onChange={handleSwitch} />
                <Typography color="primary" variant="h6">
                    On
                </Typography>
            </Box>
            <Box mt={1} >
                <Typography variant="caption" color={'darkgrey'} fontWeight={'bold'}>Key</Typography>
                <Box border={0.5} borderColor="primary.main" borderRadius={2} p={1} sx={{}}>
                    <KeySelect />
                </Box>
            </Box>

            <Box mt={1}>
                <Typography variant="caption" color={'darkgrey'} fontWeight={'bold'}>Open the Words page</Typography>
                <Box border={0.5} borderColor="primary.main" borderRadius={2} p={1} sx={{}}>
                    <Box sx={{ mt: 0.5, pb: 1, mx: 'auto', textAlign: 'center' }}>
                        <Button onClick={gotoOptions} size="small" variant="contained" endIcon={<SendIcon />}>
                            Words
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default App;

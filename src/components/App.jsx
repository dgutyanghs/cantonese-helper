import React, { useEffect } from 'react';
import KeySelect from './KeySelect';
import { Box, Typography } from '@mui/material';
import { Switch } from '@mui/material';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { SWITCH_POPUP } from '../constant';

function App() {
    const [isToggled, setIsToggled] = React.useState(true);

    const handleSwitch = e => {
        const isToggled = e.target.checked;
        console.log('isToggle=', isToggled);
        setIsToggled(isToggled);
        const data = { [SWITCH_POPUP]: isToggled };
        chrome.storage.sync.set(data, () => {
            console.log('SWITCH_POPUP is saved:', data);
        });
    };

    useEffect(() => {
        let key = [SWITCH_POPUP];
        chrome.storage.sync.get(key, result => {
            console.log('SWITCH_POPUP state: ', result);
            const isON = result[SWITCH_POPUP];
            if (isON !== undefined) {
                console.log('isON not a undefined ', isON )
                setIsToggled(isON);
            } else {
                //first time, default On
                console.log('isON is undefined ', isON )
                setIsToggled(true);
            }
        });
    }, []);
    const gotoOptions = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    };

    return (
        <Box sx={{ width: 160, bgcolor: 'lightgrey' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* <h2>Enable</h2> */}
                <Typography color="grey" variant="h6">
                    Off
                </Typography>
                <Switch checked={isToggled} onChange={handleSwitch} />
                <Typography color="primary" variant="h6">
                    On
                </Typography>
            </Box>
            <Box sx={{}}>
                <KeySelect />
            </Box>
            <Box sx={{ mt: 12, mb: 2, mx: 'auto', textAlign: 'center' }}>
                <Button onClick={gotoOptions} size="small" variant="contained" endIcon={<SendIcon />}>
                    Words
                </Button>
            </Box>
        </Box>
    );
}

export default App;

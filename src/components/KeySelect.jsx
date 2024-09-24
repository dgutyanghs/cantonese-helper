import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import NativeSelect from '@mui/material/NativeSelect';
import {
    MOUSE_AND_KEY,
    USER_SELECT_OPTION_KEY_ALT,
    USER_SELECT_OPTION_KEY_NONE,
    USER_SELECT_OPTION_KEY_CTL,
    USER_SELECT_OPTION_KEY_SHIFT,
} from '../constant';

// import CustomSelect from './CustomSelect';
import { styled } from '@mui/system';

const StyledSelectWrapper = styled('div')(({ theme }) => ({
    '& .MuiNativeSelect-select': {
        paddingLeft: '10px',
        // color: '#2196f3',
    },
    // '& .MuiNativeSelect-select option:first-of-type': {
    //     color: 'red',
    // },
}));

export default function KeySelect() {
    const [value, setValue] = React.useState(USER_SELECT_OPTION_KEY_NONE);

    // Function to be called when the value changes
    function notifyContentScript(newValue) {
        // Query for the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var activeTab = tabs[0];
            // Send a message to the content script
            chrome.tabs.sendMessage(activeTab.id, { type: 'KEY_VALUE_CHANGED', value: newValue });
        });
    }

    // Example usage
    // const newValue = 'someNewValue';
    // notifyContentScript(newValue);

    const handleChange = event => {
        const { value } = event.target;
        setValue(value);
        const data = { [MOUSE_AND_KEY]: value };
        notifyContentScript(value);
        chrome.storage.sync.set(data, () => {
            console.log('MOUSE_AND_KEY is saved', data);
        });
    };

    React.useEffect(() => {
        const key = MOUSE_AND_KEY;
        chrome.storage.sync.get(key, result => {
            const value = result[key];
            console.log('MOUSE_AND_KEY result,value', result, value);
            if (value === null || value === undefined || value === 'none') {
                setValue('none');
            } else {
                setValue(value);
            }
        });
    }, []);

    return (
        <Box sx={{ minWidth: 160 }}>
            <FormControl fullWidth>
                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                    Mouse + 'Key' to select text.
                </InputLabel>
                <StyledSelectWrapper>
                    <NativeSelect
                        value={value}
                        inputProps={{
                            name: value,
                            id: 'uncontrolled-native',
                        }}
                        onChange={handleChange}
                        sx={{ color: '#2196f3' , mt: '15px'}}
                    >
                        <option value={USER_SELECT_OPTION_KEY_NONE}>mouse only</option>
                        <option value={USER_SELECT_OPTION_KEY_CTL}> mouse + ctl</option>
                        <option value={USER_SELECT_OPTION_KEY_ALT}> mouse + alt</option>
                        <option value={USER_SELECT_OPTION_KEY_SHIFT}> mouse + shift</option>
                    </NativeSelect>
                </StyledSelectWrapper>
            </FormControl>
        </Box>
    );
}

import React from 'react';
import { Select, MenuItem, Box } from '@mui/material';

import {
    MOUSE_AND_KEY,
    USER_SELECT_OPTION_KEY_ALT,
    USER_SELECT_OPTION_KEY_NONE,
    USER_SELECT_OPTION_KEY_CTL,
    USER_SELECT_OPTION_KEY_SHIFT,
} from '../constant';

const CustomSelect = ({ value, handleChange }) => {
    return (
        <Select
            value={value}
            onChange={handleChange}
            sx={{ color: '#2196f3' }}
        >
            <MenuItem value={USER_SELECT_OPTION_KEY_NONE}>
                mouse only
            </MenuItem>
            <MenuItem value={USER_SELECT_OPTION_KEY_CTL}>
                ctl + mouse
            </MenuItem>
            <MenuItem value={USER_SELECT_OPTION_KEY_ALT}>
                alt + mouse
            </MenuItem>
            <MenuItem value={USER_SELECT_OPTION_KEY_SHIFT}>
                shift + mouse
            </MenuItem>
        </Select>
    );
};

export default CustomSelect;
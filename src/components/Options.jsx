import React from 'react';
import CheckboxList from './CheckboxList';
import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';

function Options() {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative' }}>
            {/* <Box sx={{ width: 180, bgcolor: 'lightgrey', borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography sx={{ mt: '20px', height: '80px' }} variant="h6" color="primary" textAlign="center">
                    Chinese Study <br />
                    <span style={{ fontSize: '0.75rem' }}>Jyutping for Cantonese</span>
                </Typography>
                <Divider />
                <Stack sx={{ mt: '10px', height: '90.5px' }}>
                    <Typography variant="strong" color="primary" textAlign="center">
                        Author: Donnie Yang
                    </Typography>
                    <Typography color="primary" textAlign="center">
                        <a style={{ fontSize: '0.75rem', color: '#2196f3' }} href="https://t.me/+RULUZ0XIMr73312r">
                            Telegram Group
                        </a>
                    </Typography>
                    <Typography color="primary" textAlign="center">
                        <a style={{ fontSize: '0.75rem', color: '#2196f3' }} href="mailto:dgutyang@gmail.com">
                            Contact me
                        </a>
                    </Typography>
                </Stack>
                <Divider />
            </Box> */}
            <Box sx={{ width: 1200 }}>
                <Box sx={{ bgcolor: 'lightblue', textAlign: 'center', pb: '20px' }}>
                    <Typography variant="h3" color="primary">
                        Words
                    </Typography>
                    <Typography color="grey">All words below are added from web pages</Typography>
                </Box>
                <CheckboxList />
            </Box>
        </Box>
    );
}

export default Options;

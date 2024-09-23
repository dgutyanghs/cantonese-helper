import React from 'react';
import CheckboxList from './CheckboxList';
import { Box, Divider, Stack,createTheme, ThemeProvider, Typography, useTheme } from '@mui/material';
// import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function Options() {
    // const theme = useTheme();
    return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative',   }}>
                <Box sx={{ maxWidth: 1200,  p: '20px' }}>
                    <Box sx={{ background:'linear-gradient(to right, #f5d442, #f59c42)', textAlign: 'center', pb: '20px' }}>
                        <Typography variant="h3" color="#631296">
                            Words
                        </Typography>
                        <Typography color="grey">All words are added from web pages</Typography>
                        <Typography variant="strong" color="primary" textAlign="center">
                            <a href="mailto:dgutyang@gmail.com">Author: Donnie Yang</a>
                        </Typography>
                    </Box>
                    <CheckboxList />
                </Box>
            </Box>
    );
}

export default Options;

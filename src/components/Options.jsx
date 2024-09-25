import React from 'react';
import CheckboxList from './CheckboxList';
import { Box, Divider, Typography } from '@mui/material';
import Tips from './Tips';


function Options() {
    // const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative' }}>
            <Box sx={{ maxWidth: 1200 }}>
                <Box sx={{ background: 'linear-gradient(to right, lightblue, blue)', textAlign: 'center', pb: '20px' }}>
                    <Typography variant="h3" color="white" fontWeight={'bold'} sx={{ pt: '20px' }}>
                        Cantonese Helper
                    </Typography>
                    <Typography color="white">Words you "+" from web pages</Typography>
                    <Typography variant="strong" color="primary" textAlign="center">
                        <a style={{ color: 'white' }} href="mailto:dgutyang@gmail.com">Author: Donnie Yang</a>
                    </Typography>
                </Box>
                <CheckboxList />
            </Box>
        </Box>
    );
}

export default Options;

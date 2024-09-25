import React from 'react'
import { Box, Divider, Typography } from '@mui/material';

const Tips = () => {
    return (
        <Box>
            <Typography variant="caption" color="secondary" sx={{ pt: '20px', fontWeight: 'bold' }}>
                 Note:  <Typography variant="caption" color="darkgrey">The sound your heard is generated by Chrome TTS engine, not 100% accurate for all words.</Typography>
            </Typography>
        </Box>
    )
}

export default Tips
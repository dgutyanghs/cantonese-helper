import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// const url = `https://cn.bing.com/dict/search?mkt=zh-cn&q=${encodeURIComponent(text)}`;
const TranslateLink = ({ soundText }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="caption" color={'white'}> Google: 
        <a
          href={`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(soundText)}&op=translate`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.palette.warning.main }}
        >{soundText}
        </a>
      </Typography>
    </Box>
  )
};

export default TranslateLink;

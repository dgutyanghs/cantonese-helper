import React from 'react';

    // const url = `https://cn.bing.com/dict/search?mkt=zh-cn&q=${encodeURIComponent(text)}`;
const TranslateLink = ({ soundText }) => (
  <a 
    href={`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(soundText)}&op=translate`} 
    target="_blank" 
    rel="noopener noreferrer"
    style={{ color:'#2196f3'}}
  >
    Translate:{soundText}
  </a>
);

export default TranslateLink;

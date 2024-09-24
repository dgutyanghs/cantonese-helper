import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const BingDictScrape = ({ text, callbackFn }) => {
    const [translation, setTranslation] = useState('Translating...');

    // Function to concatenate the text content of each node
    function extractTextContent(node) {
        // console.log('node.textContent ', translation);
        if (node === null || node === undefined) {
            setTranslation("");
            console.log("Not Found!");
            callbackFn("");
        } else {
            let translation = node.textContent;
            setTranslation(translation);
            callbackFn(translation);
        }
    }

    useEffect(() => {
        chrome.runtime.sendMessage({ action: 'fetchTranslation', text: text }, response => {
            if (response.error) {
                console.error('Error fetching translation:', response.error);
            } else {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.result, 'text/html');
                // Select the span with class 'def b_regtxt' within the first &lt;li&gt; element
                const defSpan = doc.querySelector('li > span.def.b_regtxt');
                // console.log('defSpan:', defSpan);
                // Get the concatenated text content
                const result = extractTextContent(defSpan);
                console.log("BingDictScrape, result=",result);
            }
        });
    }, [text]);

    // return <span style={{ color:'grey'}}>{translation}</span>;
    return <Typography variant='caption' sx={{ color: 'white', height: '20px' }}>{translation}</Typography>;
};

export default BingDictScrape;

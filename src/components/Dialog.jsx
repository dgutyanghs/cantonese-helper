// import React, { useState } from 'react';
import * as React from 'react';
import '../css/contentScript.css';
import { hasHanChar, convertText } from '../utils.js';
import { nanoid } from 'nanoid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { Opacity } from '@mui/icons-material';
import { lightBlue } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';

import {
    DICT_KEY,
    DICT_ITEM_KEY,
    DICT_ITEM_VAL,
    USER_SELECT_OPTION_KEY_NONE,
    USER_SELECT_OPTION_KEY_CTL,
    USER_SELECT_OPTION_KEY_ALT,
    USER_SELECT_OPTION_KEY_SHIFT,
} from '../constant.js';
import TranslateLink from './TranslateLink';
import BingDictScrape from './BingDictScrape';
import { keyForMouseSelected } from '../contentScript.js';

const oriStyle = {
    position: 'absolute',
    border: '1px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'none',
    // bgcolor: 'success.light'
    bgcolor: 'background.paper',
    zIndex: 10001,
};

function Dialog() {
    const [allText, setAllText] = React.useState(' ');
    const [soundText, setSoundText] = React.useState('你好');
    const [modalStyle, setModalStyle] = React.useState(oriStyle);
    const [covertResult, setCovertResult] = React.useState([]);
    const [wordArray, setWordArray] = React.useState([]);

    const handleClose = () => {
        const newStyle = {
            ...oriStyle,
            display: 'none',
        };
        setModalStyle(newStyle);
    };
    const handleOpen = pos => {
        const newStyle = {
            ...oriStyle,
            top: `${pos.y}px`,
            left: `${pos.x}px`,
            display: 'block',
        };
        const newStyle2 = {
            ...oriStyle,
            // position: 'absolute',
            // top: '50%',
            // left: '50%',
            // transform: 'translate(-50%, -50%)',
            // width: 400,
            bgcolor: theme => alpha(theme.palette.background.paper, 0.5), // This creates a half-transparent background
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            backdropFilter: 'blur(5px)', // This adds a blur effect to the background
            top: `${pos.y}px`,
            left: `${pos.x}px`,
            display: 'block',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '75%', // Set width to 75%
            maxWidth: '1200px', // Keep the previous max width
        };
        setModalStyle(newStyle2);
    };

    React.useEffect(() => {
        /**
         * In option.html, user maybe delete all words, when happened, update the wordArray in contentscript.js
         */
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.action === 'updateWordArray') {
                const wordArrayOption = request.data;
                setWordArray(wordArrayOption);
                console.log('get message, wordArray updated:', wordArrayOption);
            }
        });
        window.addEventListener('message', async event => {
            const { origin, data } = event;
            const { key, val } = data;
            let keyForMousePressed = USER_SELECT_OPTION_KEY_NONE;
            if (key !== 'selection' && key !== 'empty') return;

            // console.log('!!!@@@', key, val);
            switch (key) {
                case 'selection':
                    let { x, y, text } = val;
                    let { ctrlKey, altKey, shiftKey } = val;
                    // console.log('selection, x,y', x, y);

                    if (ctrlKey) {
                        // console.log('ctl key pressed ', ctrlKey);
                        keyForMousePressed = USER_SELECT_OPTION_KEY_CTL;
                    } else if (altKey) {
                        // console.log('alt key pressed', altKey);
                        keyForMousePressed = USER_SELECT_OPTION_KEY_ALT;
                    } else if (shiftKey) {
                        // console.log('shift key pressed', shiftKey);
                        keyForMousePressed = USER_SELECT_OPTION_KEY_SHIFT;
                    }
                    // Mouse + key must Follow the rule in Popup.html
                    if (keyForMouseSelected.toString() != keyForMousePressed.toString()) {
                        console.log(`${keyForMousePressed} not match ${keyForMouseSelected}, not show Dialog`);
                        console.log(typeof keyForMousePressed, typeof keyForMouseSelected);
                        return;
                    }

                    if (hasHanChar(text)) {
                        console.log('has Han character, call convertText', text);

                        // let result = await convertText(text);
                        // console.log(result);
                        chrome.runtime.sendMessage({ action: 'fetchTranslation', text: text });
                        setAllText(text);
                        handleOpen({ x, y });
                    } else {
                        console.log('Not Han character', text);
                    }
                    break;
                case 'empty':
                    console.log('receive mssage,select empty');
                    handleClose();
                    break;
                default:
                    break;
            }
        });
    }, []);

    const stopPassTheEvent = e => e.stopPropagation();
    return (
        <div id="jyutpingpopupdialogid">
            <Box onMouseUp={stopPassTheEvent} sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mt: 2, color: 'black', fontSize: '1rem' }}>
                    {allText}
                </Typography>
            </Box>
        </div>
    );
}

export default Dialog;

// import React, { useState } from 'react';
import * as React from 'react';
import '../css/contentScript.css';
import { hasHanChar, convertText } from '../utils.js';
import { nanoid } from 'nanoid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { Opacity } from '@mui/icons-material';
import { lightBlue } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
import { mm } from '../contentScript.js'

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

    const handleCloseAutoAfterFinishedSubtitleReading = () => {
        const newStyle = {
            ...oriStyle,
            display: 'none',
        };

        setModalStyle(newStyle);
        window.getSelection().empty(); //deSelect the text previous selected by mouse .
    };
    const handleClose = () => {
        const newStyle = {
            ...oriStyle,
            display: 'none',
        };

        chrome.runtime.sendMessage({ action: 'TTSStop', text: '' }, response => {
            console.log('TTS stop speaking', response);
        });
        setModalStyle(newStyle);
    };
    const handleOpen = pos => {
        // const newStyle = {
        //     ...oriStyle,
        //     top: `${pos.y}px`,
        //     left: `${pos.x}px`,
        //     display: 'block',
        // };
        const newStyle2 = {
            ...oriStyle,
            bgcolor: theme => alpha(theme.palette.background.paper, 0.7), // This creates a half-transparent background
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            backdropFilter: 'blur(5px)', // This adds a blur effect to the background
            position: 'fixed',
            top: '80%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', // Set width to 75%
            maxWidth: '1600px', // Keep the previous max width
            display: 'flex', // Add this
            justifyContent: 'center', // Add this
            alignItems: 'center', // Add this
        };
        setModalStyle(newStyle2);
    };

    const textStyle = {
        color: 'orange',
        fontSize: '3rem',
        textAlign: 'center',
        width: '100%',
        fontWeight: 'bold',
        textShadow: `
            1px 1px 2px black,
            0 0 1em lightblue,
            0 0 0.2em lightblue;
        `,
        letterSpacing: '0.05em',
        fontFamily: 'PingFang SC, Heiti SC, Microsoft YaHei, sans-serif',
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
        /**
         * for subtitle reading
         */
        mm.receiveMessageSubtitleEvent("subtitle", (text, isFinished) => {
            // console.log("receive text=",text)
            setAllText(text);

            if(isFinished) {
                handleCloseAutoAfterFinishedSubtitleReading();
            }
        })

        window.addEventListener('message', async event => {
            const { origin, data } = event;
            const { key, val } = data;

            if (key !== 'selection' && key !== 'empty') return;

            // console.log('!!!@@@', key, val);
            switch (key) {
                case 'selection':
                    let { x, y, text } = val;
                    // console.log('selection, x,y', x, y);

                    if (hasHanChar(text)) {
                        // console.log('has Han character, call convertText', text);

                        // let result = await convertText(text);
                        // console.log(result);
                        mm.sendMessageSubtitle("subtitle", text);
                        // setAllText(text);
                        handleOpen({ x, y });
                    } else {
                        console.log('Not Han character', text);
                    }
                    break;
                case 'empty':
                    console.log('receive mssage,select empty');
                    setAllText('');
                    handleClose();

                    break;

                default:
                    break;
            }
        });
    }, []);

    const stopPassTheEvent = e => e.stopPropagation();
    // return (
    //     <div id="jyutpingpopupdialogid">
    //         <Box onMouseUp={stopPassTheEvent} sx={modalStyle}>
    //             <Typography id="modal-modal-title" variant="h6" component="h2" sx={textStyle}>
    //                 {allText}
    //             </Typography>
    //         </Box>
    //     </div>
    // );

    return (
        <div id="jyutpingpopupdialogid">
            <Box
                onMouseUp={stopPassTheEvent}
                sx={{
                    ...modalStyle,
                    // position: 'relative', // Add this to position the close button
                }}
            >
                <IconButton
                    aria-label="close"
                    onClick={handleClose} // You need to define this function
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme => theme.palette.grey[800],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={textStyle}>
                    {allText}
                </Typography>
            </Box>
        </div>
    );
}

export default Dialog;

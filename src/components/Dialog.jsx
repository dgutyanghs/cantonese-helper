// import React, { useState } from 'react';
import * as React from 'react';
import '../css/contentScript.css';
import { hasHanChar, convertText } from '../utils.js';
import { nanoid } from 'nanoid';
import TTSpeech from '../tts.js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Divider, IconButton, Stack } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { ClassSharp, Opacity, Padding } from '@mui/icons-material';
import { lightBlue } from '@mui/material/colors';
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
import shadows from '@mui/material/styles/shadows.js';
// import { myDatabase } from '../database.js';


const oriStyle = {
    position: 'absolute',
    border: '1px solid #AAA',
    boxShadow: 24,
    p: '0px 20px 20px 20px',
    display: 'none',
    // bgcolor: 'background.paper',
    background: 'linear-gradient(126deg, rgba(164,205,251,1) 35%, rgba(99,148,252,1) 93%)',
    zIndex: 10001,
    maxWidth: 500,
    minWidth: 200,
    transition: 'opacity 0.3s ease-in-out',
    opacity: '0',
    borderRadius: '20px',
    shadows: '10px 10px 10px 10px',
    // pointerEvents: 'none',
};

function Dialog() {
    const [allText, setAllText] = React.useState(' ');
    const [soundText, setSoundText] = React.useState('你好');
    const [modalStyle, setModalStyle] = React.useState(oriStyle);
    const [covertResult, setCovertResult] = React.useState([]);
    // const [wordArray, setWordArray] = React.useState([]);
    const [textInWords, setTextInWords] = React.useState(false); // user add this text or not
    const [bingTranslateText, setBingTranslateText] = React.useState("");
    const [isVisible, setIsVisible] = React.useState(false); // for animation of dialog

    const currentStyle = {
        ...modalStyle,
        opacity: isVisible ? 1 : 0,
        // pointerEvents: isVisible ? 'auto' : 'none',
    };
    // const handleClose = () => {
    //     const newStyle = {
    //         ...oriStyle,
    //         display: 'none',
    //         opacity: '0',
    //     };
    //     setModalStyle(newStyle);
    //     setTextInWords(false);
    // };
    // const handleOpen = pos => {
    //     const newStyle = {
    //         ...oriStyle,
    //         top: `${pos.y}px`,
    //         left: `${pos.x}px`,
    //         display: 'block',
    //         opacity: '1',
    //     };
    //     setModalStyle(newStyle);
    // };

    const handleClose = () => {
        setIsVisible(false);
        // setTimeout(() => {
        setModalStyle(prevStyle => ({
            ...prevStyle,
            display: 'none',
        }));
        setTextInWords(false);
        // }, 3000); // This should match the transition duration
    };

    const handleOpen = pos => {
        setModalStyle(prevStyle => ({
            ...prevStyle,
            top: `${pos.y}px`,
            left: `${pos.x}px`,
            display: 'block',
        }));
        // Use setTimeout to ensure the display change has taken effect
        setTimeout(() => {
            setIsVisible(true);
        }, 10);
    };

    function addData(text_key, data) {
        chrome.runtime.sendMessage({ action: "add", text_key: text_key, data: data }, (response) => {
            if (response.success) {
                console.log("Data added successfully");
            }
        });
    }


    React.useEffect(() => {
        /**
         * In option.html, user maybe delete all words, when happened, update the wordArray in contentscript.js
         */
        // chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        //     if (request.action === 'updateWordArray') {
        //         const wordArrayOption = request.data;
        //         setWordArray(wordArrayOption);
        //         console.log('get message, wordArray updated:', wordArrayOption);
        //     }
        // });

        window.addEventListener('message', async event => {
            const { origin, data } = event;
            const { key, val, type } = data;
            let keyForMousePressed = USER_SELECT_OPTION_KEY_NONE;

            if (key !== 'selection' && key !== 'empty') {
                return;
            }

            // console.log('!!!@@@', key, val, type);
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
                        // console.log('has Han character, call convertText', text);

                        let result = await convertText(text);
                        console.log(result);
                        let allText = result.map(e => (
                            <ruby className="textforjyut" key={nanoid()}>
                                {e[0]}
                                <rp>(</rp>
                                <rt className="jyut">{e[1]}</rt>
                                <rp>)</rp>
                            </ruby>
                        ));
                        setAllText(allText);
                        setSoundText(text); //reserve Text for play again.
                        TTSpeech.getInstance().speakLong(text);
                        handleOpen({ x, y });
                        setCovertResult(result);
                    } else {
                        console.log('Not Han character', text);
                    }
                    break;
                case 'empty':
                    console.log('!!!receive mssage, select empty');
                    handleClose();
                    break;
                default:
                    break;
            }
        });
    }, []);

    const playSound = () => TTSpeech.getInstance().speakLong(soundText);
    const addToList = () => {
        /**
         * no matter this text already in the words or not, set state to true for UI
         */
        setTextInWords(true);
        console.log(covertResult);
        const result = covertResult.reduce(
            (acc, [key, value]) => {
                acc.keys.push(key);
                acc.values.push(value);
                return acc;
            },
            { keys: [], values: [] }
        );

        const textArray = result.keys;
        const jyutArray = result.values;
        const text_key = textArray.join('');
        const data = [textArray.join(''), jyutArray.join(' '), { "meaning": bingTranslateText }];
        // console.log("data", data);

        addData(text_key, data);
    };

    const stopPassTheEvent = e => e.stopPropagation();
    return (
        <div id="jyutpingpopupdialogid">
            {/* <Box onMouseUp={stopPassTheEvent} sx={modalStyle}> */}
            <Box onMouseUp={stopPassTheEvent} sx={currentStyle}>
                <Typography variant='h5' sx={{ mt: 2, color: 'white' }}>
                    {allText}
                </Typography>
                <hr />
                <Typography sx={{ fontSize: '0.7rem' }}>
                    <BingDictScrape text={soundText} callbackFn={(text) => setBingTranslateText(text)} />
                </Typography>
                <Stack direction={'row'} bgcolor={'darkgray'} spacing={4} justifyContent={'center'}>
                    <Tooltip title="speak">
                        <IconButton onClick={playSound} color="primary" aria-label="play sound">
                            <VolumeUpIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="save">
                        <IconButton
                            onClick={addToList}
                            color={textInWords ? 'secondary' : 'primary'}
                            data-aug="hello"
                            aria-label="add word to list"
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Typography sx={{ fontSize: '0.7rem', color: 'lightgray' }}>
                    {"press '+' to add characters to your words."}
                </Typography>
                <Divider />
                <Typography sx={{ fontSize: '0.7rem' }}>
                    <TranslateLink soundText={soundText} />
                </Typography>
            </Box>
        </div>
    );
}

export default Dialog;

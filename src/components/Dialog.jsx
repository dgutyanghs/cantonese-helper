// import React, { useState } from 'react';
import * as React from 'react';
import '../css/contentScript.css';
import { hasHanChar, convertText } from '../utils.js';
import { nanoid } from 'nanoid';
import TTSpeech from '../tts.js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconButton, Stack } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { ClassSharp, Opacity } from '@mui/icons-material';
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
import { myDatabase } from '../database.js';

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
    const [textInWords, setTextInWords] = React.useState(false);

    const handleClose = () => {
        const newStyle = {
            ...oriStyle,
            display: 'none',
        };
        setModalStyle(newStyle);
        setTextInWords(false);
    };
    const handleOpen = pos => {
        const newStyle = {
            ...oriStyle,
            top: `${pos.y}px`,
            left: `${pos.x}px`,
            display: 'block',
        };
        setModalStyle(newStyle);
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
                    console.log('receive mssage,select empty');
                    handleClose();
                    break;
                default:
                    break;
            }
        });
        // myDatabase.open(); // open database
        // chrome.storage.sync.get(DICT_KEY, result => {
        //     console.log('storage get result=', result);
        //     const wordArray = result[DICT_KEY];
        //     console.log('storage wordArray', wordArray);
        //     if (wordArray === null || wordArray === undefined) {
        //         console.log('Dialog wordArray is undefined or null');
        //     } else {
        //         console.log('Dialog wordArray is not empty', wordArray);
        //         setWordArray(wordArray);
        //     }
        // });
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
        const textKey = textArray.join('');
        const data = [textArray, jyutArray];
        // console.log("data", data);

        myDatabase.add(textKey, data);
        myDatabase.getData(textKey, data => {
            console.log('textKey getData', data);
        });
        // myDatabase.getData("23", data => {
        //         console.log('23getData', data);
        // });
        // myDatabase.getAll(data => {
        //     console.log('getAll', data);
        // });
        /**
         * Don't add the same word in wordArray
         */
        // const arr = wordArray.filter(item => item[DICT_ITEM_KEY].join('') === textArray.join(''));
        // if (arr.length > 0) {
        //     console.log('arr is already exist', arr, textArray);
        //     return;
        // }
        // console.log(textArray, jyutArray, 'wordArray=', wordArray);
        // const newArray = [{ [DICT_ITEM_KEY]: textArray, [DICT_ITEM_VAL]: jyutArray }, ...wordArray];
        // setWordArray(newArray);
        // // console.log('Dialog wordArray:', wordArray);
        // // console.log('Dialog newArray:', newArray);
        // const newDict = { [DICT_KEY]: newArray };
        // chrome.storage.sync.set(newDict, () => {
        //     console.log('switch data is saved', newDict);
        // });
    };

    const stopPassTheEvent = e => e.stopPropagation();
    return (
        <div id="jyutpingpopupdialogid">
            <Box onMouseUp={stopPassTheEvent} sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mt: 2, color: 'black', fontSize: '1rem' }}>
                    {allText}
                </Typography>
                <hr />
                <Typography sx={{ fontSize: '0.7rem' }}>
                    <BingDictScrape text={soundText} />
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
                <hr />
                <Typography sx={{ fontSize: '0.7rem' }}>
                    <TranslateLink soundText={soundText} />
                </Typography>
            </Box>
        </div>
    );
}

export default Dialog;

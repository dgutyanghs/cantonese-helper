// import React, { useState } from 'react';
import * as React from 'react';
import '../css/contentScript.css';
import { hasHanChar, convertText } from '../utils.js';
import { nanoid } from 'nanoid';
import TTSpeech from '../tts.js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Divider, IconButton, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ListIcon from '@mui/icons-material/List';
import CheckIcon from '@mui/icons-material/Check';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
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


const oriStyle = {
    position: 'absolute',
    // border: '1px solid #AAA',
    boxShadow: 24,
    p: '0px 20px 20px 20px',
    display: 'none',
    // bgcolor: 'background.paper',
    // background: 'linear-gradient(126deg, rgba(164,205,251,1)55%, rgba(99,148,252,1) 93%)',
    // background: rgb(122,180,246);
    background: 'linear-gradient(126deg, rgba(122,180,246,1) 0%, rgba(99,135,252,1) 85%)',
    zIndex: 10001,
    maxWidth: 500,
    minWidth: 200,
    transition: 'opacity 0.3s ease-in-out',
    opacity: '0',
    borderRadius: '20px',
    shadows: '10px 10px 10px 10px',
    // pointerEvents: 'none',
};

function Dialog({ mainSwitch }) {
    const messageListenerRef = useRef(null);
    const [localSwitch, setLocalSwitch] = React.useState(mainSwitch);
    const [allText, setAllText] = React.useState(' ');
    const [soundText, setSoundText] = React.useState('你好');
    const [modalStyle, setModalStyle] = React.useState(oriStyle);
    const [covertResult, setCovertResult] = React.useState([]);
    const [textInWords, setTextInWords] = React.useState(false); // user add this text or not
    const [bingTranslateText, setBingTranslateText] = React.useState("");
    const [isVisible, setIsVisible] = React.useState(false); // for animation of dialog

    const currentStyle = {
        ...modalStyle,
        opacity: isVisible ? 1 : 0,
    };
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



    /**
     * when main switch is changed, it will update the icon, and listen for messages from background
     * msg flow: popup.html -> background.js -> contentScript.js
     */
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateIcon') {
            // Handle the updateIcon message here
            console.log('Received updateIcon message:', message.isOn);
            const newLocalSwitch = message.isOn;
            setLocalSwitch(newLocalSwitch);
        }
    });

    React.useEffect(() => {

        // get the current state of main switch
        // listen for messages from content scripts, when mainswitch is changed, it will update the icon
        window.addEventListener('message', async event => {
            const { origin, data } = event;
            const { key, val, type } = data;
            let keyForMousePressed = USER_SELECT_OPTION_KEY_NONE;


            if (key !== 'cantonese-helper-selection-DonnieYang' && key !== 'empty') {
                return;
            }

            // console.log("!!!Dialog useEffect, main switch is ", mainSwitch);
            console.log("!!!Dialog local switch=", localSwitch);
            if (localSwitch === false) {
                console.log("Dialog, local switch is false, return");
                return;
            }

            // console.log('!!!@@@key, val, type, localSwitch', key, val, type, localSwitch);
            console.log("Dialog, local switch=", localSwitch);
            switch (key) {
                case 'cantonese-helper-selection-DonnieYang':
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
                                <rt className="jyut" style={{ fontSize: '0.8em' }}>{e[1]}</rt>
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
    }, [localSwitch]);



    /** cause can't create a new tab in contentscript.js, use this function to send message to background service, then serviceworker.js open the options page */
    const gotoOptions = () => {
        // chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
        chrome.runtime.sendMessage({ action: 'openOptions' });
    };

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
        <Box id="jyutpingpopupdialogid">
            {/* <Box onMouseUp={stopPassTheEvent} sx={modalStyle}> */}
            <Box onMouseUp={stopPassTheEvent} sx={currentStyle}>
                <Typography variant='h5' sx={{ mt: 2, color: 'white' }}>
                    {allText}
                </Typography>
                <hr />
                <Typography sx={{ fontSize: '0.7rem' }}>
                    <BingDictScrape text={soundText} callbackFn={(text) => setBingTranslateText(text)} />
                </Typography>
                {/* <Divider  /> */}
                {/* <hr /> */}
                <Typography sx={{ fontSize: '0.7rem' }} component={'div'}>
                    <TranslateLink soundText={soundText} />
                </Typography>
                {/* <Divider /> */}
                <Stack direction={'row'} bgcolor={'transparent'} border={'0.5px solid lightgray'} spacing={4} justifyContent={'center'}>
                    <IconButton onClick={playSound} variant="contained" color="warning" aria-label="play sound">
                        <VolumeUpIcon />
                    </IconButton>
                    <IconButton
                        onClick={addToList}
                        color={textInWords ? 'primary' : 'warning'}
                        data-aug="hello"
                        aria-label="add word to list"
                        variant="contained"
                    >
                        {textInWords ? <CheckIcon /> : <AddIcon />}
                    </IconButton>
                    <IconButton onClick={gotoOptions} variant="contained" color="warning" aria-label="play sound">
                        <ListIcon />
                    </IconButton>

                </Stack>
                <Typography sx={{ fontSize: '0.7rem', color: 'lightgray' }}>
                    {"press '+' to add characters to your words."}
                </Typography>
                <hr />
                {/* <Divider /> */}
            </Box>
        </Box>
    );
}

export default Dialog;

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { DICT_ITEM_KEY, DICT_ITEM_VAL, DICT_KEY } from '../constant';
import { Box, Divider } from '@mui/material';
import TTSpeech from '../tts';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MessageBox from './MessageBox';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
import CSvExport from './CsvExport';
// import { myDatabase } from '../database';


export default function CheckboxList() {
    const [wordArray, setWordArray] = React.useState([]);

    function getAllData() {
        chrome.runtime.sendMessage({ action: 'getAll' }, response => {
            console.log(response);
            if (response.data === null || response.data === undefined) {
                console.log('data is undefined or null');
            }else {
                setWordArray(response.data);
            }
        });
    }

    function deleteItem(text_key) {
        chrome.runtime.sendMessage({ action: 'delete', data: text_key }, response => {
            console.log(response);
            if (response.success == false) {
                console.log('text_key is not found in database');
            }else {
                console.log("item deleted successfully");
                //update the words after delete a item
                const newWordArray = wordArray.filter((item) => item["text_key"] != text_key)
                setWordArray(newWordArray)
            }
        });

    }
    React.useEffect(() => {
        getAllData();
    }, []);

    const handlePlaySound = text => e => {
        console.log('handlePlaySound e=', e);
        e.stopPropagation();
        TTSpeech.getInstance().speakLong(text);
    };

    const handleDeleteItem = text => e => {
        e.stopPropagation();
        console.log('handleDeleteItem text=', text);
        deleteItem(text);
    };

    const handleMessageBoxCallback = (data = []) => {
        // wordArray.length = 0;
        wordArray.splice(0, wordArray.length);
        console.log('wordarray:', wordArray);
        setWordArray([]);
        chrome.storage.sync.remove([DICT_KEY], () => {
            console.log('clean storage ', DICT_KEY);
            // Send a message to content scripts to update the array
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(function (tab) {
                    chrome.tabs.sendMessage(tab.id, { action: 'updateWordArray', data: [] });
                });
            });
        });
    };

    return (
        <Box sx={{ bgcolor: 'lightgrey' }}>
            <Divider></Divider>
            <Stack mr="10px" my="10px" direction="row" justifyContent="flex-end" spacing="40px">
                <CSvExport data={wordArray} />
                <MessageBox data={wordArray} onDataUpdate={handleMessageBoxCallback}></MessageBox>
            </Stack>
            <Divider></Divider>
            <List sx={{ width: '100%', minWidth: 400, bgcolor: 'background.paper', overflow: 'auto', height: '450px' }}>
                {wordArray.map((item, i) => {
                    const labelId = `words-list-label-${item['text_key']}-${i}`;
                    const jyutping = item['data'][1].join(' ');
                    const textCharacters = item['data'][0].join('');
                    return (
                        <ListItem
                            onClick={e => {
                                // console.log('onClick e.target value', e.target.innerHTML);
                                TTSpeech.getInstance().speakLong(textCharacters);
                            }}
                            sx={{
                                'maxHeight': 56,
                                'bgcolor': `${i % 2 == 0 ? '#D0D0D0' : '#DCDCDC'}`,
                                '&:hover': {
                                    backgroundColor: 'lightblue',
                                },
                            }}
                            key={labelId}
                            secondaryAction={
                                <Box>
                                    <Tooltip title="speak">
                                        <IconButton onClick={handlePlaySound(textCharacters)} edge="end" aria-label="speak">
                                            <VolumeUpIcon color="primary" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="delete">
                                        <IconButton
                                            onClick={handleDeleteItem(textCharacters)}
                                            sx={{ ml: 2 }}
                                            edge="end"
                                            aria-label="delete"
                                        >
                                            <DeleteIcon style={{ color: 'red' }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                            disablePadding
                        >
                            <ListItemButton role={undefined} dense>
                                <ListItemText
                                    primaryTypographyProps={{
                                        style: {
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        },
                                    }}
                                    primary={textCharacters}
                                />
                                <ListItemText
                                    primaryTypographyProps={{
                                        style: {
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        },
                                    }}
                                    // id={key}
                                    primary={jyutping}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
}

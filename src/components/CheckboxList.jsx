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
import { Box, Divider, ThemeProvider, Typography } from '@mui/material';
import TTSpeech from '../tts';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MessageBox from './MessageBox';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
import CSvExport from './CsvExport';
import { DataGrid, GridFooterContainer, GridToolbarContainer } from '@mui/x-data-grid';


const columns = [
    { field: 'id', headerName: 'ID', width: 40 },
    {
        field: 'character',
        headerName: 'Character',
        width: 200,
        editable: false,
    },
    {
        field: 'jyutping',
        headerName: 'Jyutping',
        width: 450,
        editable: false,
        renderCell: (params) => (
            <Stack direction={"row"} spacing={1} alignItems={"center"} sx={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                <VolumeUpIcon color='primary' />
                <Typography sx={{ flexGrow: 1 }}>{params.value}</Typography>
            </Stack>
        )
    },
    {
        field: 'meaning',
        headerName: 'Meaning',
        // type: 'number',
        width: 300,
        editable: false,
    },
    {
        field: 'date',
        headerName: 'Date',
        // type: 'number',
        width: 150,
        editable: false,
    },

];




export default function CheckboxList() {
    const [rows, setRows] = React.useState([])
    const [selectedRows, setSelectedRows] = React.useState([])


    const handleSelectionModelChange = (selectionModel) => {
        // If the header checkbox is selected, it will be included in the selectionModel
        console.log("selectionModel", selectionModel);

        setSelectedRows(selectionModel);

    };

    const handleDeleteSelectedRows = () => {
        console.log("delete selected rows");
    }

    function getAllData() {
        chrome.runtime.sendMessage({ action: 'getAll' }, response => {
            console.log(response);
            if (response.data === null || response.data === undefined) {
                console.log('data is undefined or null');
            } else {
                const newWordArray = response.data
                const newRows = newWordArray.map((item) => {
                    return {
                        id: item["id"],
                        character: item["data"][0],
                        jyutping: item["data"][1],
                        meaning: item["data"][2]["meaning"],
                        date: item["date"]
                    }
                })

                setRows(newRows)
            }
        });
    }

    function deleteAllData() {
        chrome.runtime.sendMessage({ action: 'deleteAll' }, response => {
            console.log(response);
            if (response.success == false) {
                console.log('error in database');
            } else {
                console.log("all data deleted successfully");
                setRows([])
            }
        });
    }

    function deleteIds(idsArray) {
        console.log("deleteIds, idsArray=", idsArray);
        chrome.runtime.sendMessage({ action: 'deleteIds', data: idsArray }, response => {
            console.log(response);
            if (response.success == false) {
                console.log('error in database');
            } else {
                console.log(" idsArray deleted successfully");

                const newRows = rows.filter((item) => (!idsArray.includes(item["id"])))
                console.log("deleteIds, newRows=", newRows);
                setRows(newRows);
            }
        });
    }


    React.useEffect(() => {
        getAllData();
    }, []);

    const handlePlaySound = text => {
        console.log('handlePlaySound text=', text);
        TTSpeech.getInstance().speakLong(text);
    };

    const handleDeleteItem = text => e => {
        e.stopPropagation();
        console.log('handleDeleteItem text=', text);
        deleteItem(text);
    };

    const handleMessageBoxCallback = (messageRowIDs) => {
        if (messageRowIDs.length == 0 || messageRowIDs === undefined || messageRowIDs === null) {
            return
        }
        console.log("handleMessageBoxCallback, messageRowIDs", messageRowIDs);
        if (messageRowIDs.length == rows.length) {
            deleteAllData();
        } else {
            deleteIds(messageRowIDs);
        }
    };

    return (
        (
            <Box sx={{ height: 600, width: '100%', background: 'linear-gradient(to bottom, lightgrey, darkgrey)' }} >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    checkboxSelection
                    disableRowSelectionOnClick
                    hideFooterPagination
                    onCellClick={(e) => {
                        if (e.field !== 'jyutping') {
                            return
                        }
                        const text = e.row.character
                        handlePlaySound(text);
                    }}
                    onRowSelectionModelChange={handleSelectionModelChange}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'black',
                            color: 'orange', // optional, to change the text color
                            fontSize: '20px',
                        },
                    }}
                />
                <Divider />

                <Stack mr="10px" my="10px" direction="row" justifyContent="flex-start" spacing="40px">
                    <MessageBox rows={selectedRows} onDataUpdate={handleMessageBoxCallback}></MessageBox>
                    <CSvExport data={rows} />
                </Stack>
            </Box>
        )
    )

}
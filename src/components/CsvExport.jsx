import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

const CsvExport = ({data}) => {
    const [cvsData, setcvsData] = useState([]);
    const datestr = new Date().toLocaleDateString();

    
    useEffect(()=> {
      console.log('data =', data);
      setcvsData(data);
    }, [data])

    const headers = [
        { label: 'ID', key: 'id' },
        { label: 'character', key: 'character' },
        { label: 'jyutping', key: 'jyutping' },
        { label: 'meaning', key: 'meaning' },
        { label: 'date', key: 'date' },
    ];

    return (
            <Button  endIcon={<DownloadIcon />} size="small" variant="contained">
                <CSVLink data={cvsData} headers={headers} filename={`words-${datestr}.csv`}  style={{ textDecoration: 'none', color: 'inherit' }} >
                Download All Words
                </CSVLink>
            </Button>
    );
};

export default CsvExport;

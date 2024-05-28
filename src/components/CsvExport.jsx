import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import { DICT_ITEM_KEY, DICT_ITEM_VAL } from '../constant';

const CsvExport = ({data}) => {
    const [cvsData, setcvsData] = useState([]);
    const datestr = new Date().toLocaleDateString();

    
    useEffect(()=> {
      // const keys = data.map( item => item[DICT_ITEM_VAL].join(' '))
      // const values = data.map( item => item[DICT_ITEM_KEY].join(''))

      console.log('data =', data);
      const cvsData = data.map((item, index) => ({
        'id': index + 1,
        'character': item[DICT_ITEM_KEY].join(''),
        'jyutping' :item[DICT_ITEM_VAL].join(' ') 
      }))
      console.log('cvsData =', cvsData);
      setcvsData(cvsData);
    }, [data])

    const headers = [
        { label: 'ID', key: 'id' },
        { label: 'character', key: 'character' },
        { label: 'jyutping', key: 'jyutping' },
    ];

    return (
            <Button  endIcon={<DownloadIcon />} size="small" variant="contained">
                <CSVLink data={cvsData} headers={headers} filename={`words-${datestr}.csv`}  style={{ textDecoration: 'none', color: 'inherit' }} >
                Download 
                </CSVLink>
            </Button>
    );
};

export default CsvExport;


import { mm } from './contentScript.js'


/**
 * connet to background service "serviceWorker.js"
 */
/**
 * Check if a string contains Chinese characters.
 * @param {String} s The string to be checked
 * @return {Boolean} If the string contains at least one Chinese character,
 * returns true. Otherwise returns false.
 */
export const hasHanChar = (s) => {
    const r = /[〆〇一-鿿㐀-䶿𠀀-𪛟𪜀-𫜿𫝀-𫠟𫠠-𬺯𬺰-𮯯𰀀-𱍏]/u;
    return Boolean(s.match(r));
}


/**
 * 
 * @param {string} s to be covert string. 
 * @returns  array like this style: [['a','1'],['b','2'],['c','3'],...]
 */
export const convertText = async (s) => {
    // console.log('converting text:', s)
    const conversionResults = await mm.sendMessageMM('convert', s);
    // console.log(`convert ${s} to `, conversionResults)
    return conversionResults
}



export const  displayDate = (date) => {
    if (date === undefined || (date instanceof Date) === false) {
        console.log('date is undefined or not a date object. ', date);
        return "";
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');

    // console.log(`${year}-${month}-${day} ${hour}:${minute}`);
    return `${year}-${month}-${day} ${hour}:${minute}`;
}
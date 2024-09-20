import Trie from './Trie.js';
import MessageManager from './MessageManager.js';
import { speakLongText, speakLongTextWithResponse, stopSpeaking } from './ttsbg.js';
import { myDatabase } from './database.js';

/**
 * 轉換一個字串，取得字串中每個字及其讀音。
 * @param {Trie} t Trie 樹
 * @param {String} s 鍵字串
 * @return {Array} 二維陣列。每個元素為一個字及其讀音。
 */
function convert(t, s) {
    const res = [];
    while (s.length) {
        const prefix = t.longestPrefix(s);
        if (typeof prefix !== 'undefined') {
            const [cs, rs] = prefix;
            const zipped_cs_rs = cs.map((c, i) => [c, rs[i]]);
            res.push(...zipped_cs_rs);
            s = s.slice(cs.reduce((acc, x) => acc + x.length, 0)); // total length of strings in array cs
        } else {
            const k = s[Symbol.iterator]().next().value; // Unicode-aware version of s[0]
            res.push([k, null]);
            s = s.slice(k.length);
        }
    }
    return res;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchTranslation') {
        fetchTranslation(request.text)
            .then(response => {
                sendResponse({ result: response });
            })
            .catch(error => {
                sendResponse({ error: error.message });
            });
    }
    return true; // Keep the message channel open for asynchronous sendResponse
});

// Listen for messages from content script or options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'add') {
        try {
            myDatabase.add(request.text_key, request.data);
            sendResponse({ success: true });
        } catch (error) {
            console.error(error);
            sendResponse({ success: false, error: error });
        }
        return true; // Indicates we wish to send a response asynchronously
    }

    if (request.action === 'getAll') {
        myDatabase.getAll(data => {
            if (data.length) {
                sendResponse({ data: data, success: true });
            } else {
                sendResponse({ data: null, success: false });
            }
        });
        return true; // Indicates we wish to send a response asynchronously
    }
    if (request.action === 'delete') {
        console.log('delete ', request.data);
        myDatabase.delete(request.data, success => {
            sendResponse({ success });
        });
        return true; // Indicates we wish to send a response asynchronously
    }
    if (request.action === 'deleteAll') {
        myDatabase.deleteAll(success => {
            sendResponse({ success });
        });
        return true; // Indicates we wish to send a response asynchronously
    }
});

function startTTS(text, port) {
    // Example TTS process
    let words = text.split(',');
    let i = 0;

    function speakWord() {
        if (i < words.length) {
            // Simulate speaking a word
            console.log('Speaking:', words[i]);
            port.postMessage({ status: 'speaking', word: words[i] });
            i++;
            setTimeout(speakWord, 500); // Adjust timing as needed
        } else {
            port.postMessage({ status: 'finished' });
        }
    }

    speakWord();
}

async function fetchTranslation(text) {
    // https://cn.bing.com/dict/search?mkt=zh-cn&q=
    const url = `https://cn.bing.com/dict/search?mkt=zh-cn&q=${encodeURIComponent(text)}`;
    console.log('fetch Translation for ', text);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    return html;
}

/**
 * initial database
 */
async function initializeAndUseDatabase() {
    await myDatabase.open();
}

(async () => {
    const browser = chrome;
    /* Dictionary */

    const t = new Trie();

    /* Communicate with content script */

    chrome.runtime.onConnect.addListener(port => {
        console.assert(port.name === 'knockknock');
        const mm = new MessageManager(port);
        mm.registerHandler('convert', s => convert(t, s));
        // console.log('service Worker, onConnect ready, mm=', mm);
        mm.registerHandlerSubtitle('subtitle', s => speakLongTextWithResponse(s, port));
        const pingTimer = mm.startPingTimer(10);

        port.onDisconnect.addListener(p => {
            if (p.error) {
                console.log(`Disconnected due to an error: ${p.error.message}`);
            }
            clearInterval(pingTimer);
            console.log('port disconnected already...');
        });
    });

    for (const [k, v] of await (await fetch(chrome.runtime.getURL('dictionary.json.txt'))).json()) {
        t.addWord(k, v);
    }
    console.log('diction ready!,size:', t.totalSize());

    initializeAndUseDatabase();
})();

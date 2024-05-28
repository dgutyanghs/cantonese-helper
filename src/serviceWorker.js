import Trie from './Trie.js';
import MessageManager from './MessageManager.js';

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
    if (request.action === "fetchTranslation") {
        fetchTranslation(request.text).then(response => {
            sendResponse({ result: response });
        }).catch(error => {
            sendResponse({ error: error.message });
        });
    }
    return true; // Keep the message channel open for asynchronous sendResponse
});

async function fetchTranslation(text) {
    // https://cn.bing.com/dict/search?mkt=zh-cn&q=
    const url = `https://cn.bing.com/dict/search?mkt=zh-cn&q=${encodeURIComponent(text)}`;
    console.log("fetch Translation for ", text)
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    return html;
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


    /* Context Menu */

    // browser.contextMenus.onClicked.addListener((info, tab) => {
    //     if (info.menuItemId === 'do-inject-jyutping') {
    //         browser.tabs.sendMessage(tab.id, { name: 'do-inject-jyutping' });
    //     }
    // });

    // browser.contextMenus.create({
    //     id: 'do-inject-jyutping',
    //     title: browser.i18n.getMessage('contextMenuItemDoInjectJyutping'),
    //     contexts: ['page'],
    // });
})();

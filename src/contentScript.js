import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import Dialog from './components/Dialog';
import MessageManager from './MessageManager.js';
import { MOUSE_AND_KEY, SWITCH_POPUP, USER_SELECT_OPTION_KEY_NONE, DICT_KEY } from './constant';
// 注入 web_accessible_resources.js
import { myDatabase } from './database.js'

const injectScriptToPage = async () => {
    function injectScript(file_path, tag) {
        const node = document.getElementsByTagName(tag)[0];
        const script = document.createElement('script');
        // script.setAttribute('type', 'module');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', file_path);
        node.appendChild(script);
    }

    injectScript(chrome.runtime.getURL('web_accessible_resources.js'), 'body');
    console.log('注入 web_accessible_resources.js 完成');
};

const injectDOM = async (isToggled) => {

    const container = document.createElement('div');
    container.id = 'jyutpingwonderful-container';
    document.body.appendChild(container);

    console.log('injectDOM, isToggled=', isToggled);
    // createRoot(container).render(<Dialog />);
    createRoot(container).render(<Dialog mainSwitch={isToggled} />);
    console.log('injectDOM finished');
};

function getKeyForMouseSelected(key) {
    return new Promise((reslove, reject) => {
        chrome.storage.sync.get(key, function (result) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                if (result[key] === undefined) {
                    reslove(USER_SELECT_OPTION_KEY_NONE);
                } else {
                    reslove(result[key]);
                }
            }
        });
    });
}


function getSwitchState(key) {
    return new Promise((reslove, reject) => {
        chrome.storage.sync.get(key, function (result) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                if (result[key] === undefined) {
                    reslove(true);
                } else {
                    reslove(result[key]);
                }
            }
        });
    });
}

let port;
let msgManager;

/**
 * for User select key  in popup.html
 */
export let keyForMouseSelected = USER_SELECT_OPTION_KEY_NONE;

/**
 * all user words saved in storage
 * */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'KEY_VALUE_CHANGED') {
        keyForMouseSelected = request.value;
        // Handle the new value as needed
        console.log('Key value changed to:', keyForMouseSelected);
        // Optionally send a response back
        sendResponse({ status: 'success' });
    }
});



const init = async () => {
    //check ON or OFF switch in popup.html .
    // const isON = await getSwitchState(SWITCH_POPUP);
    // if (!isON) {
    //     console.log('contentscript, switch_popup isON =', isON);
    //     return;
    // } else {
    //     console.log('contentscript, isOn=', isON)
    // }

    // let isToggled = true;
    // await chrome.storage.local.get(['isToggled'], (result) => {
    //     console.log("injectDOM, isToggled=", result.isToggled);
    //     if (result.isToggled === undefined) {
    //         console.log("injectDOM, isToggled is undefined, set to true");
    //         isToggled = true;
    //         chrome.storage.local.set({ isToggled });
    //     } else {
    //         isToggled = result.isToggled;
    //         console.log("injectDOM, result.isToggled=", result.isToggled);
    //     }
    // });

    keyForMouseSelected = await getKeyForMouseSelected(MOUSE_AND_KEY);
    await injectScriptToPage();
    await injectDOM(true);
    console.log('contentSrcipts init, keyForMouseSelected =', keyForMouseSelected);
};



port = chrome.runtime.connect({ name: 'knockknock' });
msgManager = new MessageManager(port);
msgManager.keepAliveHandler();
init();

export const mm = msgManager;

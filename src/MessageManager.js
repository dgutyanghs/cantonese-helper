/* Usage example:

In background script:

browser.runtime.onConnect.addListener(port => {
    const mm = new MessageManager(port);
    mm.registerHandler('double', s => s + s);
    mm.registerHandler('triple', s => s + s + s);
});

In content script:

const port = browser.runtime.connect();
const mm = new MessageManager(port);
mm.sendMessage('double', '你好').then(f => alert(f));  // Will alert 你好你好
mm.sendMessage('triple', '你好').then(f => alert(f));  // Will alert 你好你好你好
*/

import { nanoid } from 'nanoid';

// const port = chrome.runtime.connect();

class MessageManager {
    constructor(port) {
        this.port = port;
    }

    /**
     *
     * @param {string} command command name
     * @param {string} str Need tranlate string
     * @returns
     */
    sendMessageMM(command, str) {
        const { port } = this;
        const id = nanoid();
        return new Promise(resolve => {
            port.onMessage.addListener(function f(response) {
                if (response.id === id) {
                    // port.onMessage.removeListener(f);
                    resolve(response.msg);
                }
            });
            port.postMessage({ str, id, name: command });
        });
    }

    /**
     *
     * @param {string} command command name
     * @param {Function} f callback function
     */
    registerHandler(command, f) {
        const { port } = this;
        port.onMessage.addListener(receiveMsg => {
            // console.log('bg service receive msg:', receiveMsg);
            if (receiveMsg.name === command) {
                const res = f(receiveMsg.str);
                port.postMessage({ msg: res, id: receiveMsg.id });
                // console.log('bg service dict result:', res);
            }
        });
    }

    registerHandlerSubtitle(command, f) {
        const { port } = this;
        port.onMessage.addListener(receiveMsg => {
            // console.log('bg service receive msg:', receiveMsg);
            if (receiveMsg.name === command) {
                f(receiveMsg.str, port);
                // port.postMessage({ msg: res, id: receiveMsg.id });
                // console.log('bg service dict result:', res);
            }
        });
    }

    sendMessageSubtitle(command, str) {
        const { port } = this;


        port.postMessage({ str, name: command });
        // const id = nanoid();
        // return new Promise(resolve => {
        //     port.onMessage.addListener(function f(response) {
        //             resolve(response);
        //     });
        //     port.postMessage({ str, name: command });
        // });
    }

    receiveMessageSubtitleEvent(command, f) {
        const { port } = this;
        port.onMessage.addListener(response => {
            if (command === response.name) {
                console.log("command match,response", response)
                f(response.text, response.isFinished);
            }else {
                // console.log("command not match", response)
            }
        });
    }
    //code in contentScript.js
    keepAliveHandler = () => {
        const { port } = this;
        port.onMessage.addListener(msg => {
            // console.log('keepAliveHandler, res=', msg.msg);
            if (msg.msg !== 'keep-alive') {
                return;
            } else {
                console.log('keep-alive msg:', msg.id);
            }
        });
    };
    // Code on service worker
    startPingTimer(seconds) {
        const id = nanoid();
        const pingInterval = setInterval(() => {
            const { port } = this;

            port.postMessage({
                msg: 'keep-alive',
                id: 'ping+' + id,
            });
            // for subtitle
            // port.postMessage({
            //     msg: 'keep-alive',
            //     id: 'ping+' + id,
            // });
        }, 1000 * seconds); 
        return pingInterval;
    };
}

export default MessageManager;

/* Initialize state */
// (async () => {
//     let browser = chrome;
//     document.documentElement.lang = browser.i18n.getMessage('langCode');
//     document.getElementById('checkboxText').innerHTML = browser.i18n.getMessage('popupCheckboxText');
//     document.getElementById('extensionEnabled').checked = (await browser.storage.local.get('enabled'))['enabled'] !== false;
//     console.log("hello world, popup.js")
// })();

// /* Handle state change */
// document.getElementById('extensionEnabled').addEventListener('click', () => {
//     let browser = chrome;
//     browser.storage.local.set({ enabled: document.getElementById('extensionEnabled').checked });
//     document.getElementById('refreshPromptText').innerHTML = browser.i18n.getMessage('refreshPromptText');
// });

import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './components/App';

const container = document.getElementById('bodyPartWrapper');
const root = createRoot(container);
root.render(<App />);


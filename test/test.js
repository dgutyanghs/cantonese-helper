// // Create Twitter share URL
// const shareUrl = 'http://twitter.com/share?text=' + selection + '&url=https://awik.io';

// // Append HTML to the body, create the "Tweet Selection" dialog
// document.body.insertAdjacentHTML(
//     'beforeend',
//     '<div id="share-snippet" style="position: absolute; top: ' +
//         posY +
//         'px; left: ' +
//         posX +
//         'px;"><div class="speech-bubble"><div class="share-inside"><a href="javascript:void(0);" onClick=\'window.open("' +
//         shareUrl +
//         '", "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600");\'>TWEET SELECTION</a></div></div></div>'
// );

// Function A in contentscript.js
function A() {
    // Send a message to the background script
    chrome.runtime.sendMessage({ greeting: 'hello' }, function (response) {
        console.log(response.farewell);
    });
}

// Background Script (background.js):

// Function B in background.js
function B(greeting) {
    console.log(greeting);
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.greeting === 'hello') {
        B(request.greeting); // Call function B when a message is received
        sendResponse({ farewell: 'goodbye' });
    }
});

browser.runtime.onConnect.addListener(port => {
    console.log('Connected to', port.name);
    port.onMessage.addListener(message => {
        // Handle messages sent through this port
    });
});

const a = [["a", "x"],["b", "y"],["c", "z"]];
const b = ["a","b", "c"];
const c = ["x","y", "z"];
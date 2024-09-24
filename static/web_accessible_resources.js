const sendMessage2 = (key, val, ext = 'none') => {
    window.postMessage({ type: 'mouse-selected', key, val, ext }, '*');
};

/**
 * When the text is selected by mouse, send a message to the Dialog.jsx
 */
document.addEventListener('mouseup', function (event) {
    // 如果不是左键点击，直接返回
    if (event.button !== 0) return;

    console.log("event ctrl, alt, shift ", event.ctrlKey, event.altKey, event.shiftKey)

    let selectedText = window.getSelection().toString().trim();
    console.log('mouseup,selectedText:', selectedText);
    if (selectedText == null || selectedText == '') {
        sendMessage2('empty', { x: event.clientX, y: event.clientY });
        return;
    }

    handleSelection(event);
});

const handleSelection = event => {
    const sel = window.getSelection();
    var selectedText = sel.toString().trim();
    let range = sel.getRangeAt(0);
    let rect = range.getBoundingClientRect();

    let selectionData = {
        text: selectedText,
        x: rect.left,
        y: event.pageY + 20,
        screenWidth: window.innerWidth,
        screenHeight: window.scrollY + window.innerHeight,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey 
    };
    console.log('sendMessage2', selectionData);
    sendMessage2('selection', selectionData);
};

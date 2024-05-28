const sendMessage = (key, val, ext = 'none') => {
    window.postMessage({ type: 'FROM_WAR', key, val, ext }, '*');
};

// 划词监听
document.addEventListener('mouseup', function (event) {
    // 如果不是左键点击，直接返回
    if (event.button !== 0) return;

    console.log("event ctrl, alt, shift ", event.ctrlKey, event.altKey, event.shiftKey)
    // if (event.ctrlKey) {
    //     console.log('web accessible ctl key pressed');
    // } else if (event.altKey) {
    //     console.log('web accessible alt key pressed');
    // } else if (event.shiftKey) {
    //     console.log('web accessible shift key pressed');
    // }

    let selectedText = window.getSelection().toString().trim();
    console.log('mouseup,selectedText:', selectedText);
    if (selectedText == null || selectedText == '') {
        sendMessage('empty', { x: event.clientX, y: event.clientY });
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
    console.log('sendMessage', selectionData);
    sendMessage('selection', selectionData);
};

// 监听content_script发送的消息
// window.addEventListener("message", (event) => {
//   let { key, val } = event.data;

//   switch (key) {

//     default:
//       break;
//   }

// });

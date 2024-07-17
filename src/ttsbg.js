
let myspeaking = false

export function splitChineseSentences(text) {
    console.log("text:",text);
    // const regex = /(?:[^。！？；，\)）"」』.!?,]+[\)）"」』]*[。！？；，.!?,]|[^。！？；，\)）"」』.!?,]+[\)）"」』]*$)/g; 
    const regex = /(?:[^。！？；，\)）"」』!?,]+[\)）"」』]*[。！？；，!?,]|[^。！？；，\)）"」』!?,]+[\)）"」』]*$)/g; 
    return text.match(regex) || [];
  }


export function speakLongText(text) {
    // const maxLength = 80; // Adjust this based on your needs
    // const chunks = text.match(new RegExp(`.{1,${maxLength}}(\\s|$)`, 'g'));
    const chunks = splitChineseSentences(text);
    console.log("chunks:",chunks);

    function speakNextChunk(index) {
      if (index < chunks.length) {
        chrome.tts.speak(chunks[index].trim(), {
          lang: 'zh-CN',
          rate: 1.2,
          pitch: 0.5,
          onEvent: function(event) {
            // console.log("speak next chunk, event:", event);
            if (event.type === 'end' || event.type === 'interrupted' || event.type === 'cancelled') {
              if (myspeaking === true) {
                speakNextChunk(index + 1);
              }
            }
          }
        });
      } else {
        // speack finished
        console.log(" speak finished, index=",index);
        myspeaking = false;
        return true;
      }
    }
    
    myspeaking = true;
    speakNextChunk(0);
}
  

export function stopSpeaking() {
    myspeaking = false;
    chrome.tts.stop();
    console.log("bg stop speaking!")
}
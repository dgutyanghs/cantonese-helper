
export function splitChineseSentences(text) {
    console.log("text:",text);
    const regex = /(?:[^。！？；，\)）"」』.!?,]+[\)）"」』]*[。！？；，.!?,]|[^。！？；，\)）"」』.!?,]+[\)）"」』]*$)/g; 
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
            console.log("speak next chunk, event:", event);
            if (event.type === 'end' || event.type === 'interrupted' || event.type === 'cancelled') {
              speakNextChunk(index + 1);
            }
          }
        });
      }
    }
    
    speakNextChunk(0);
}
  
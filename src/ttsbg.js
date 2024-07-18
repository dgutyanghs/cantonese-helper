
let myspeaking = false

export function splitChineseSentences(text) {
    console.log("text:",text);
    // const regex = /(?:[^。！？；，\)）"」』.!?,]+[\)）"」』]*[。！？；，.!?,]|[^。！？；，\)）"」』.!?,]+[\)）"」』]*$)/g; 
    // const regex = /(?:[^。！？；，\)）"」』!?,]+[\)）"」』]*[。！？；，!?,]|[^。！？；，\)）"」』!?,]+[\)）"」』]*$)/g; 
    // return text.match(regex) || [];
    return text.match(/[^。！？；，]+[。！？；，]?/g) || []; 
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
          rate: 1.3,
          pitch: 1,
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

export function speakLongTextWithResponse(text, port) {
  const chunks = splitChineseSentences(text);
  console.log("chunks:",chunks);

  function speakNextChunk(index) {
    if (index < chunks.length) {
      chrome.tts.speak(chunks[index].trim(), {
        lang: 'zh-CN',
        rate: 1.3,
        pitch: 1,
        onEvent: function(event) {
          // console.log("speak next chunk, event:", event);
          if (event.type === 'end' || event.type === 'interrupted' || event.type === 'cancelled') {
            if (myspeaking === true) {
              speakNextChunk(index + 1);
            }
          } else if (event.type ==='start') {
              let subtitleChunk = chunks[index].trim();
              console.log("bg send response to Dialog, subtitleChunk=", subtitleChunk);
              // chrome.runtime.sendMessage({ action: 'subtitle', text: subtitle });
              port.postMessage({name:"subtitle", text: subtitleChunk, isFinished: false});
          }
        }
      });
    } else {
      // speack finished
      console.log(" speak finished, index=",index);
      myspeaking = false;
      port.postMessage({name:"subtitle", text: "", isFinished: true});
      return true;
    }
  }
  
  myspeaking = true;
  speakNextChunk(0);
}

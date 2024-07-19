let myspeaking = false;

export function splitChineseSentencesOld(text) {
    console.log('text:', text);
    // const regex = /(?:[^。！？；，\)）"」』.!?,]+[\)）"」』]*[。！？；，.!?,]|[^。！？；，\)）"」』.!?,]+[\)）"」』]*$)/g;
    // const regex = /(?:[^。！？；，\)）"」』!?,]+[\)）"」』]*[。！？；，!?,]|[^。！？；，\)）"」』!?,]+[\)）"」』]*$)/g;
    // return text.match(regex) || [];
    return text.match(/[^。！？；，]+[。！？；，]?/g) || [];
    // return text.match(/[^，]*?(?:，[^，]*?){0,78}[。！？；，]?/g) || [];
}

function splitChineseSentences(text) {
    const StrMaxLength = 42;
    // First, split by periods, exclamation marks, question marks, and semicolons
    let chunks = text.match(/[^.!?；]+[.!?；]?/g) || [];

    // Then, process each chunk
    let result = [];
    for (let chunk of chunks) {
        // If the chunk is longer than 20 characters and contains a comma
        if (chunk.length > StrMaxLength && chunk.includes('，')) {
            // Split by commas
            let subChunks = chunk.split('，');
            let currentChunk = '';

            for (let subChunk of subChunks) {
                if (currentChunk.length + subChunk.length > StrMaxLength) {
                    if (currentChunk) {
                        result.push(currentChunk.trim() + '，');
                        currentChunk = '';
                    }
                    result.push(subChunk.trim() + '，');
                } else {
                    currentChunk += (currentChunk ? '，' : '') + subChunk;
                }
            }

            if (currentChunk) {
                result.push(currentChunk.trim() + '，');
            }
        } else {
            result.push(chunk.trim());
        }
    }

    return result;
}

// Test the function
// let text = "郭文贵先生，发起爆料革命，和创立新中国联邦 ，汇聚全球正义力量。";
// console.log(splitChineseSentences(text));

export function speakLongText(text) {
    // const maxLength = 80; // Adjust this based on your needs
    // const chunks = text.match(new RegExp(`.{1,${maxLength}}(\\s|$)`, 'g'));
    const chunks = splitChineseSentences(text);
    console.log('chunks:', chunks);

    function speakNextChunk(index) {
        if (index < chunks.length) {
            chrome.tts.speak(chunks[index].trim(), {
                lang: 'zh-CN',
                rate: 1.3,
                pitch: 1,
                onEvent: function (event) {
                    // console.log("speak next chunk, event:", event);
                    if (event.type === 'end' || event.type === 'interrupted' || event.type === 'cancelled') {
                        if (myspeaking === true) {
                            speakNextChunk(index + 1);
                        }
                    }
                },
            });
        } else {
            // speack finished
            console.log(' speak finished, index=', index);
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
    console.log('bg stop speaking!');
}

export function speakLongTextWithResponse(text, port) {
    const chunks = splitChineseSentences(text);
    console.log('chunks:', chunks);

    function speakNextChunk(index) {
        if (index < chunks.length) {
            chrome.tts.speak(chunks[index].trim(), {
                lang: 'zh-CN',
                rate: 1.3,
                pitch: 1,
                onEvent: function (event) {
                    // console.log("speak next chunk, event:", event);
                    if (event.type === 'end' || event.type === 'interrupted' || event.type === 'cancelled') {
                        if (myspeaking === true) {
                            speakNextChunk(index + 1);
                        }
                    } else if (event.type === 'start') {
                        let subtitleChunk = chunks[index].trim();
                        console.log('bg send response to Dialog, subtitleChunk=', subtitleChunk);
                        // chrome.runtime.sendMessage({ action: 'subtitle', text: subtitle });
                        port.postMessage({ name: 'subtitle', text: subtitleChunk, isFinished: false });
                    }
                },
            });
        } else {
            // speack finished
            console.log(' speak finished, index=', index);
            myspeaking = false;
            port.postMessage({ name: 'subtitle', text: '', isFinished: true });
            return true;
        }
    }

    myspeaking = true;
    speakNextChunk(0);
}

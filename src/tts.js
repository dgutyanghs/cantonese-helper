let timeoutResumeInfinity = null;
const SpeechLang = 'zh-HK';
// const SpeechLang = 'zh-CN';

class TTSpeech {
    constructor(text = '') {
        if (!TTSpeech.instance) {
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
            utterance.volume = 1;
            utterance.voiceURI = 'native';

            this.utterance = utterance;
            TTSpeech.instance = this;
        }
        return TTSpeech.instance;
    }

    static getInstance() {
        if (!TTSpeech.instance) {
            TTSpeech.instance = new TTSpeech();
        }
        return TTSpeech.instance;
    }

    splitChineseSentences(text) {
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

    speakLong = text => {
        if (typeof text !== 'string' || text.length === 0) {
            return;
        }
        window.speechSynthesis.cancel();

        let chunks = this.splitChineseSentences(text);

        const { utterance } = this;
        // console.log(`@@utterance=${utterance}`);
        if (utterance.voice == null) {
            let voices = window.speechSynthesis.getVoices();
            let voiceForSpeack = voices.find(voice => voice.lang === SpeechLang);
            utterance.voice = voiceForSpeack;
            // console.log('setVoiceFor zh-CN');
        }
        // console.log(`@@lang=${utterance.voice.lang}`);
        function speakNextChunk(index) {
            if (index < chunks.length) {
                utterance.text = chunks[index].trim();
                window.speechSynthesis.speak(utterance);
            } else {
                console.log('all chunks had been speak');
            }

            utterance.onend = function (e) {
                // console.log('@@@Finished in ' + e.elapsedTime + ' seconds.');
                speakNextChunk(index + 1);
            };
            utterance.onstart = e => {
                console.log('tts start,', e.utterance.text);
            };
        }

        speakNextChunk(0);
        // window.speechSynthesis.speak(utterance);
    };
    speak = text => {
        if (typeof text !== 'string' || text.length === 0) {
            return;
        }
        window.speechSynthesis.cancel();

        const { utterance } = this;
        // console.log(`@@utterance=${utterance}`);
        if (utterance.voice == null) {
            let voices = window.speechSynthesis.getVoices();
            let voiceForZH_CN = voices.find(voice => voice.lang === SpeechLang);
            utterance.voice = voiceForZH_CN;
            console.log('setVoiceFor zh-CN');
        }
        // console.log(`@@lang=${utterance.voice.lang}`);
        utterance.text = text;
        utterance.onend = function (e) {
            // console.log('@@@Finished in ' + e.elapsedTime + ' seconds.');
        };
        utterance.onstart = e => {
            console.log('tts start,', e.utterance.text);
        };

        window.speechSynthesis.speak(utterance);
    };
}

window.speechSynthesis.onvoiceschanged = function () {
    let voices = window.speechSynthesis.getVoices();
    console.log(' onvoiceschanged voices=', voices);
    let voiceForZH_CN = voices.find(voice => voice.lang === SpeechLang);
    TTSpeech.getInstance().utterance.voice = voiceForZH_CN;
};

export default TTSpeech;

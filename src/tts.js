let timeoutResumeInfinity = null;
// const SpeechLang = "zh-HK";
const SpeechLang = "zh-CN";

class TTSpeech {
    constructor(text = '') {
        if (!TTSpeech.instance) {
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1.6;
            utterance.rate = 1.2;
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


  

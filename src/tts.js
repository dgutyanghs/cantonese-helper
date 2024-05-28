let timeoutResumeInfinity = null;

class TTSpeech {
    constructor(text = '') {
        if (!TTSpeech.instance) {
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1;
            utterance.rate = 1;
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
            let voiceForZH_HK = voices.find(voice => voice.lang === 'zh-HK');
            utterance.voice = voiceForZH_HK;
            console.log('setVoiceFor zh-HK');
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
    let voiceForZH_HK = voices.find(voice => voice.lang === 'zh-HK');
    TTSpeech.getInstance().utterance.voice = voiceForZH_HK;
};

export default TTSpeech;

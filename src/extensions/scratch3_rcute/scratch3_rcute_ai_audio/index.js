const ArgumentType = require('../../../extension-support/argument-type');
const BlockType = require('../../../extension-support/block-type');
const log = require('../../../util/log');
const Cast = require('../../../util/cast');
const formatMessage = require('format-message');
const scrlink = require('../rcute-scrlink-ws');
const _formatMessage = require('../translate');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';


class Scratch3RcuteAiAudioBlocks {

    static get EXTENSION_NAME () {
        return '语音识别';
    }
    static get EXTENSION_ID () {
        return 'rcuteAiAudio';
    }
    
    constructor (runtime) {
        this.runtime = runtime;
        scrlink.waitOpen().then(()=>{
            scrlink.rpc('sst_lang_list',[]).then(l=>{this.sttLangList=l});
        });
    }

    getInfo () {
        var _ = this._ = new _formatMessage(formatMessage.setup().locale,Scratch3RcuteAiAudioBlocks.EXTENSION_ID);
        return {
            id: Scratch3RcuteAiAudioBlocks.EXTENSION_ID,
            name: Scratch3RcuteAiAudioBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'openMic',
                    text: _('open microphone [MIC]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MIC: {
                            type: ArgumentType.STRING,
                            menu: 'audioMenu'
                        }
                    }
                },
                {
                    opcode: 'closeMic',
                    text: _('close microphone'),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'wwd',
                    text: _('[ONOFF] wake word detection'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'onoffMenu'
                        }
                    }
                },
                {
                    opcode: 'whenWWD',
                    text: _('when wake word is detected'),
                    blockType: BlockType.HAT,
                },
                {
                    opcode: 'stt',
                    text: _('recognize speech in [LANG]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LANG: {
                            type: ArgumentType.STRING,
                            menu: 'langMenu',
                            defaultValue: _({id:'default_stt_lang',default:'en'})
                        }
                    }
                },    
                {
                    opcode: 'getRecognizedSpeech',
                    text: _('speech recognition content'),
                    blockType: BlockType.REPORTER,
                },                
            ],
            
            menus: {
                audioMenu: {
                    acceptReporters: true,
                    items: 'getConnectedPeripheralMicrophones'
                },
                onoffMenu: {
                    acceptReporters: false,
                    items: [{text:_('start'),value:'on'},{text:_('stop'),value:'off'}]
                },
                langMenu: {
                    acceptReporters: false,
                    items: 'getSttLangMenu'
                }
            }
        };
    }
    async arpc(...cmd){
        if (!scrlink.connected){
            scrlink.connect();
            await scrlink.waitOpen();
        }
        return scrlink.rpc(...cmd);
    }
    getConnectedPeripheralMicrophones() {
        var r = ['rcuteCozmars']
                        .map(i=>this.runtime.getPeripheralIsConnected(i)&&this.runtime.peripheralExtensions[i]._serial)
                        .filter(i=>i);
        return r.length?r:[{text:this._('no available microphones'),value:null}];
    }
    openMic({MIC}){
        if(!MIC || this.wwdRPC && this.micSerial==MIC) return;
        this.micSerial = MIC;
        this.wwdRPC= scrlink.rpc('audio',[this.micSerial]);
        this.wwdRPC.catch(e=>{this.wwdRPC=null});
        (async()=>{
                for await (var rec of this.wwdRPC){
                    this.rec = rec;
                    this.rec.timestamp = Date.now();
                }
            })().catch(console.warn);
    }
    closeMic(){
        this.wwdRPC && this.wwdRPC.cancel();
        this.rec=null;
    }
    async wwd({ONOFF}){
        if(ONOFF=='on')await this.arpc('start_wwd',['wwd','WakeWordDetector()']);
        else await this.arpc('stop_wwd',[]);
    }
    whenWWD() {
        if(this.rec){
            this.rec=null;
            return true;
        }
        return false;
    }
    async stt({LANG}){
        this.recognizedSpeech= await this.arpc('stt',[this.micSerial,'stt-'+LANG]);
    }
    getRecognizedSpeech() {
        return this.recognizedSpeech
    }
    getSttLangMenu(){
        var l = this.sttLangList || {'en':'English','zh':'中文'};
        return Object.keys(l).map(i=>({text:this._(l[i]),value:i}));
    }
}

module.exports = Scratch3RcuteAiAudioBlocks;

const ArgumentType = require('../../../extension-support/argument-type');
const BlockType = require('../../../extension-support/block-type');
const log = require('../../../util/log');
const Cast = require('../../../util/cast');
const formatMessage = require('format-message');
const scrlink = require('../rcute-scrlink-ws');
const _formatMessage = require('../translate');
const rutil = require('../util')
const {Queue, StopIteration} = require('../wsmprpc.client');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';


class Scratch3RcuteAiAudioBlocks {

    static get EXTENSION_ID () {
        return 'rcuteAiAudio';
    }

    constructor (runtime) {
        this.runtime = runtime;
        this.redirectAudioState = 'closed';
        this.redirectAudioRequest = [];
        scrlink.waitOpen().then(()=>{
            scrlink.rpc('stt_lang_list',[]).then(l=>{this.sttLangList=l});
        });
    }
    startRedirectAudio(serial) {
        const engine = this.runtime.audioEngine;
        let {audioQueue,scriptNode,speakerRPC} =this;
        var prefill = 5;
        var bs = 1600;
        if (this.redirectAudioState=='closed'){
            var op = {dtype:'int8', sample_rate:16000, block_duration:0.1};
            audioQueue=this.audioQueue = new Queue(0);
            this.speakerRPC= scrlink.rpc('speaker', [serial, op], request_stream=audioQueue);
            engine.inputNode.disconnect();
            this.scriptNode = engine.audioContext.createScriptProcessor(4096,1,1);
            engine.inputNode.connect(this.scriptNode);
            this.scriptNode.connect(engine.audioContext.destination);
            var downsampleRate = engine.audioContext.sampleRate/op.sample_rate;
            var ii=0, i8 = new Int8Array(bs);
            prefillList = [];
            this.redirectAudioState = 'open';
            let that = this;
            this.scriptNode.onaudioprocess = evt=> { // downsample and convert to int8
                if(that.redirectAudioState=='closed')return;
                var f32 = evt.inputBuffer.getChannelData(0);
                var fi = 0, c=0;
                while(fi<f32.length){
                    var sum=0, num=0;
                    var winEnd = Math.min(c*downsampleRate, f32.length)
                    while(fi<winEnd) {
                        sum += f32[fi]; num++; fi++;
                    }
                    i8[ii]=parseInt(sum/num*127); //127 for int8, 32767 for int16
                    ii++;c++;
                    if(ii==i8.length){
                        if(prefill>0) {
                            prefillList.push(new Uint8Array(i8.buffer)); prefill--;
                            if(prefill==0) prefillList.forEach(i=>{audioQueue.put_nowait(i)});
                        }
                        else audioQueue.put_nowait(new Uint8Array(i8.buffer));
                        i8=new Int8Array(bs);
                        ii=0;
                    }
                }
                if('closing'==that.redirectAudioState){
                    if(i8.filter(i=>i).length==0){ // no sound, now really stop streaming
                        if(prefill>0) prefillList.forEach(i=>audioQueue.put_nowait(i));
                        if(ii!=i8.length)audioQueue.put_nowait(new Uint8Array(i8.buffer));
                        audioQueue.put_nowait(new Uint8Array(bs)); // play a piece of empty sound
                        audioQueue.put_nowait(new StopIteration());
                        that.redirectAudioState='closed';
                    }
                }
            };
        }
    }
    stopRedirectAudio() {
        this.redirectAudioState ='closing';
        const engine = this.runtime.audioEngine;
        return this.speakerRPC.then(()=>{
            engine.inputNode.disconnect();
            this.scriptNode.disconnect();
            engine.inputNode.connect(engine.audioContext.destination);
        });
    }

    getInfo () {
        var _ = this._ = new _formatMessage(formatMessage.setup().locale,Scratch3RcuteAiAudioBlocks.EXTENSION_ID);
        return {
            id: Scratch3RcuteAiAudioBlocks.EXTENSION_ID,
            name: _('Robot Speech'),
            blockIconURI: blockIconURI,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'openMic',
                    text: _('turn microphone [MICONOFF]: [MIC]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MIC: {
                            type: ArgumentType.STRING,
                            menu: 'audioMenu'
                        },
                        MICONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'miconoffMenu'
                        }
                    }
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
                },'---',
                {
                    opcode: 'redirectAudio',
                    text: _("redirect audio to [SPEAKER]"),
                    blockType: BlockType.COMMAND,
                    branchCount: 1,
                    arguments: {
                        SPEAKER: {
                                type: ArgumentType.STRING,
                                menu: 'speakerMenu',
                            },
                    }
                },
            ],

            menus: {
                audioMenu: {
                    acceptReporters: true,
                    items: 'getConnectedPeripheralMicrophones'
                },
                speakerMenu: {
                    acceptReporters: true,
                    items: 'getConnectedPeripheralSpeakers'
                },
                miconoffMenu: {
                    acceptReporters: false,
                    items: [{text:_('on'),value:'on'},{text:_('off'),value:'off'}]
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
    redirectAudio(args, util){
        if(!util.stackFrame.redirectAudio){
            util.stackFrame.redirectAudio=true;
            this.redirectAudioRequest.push(0);
            if(this.redirectAudioRequest.length==1){
                this.startRedirectAudio(args.SPEAKER);
            }
            util.startBranch(1, true);
        }else{
            util.stackFrame.redirectAudio=false;
            this.redirectAudioRequest.pop();
            if(this.redirectAudioRequest.length==0){
                return this.stopRedirectAudio();
            }
        }
    }
    async arpc(...cmd){
        if (!scrlink.connected){
            scrlink.connect();
            await scrlink.waitOpen();
        }
        return scrlink.rpc(...cmd);
    }
    getConnectedPeripheral(def){
        var r = ['rcuteCozmars']
                        .map(i=>this.runtime.getPeripheralIsConnected(i)&&this.runtime.peripheralExtensions[i]._serial)
                        .filter(i=>i);
        return r.length?r:[{text:this._(def),value:null}];
    }
    getConnectedPeripheralMicrophones() {
        return this.getConnectedPeripheral('no available microphones');
    }
    getConnectedPeripheralSpeakers() {
        return this.getConnectedPeripheral('no available speakers');
    }
    async openMic({MICONOFF,MIC}){
        if(MIC){
            if(MICONOFF=='on'){
                if(!(this.wwdRPC && this.micSerial==MIC)){
                    this.micSerial = MIC;
                    this.wwdRPC= scrlink.rpc('mic',[this.micSerial]);
                    this.wwdRPC.catch(e=>{});
                    (async()=>{
                            for await (var rec of this.wwdRPC){
                                this.rec = rec;
                                this.rec.timestamp = Date.now();
                            }
                        })().catch(e=>{this.wwdRPC=this.rec=null;console.warn(e)});
                }
            }else if(MICONOFF=='off' && MIC==this.micSerial){
                this.wwdRPC && this.wwdRPC.cancel();
            }
        }
        await rutil.sleep(400);
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

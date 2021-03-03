const ArgumentType = require('../../../extension-support/argument-type');
const BlockType = require('../../../extension-support/block-type');
const log = require('../../../util/log');
const Cast = require('../../../util/cast');
const Color = require('../../../util/color');
const formatMessage = require('format-message');
const scrlink = require('../rcute-scrlink-ws');
const {Queue, StopIteration} = require('../wsmprpc.client');
const _formatMessage = require('../translate');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAFFklEQVR4Ae3BUY7jMAwFwe77H/rtZzBYkhFgRIhjVcnxaHI8mhyPJsejyfFocjyaHI8mx6PJ8WhyPJocjybHo8nxaHI8mhyPJsejyfFosi4cdyNvyHvhuDtpyHvhuDtpyCwcv0IKMgvHr5CCzMLxK6Qgs3D8CinILPTk+DahJwWZhZ4c3yb0pCCz0JPj24SeFGQWenJ8m9CTgsxCT45vE3pSkFnoyfFtQk8KMgs9qYXj06QWelKQWehJLRyfJrXQk4LMQk9q4fg0qYWeFGQWelILx6dJLfSkILPQk1o4Pk1qoScFmYWe1MLxaVILPSnILPSkFo5Pk1roSUFmoSe1cHya1EJPCjILPamF49OkFnpSkFnoSS0cnya10JOCzEJPamFFwhbKZQlbKIukFnpSkFnoSS2sSNhCuSxhC2WR1EJPCjILPamFFQlbKJclbKEsklroSUFmoSe1sCJhC+WyhC2URVILPSnILPSkFlYkbKFclrCFskhqoScFmYWe1MKKhC2UyxK2UBZJLfSkILPQk1pYkbCFclnCFsoiqYWeFGQWelILKxK2UC5L2EJZJLXQk4LMQk9qYUXCFsplCVsoi6QWelKQWehJLaxI2EK5LGELZZHUQk8KMgs9qYUVCVsolyVsoSySWuhJQWahJ7WwImEL5bKELZRFUgs9Kcgs9KQWViRsoVyWsIWySGqhJwWZhZ7UwoqELZTLErZQFkkt9KQgs9CTWliRsIVyWcIWyiKphZ4UZBZ6UgsrErZQLkvYQlkktdCTgsxCT2phRcIWymUJWyiLpBZ6UpBZ6EktrEjYQrksYQtlkdRCTwoyCz2phRUJWyiXJWyhLJJa6ElBZqEntbAiYQvlsoQtlEVSCz0pyCz0pBZWJGyhXJawhbJIaqEnBZmFntTCioQtlMsStlAWSS30pCCz0JNaWJGwhXJZwhbKIqmFnhRkFnpSCysStlAuS9hCWSS10JOCzEJPamFFwhbKZQlbKIukFnpSkFnoSS2sSNhCuSxhC2WR1EJPCjILPamF49OkFnpSkFnoSS0cnya10JOCzEJPauH4NKmFnhRkFnpSC8enSS30pCCz0JNaOD5NaqEnBZmFntTC8WlSCz0pyCz0pBaOT5Na6ElBZqEntXB8mtRCTwoyCz2phePTpBZ6UpBZ6MnxbUJPCjILPTm+TehJQWahJ8e3CT0pyCz05Pg2oScFmYWeHN8m9KQgs9CT49uEnhRkFnpyfJvQk4LMQk/uLfwl9xd6UpBZ6Mk9hffknkJPCjILPbmfsE7uJ/SkILPQk3sJ/5OX8D+5l9CTgsxCT+4j/CW98JfcR+hJQWahJ/cRXuS98CL3EXpSkFnoyT2Ev+S98JfcQ+hJQWahJ/cQXmRdeJF7CD0pyCz05B7Ci6wLL3IPoScFmYWe3EN4kXXhRe4h9KQgs9CT+wgv8l54kfsIPSnILPTkPsKLvBde5D5CTwoyCz25j/CX9MJfch+hJwWZhZ7cS/ifvIT/yb2EnhRkFnpyP2Gd3E/oSUFmoSf3FN6Tewo9Kcgs9OTewl9yf6EnBZmFnhzfJvSkILPQk+PbhJ4UZBZ6cnyb0JOCzEJPjm8TelKQWejJ8W1CTwoyCz05vk3oSUFm4fgVUpBZOH6FFGQWjl8hBZmF41dIQd4Lx91JQ94Lx91JQ9aF427kDTkeTY5Hk+PR5Hg0OR5NjkeT49HkeDQ5Hk2OR5Pj0eR4NDkeTY5Hk+PR5Hi0fw4SYZBuTUHjAAAAAElFTkSuQmCC';

async function checkAsync(promise,util){
    var p =util && util.getParam('rcute-run-async');
    // let opcode;
    // if(p){
        // var block = util.target.blocks.getBlock(util.thread.peekStack());
        // opcode = block && block.opcode;
        // if(p[block.opcode]){
        //     throw 'cannot put same blocks inside "run asynchronously" block';
        // }
    // }
    if(p){p.push(promise);
        // p[opcode]=promise;
    }else{
        await promise;
    }
}

class Cozmars {

    constructor (runtime, extensionId) {
        this._runtime = runtime;
        this._extensionId = extensionId;
        runtime.registerPeripheralExtension(extensionId, this);
        this.sensors = {};
        this.motorSpeed=[0,0];
    }

    // called by runtime
    scan () {
        if (!scrlink.connected) scrlink.connect();
        scrlink.waitOpen().then(()=>{scrlink.requestPeripheral('rcute-cozmars-????', '_ws._tcp.local.', this)});
    }

    // called by runtime
    connect (serial) {
        scrlink.connectPeripheral('AioRobot("'+serial.split('-')[2]+'")', serial, this)
        .then(()=>{
            this.scmd('cozmars.get_animation_list()').then(l=>{this.animationList=l});
            this.scmd('cozmars.eyes.get_expression_list()').then(l=>{this.expressionList=l});
            (async ()=>{
                var rpc =scrlink.rpc('peripheral_event',[serial]);
                rpc.catch(e=>{});
                for await (var [ev,value] of rpc){
                    if(ev=='pressed'&&!value)this.sensors.long_pressed=this.sensors.double_pressed=false;
                    else if(ev=='double_pressed')this.sensors.pressed=true;
                    this.sensors[ev] = value;
                }
            })().catch(e=>{if(e.name!='RPCError')throw e;});
        });
    }

    // called by runtime
    disconnect() {
        scrlink.disconnectPeripheral(this);
    }

    // called by runtime
    isConnected () {
        return this._serial;
    }

    async scmd(cmd, util) {
        return await checkAsync(scrlink.rpc('scmd', [cmd.replace('cozmars.', `lv["${this._serial}"].`)]), util);
    }
}


class Scratch3RcuteCozmarsBlocks {

    static get EXTENSION_NAME () {
        return 'Cozmars';
    }
    static get EXTENSION_ID () {
        return 'rcuteCozmars';
    }

    constructor (runtime) {
        this.runtime = runtime;
        this.cozmars = new Cozmars(this.runtime, Scratch3RcuteCozmarsBlocks.EXTENSION_ID);
    }

    getInfo () {
        var _ = this._ = new _formatMessage(formatMessage.setup().locale, Scratch3RcuteCozmarsBlocks.EXTENSION_ID);
        return {
            id: Scratch3RcuteCozmarsBlocks.EXTENSION_ID,
            name: Scratch3RcuteCozmarsBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'serial',
                    text: "Cozmars ID",
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'animate',
                    text: _('animate [ANIM]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ANIM: {
                            type: ArgumentType.STRING,
                            menu: 'animationMenu'
                        }
                    }
                },'---',
                {
                    opcode: 'setEyeColor',
                    text: _('set eye color [COLOR]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#00ffff'
                        }
                    }
                },
                {
                    opcode: 'setEyeExpression',
                    text: _('set expression [EXP]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        EXP: {
                            type: ArgumentType.STRING,
                            menu: 'expressionMenu'
                        }
                    }
                },
                {
                    opcode: 'setScreenBrightness',
                    text: _('set screen brightness to [VALUE]%, fade speed [SPEED]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            menu: 'speedMenu',
                            defaultValue: 1
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'displayText',
                    text: _('display [TXT] on screen, size [SIZE], [COLOR]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TXT: {
                            type: ArgumentType.STRING,
                            defaultValue: _("I'm Cozmars")
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 30
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#00ffff'
                        }
                    }
                },'---',
                {
                    opcode: 'setHeadAngle',
                    text: _('set head angle [VALUE], speed [SPEED]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            menu: 'speedMenu',
                            defaultValue: 1
                        },
                        VALUE: {
                            type: ArgumentType.ANGLE,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setLiftHeight',
                    text: _('set lift height [VALUE]%, speed [SPEED]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            menu: 'speedMenu',
                            defaultValue: 1
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'go',
                    text: _('[DIR] for [SEC] seconds'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DIR: {
                            type: ArgumentType.STRING,
                            menu: 'goDirMenu',
                        },
                        SEC: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                },
                {
                    opcode: 'setMotorSpeed',
                    text: _('motor speed: left [L]%, right [R]%'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        L: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50,
                        },
                        R: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50,
                        },
                    }
                },
                {
                    opcode: 'stop',
                    text: _('stop'),
                    blockType: BlockType.COMMAND,
                },'---',
                {
                    opcode: 'say',
                    text: _('say [TXT]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TXT: {
                            type: ArgumentType.STRING,
                            defaultValue: _('hello, world')
                        },
                    }
                },
                {
                    opcode: 'redirectAudio',
                    text: _("redirect audio to Cozmars' speaker"),
                    blockType: BlockType.COMMAND,
                    branchCount: 1,
                },'---',
                {
                    opcode: 'whenButtonState',
                    text: _('when button is [STATE]'),
                    func: 'isButtonState',
                    blockType: BlockType.HAT,
                    arguments: {
                        STATE: {
                            type: ArgumentType.STRING,
                            menu: 'buttonStateMenu'
                        }
                    }
                },
                {
                    opcode: 'isButtonState',
                    text: _('is button [STATE]'),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        STATE: {
                            type: ArgumentType.STRING,
                            menu: 'buttonStateMenu'
                        }
                    }
                },
                {
                    opcode: 'whenIrState',
                    text: _("when [LR] infrared sensor reads [ONEZERO]"),
                    func: 'isIrState',
                    blockType: BlockType.HAT,
                    arguments: {
                        ONEZERO: {
                            type: ArgumentType.STRING,
                            menu: 'oneZeroMenu'
                        },
                        LR: {
                            type: ArgumentType.STRING,
                            menu: 'leftRightMenu'
                        }
                    }
                },
                {
                    opcode: 'isIrState',
                    text: _("[LR] infrared sensor reads [ONEZERO] ?"),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        ONEZERO: {
                            type: ArgumentType.NUMBER,
                            menu: 'oneZeroMenu'
                        },
                        LR: {
                            type: ArgumentType.STRING,
                            menu: 'leftRightMenu'
                        }
                    }
                },
                {
                    opcode: 'whenSonarDistanceRange',
                    text: _("when sonar distance reading is [GL] [DIST] cm"),
                    blockType: BlockType.HAT,
                    arguments: {
                        GL: {
                            type: ArgumentType.STRING,
                            menu: 'greaterLessMenu'
                        },
                        DIST: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'getSonarDistance',
                    text: _("sonar reading (cm)"),
                    blockType: BlockType.REPORTER,
                },'---',
                {
                    opcode: 'runAsync',
                    blockType: BlockType.COMMAND,
                    branchCount: 1,
                    isTerminal: false,
                    blockAllThreads: false,
                    text: _('run asynchronously'),
                },
            ],

            menus: {
                buttonStateMenu: ['pressed', 'released', 'double pressed', 'long pressed'].map(i=>({text:_(i),value:i.replace(' ','_')})),
                oneZeroMenu: ['1', '0'],
                leftRightMenu: [{text: _('left'), value:'l'}, {text:_('right'),value:'r'}],
                greaterLessMenu: ['>','<'],
                speedMenu: [{text: _('fast'),value:0}, {text: _('medium'),value:1}, {text: _('slow'),value:2}],
                expressionMenu: {
                    acceptReporters: false,
                    items: 'getExpressionMenu'
                },
                animationMenu: {
                    acceptReporters: false,
                    items: 'getAnimationMenu'
                },
                goDirMenu: ['forward','backward','turn left','turn right'].map(i=>({text:_(i),value:i.replace(' ','_')})),
            }
        };
    }
    runAsync(args,util) {
        var p = util.getParam('rcute-run-async');
        if(p) {
            util.pushParam('rcute-run-async', null);
            return Promise.allSettled(Object.values(p)).then(r=>{});
        }else{
            util.initParams();
            util.pushParam('rcute-run-async', []);//{});
            util.startBranch(1, true);
        }
    }
    redirectAudio(args, util){
        const engine = this.runtime.audioEngine;
        let {audioQueue,speakerRPC,scriptNode,prefillList} =util.stackFrame;
        var prefill = 5;
        var bs = 1600;
        if (!audioQueue){
            var op = {dtype:'int8', sample_rate:16000, block_duration:0.1};
            audioQueue = util.stackFrame.audioQueue = new Queue(0);
            util.stackFrame.speakerRPC= scrlink.rpc('speaker', [this.cozmars._serial, op], request_stream=audioQueue);
            engine.inputNode.disconnect();
            scriptNode = util.stackFrame.scriptNode = engine.audioContext.createScriptProcessor(4096,1,1);
            engine.inputNode.connect(scriptNode);
            scriptNode.connect(engine.audioContext.destination);
            var downsampleRate = engine.audioContext.sampleRate/op.sample_rate;
            var ii=0, i8 = new Int8Array(bs);
            prefillList = [];
            util.stackFrame.redirectAudioState = 'open';
            scriptNode.onaudioprocess = evt=> { // downsample and convert to int8
                if(util.stackFrame.redirectAudioState=='closed')return;
                var f32 = evt.inputBuffer.getChannelData(0);
                var fi = 0;
                var c=0;
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
                if('closing'==util.stackFrame.redirectAudioState){
                    if(i8.filter(i=>i).length==0){ // no sound, now really stop streaming
                        if(prefill>0) prefillList.forEach(i=>audioQueue.put_nowait(i));
                        if(ii!=i8.length)audioQueue.put_nowait(new Uint8Array(i8.buffer));
                        audioQueue.put_nowait(new Uint8Array(bs)); // play a piece of empty sound
                        audioQueue.put_nowait(new StopIteration());
                        util.stackFrame.redirectAudioState='closed';
                    }
                }
            };
            util.startBranch(1,true);
        }else{
            util.stackFrame.redirectAudioState ='closing';
            util.stackFrame.audioQueue = util.stackFrame.speakerRPC= util.stackFrame.scriptNode= null;
            return speakerRPC.then(()=>{
                engine.inputNode.disconnect();
                scriptNode.disconnect();
                engine.inputNode.connect(engine.audioContext.destination);
            });
        }
    }
    getExpressionMenu(){
        return (this.expressionList||['auto', 'happy', 'sad', 'surprised', 'angry', 'neutral', 'focused', 'sleepy']).map(i=>({text:this._(i),value:i}))
    }
    getAnimationMenu(){
        return (this.animationList||['pick up cube']).map(i=>({text:this._(i),value:i}));
    }
    async animate({ANIM},util) {
        if(util.getParam('rcute-run-async')) throw "cannot run animate block asynchronously";
        await this.cozmars.scmd(`await cozmars.animate("${ANIM}")`);
    }
    async displayText({TXT,SIZE,COLOR}, util){
        await this.cozmars.scmd(`await cozmars.screen.text("${TXT}",size=${Cast.toNumber(SIZE)},color="${Color.rgbToHex(Cast.toRgbColorObject(COLOR))}")`,util)
    }
    async setScreenBrightness({VALUE,SPEED}, util){
        await this.cozmars.scmd(`await cozmars.screen.set_brightness(${Math.clamp(Cast.toNumber(VALUE)/100,0,1)},fade_speed=${['None',0.6,0.2][SPEED]})`, util);
    }
    async setEyeColor ({COLOR}, util) {
        await this.cozmars.scmd(`await cozmars.eyes.color("${Color.rgbToHex(Cast.toRgbColorObject(COLOR))}")`, util);
    }
    async setEyeExpression({EXP}, util) {
        await this.cozmars.scmd(`await cozmars.eyes.expression("${EXP}")`, util);
    }
    async setLiftHeight({VALUE,SPEED}, util) {
        await this.cozmars.scmd(`await cozmars.lift.set_height(${Math.clamp(Cast.toNumber(VALUE)/100,0,1)},speed=${['None',2,1][Cast.toNumber(SPEED)]})`, util);
    }
    async setHeadAngle({VALUE,SPEED}, util) {
        await this.cozmars.scmd(`await cozmars.head.set_angle(${Math.clamp(VALUE,-30,30)},speed=${['None',120,60][Cast.toNumber(SPEED)]})`, util);
    }
    async setMotorSpeed({L,R}, util) {
        await this.cozmars.scmd(`await cozmars.motor.speed((${Math.clamp(Cast.toNumber(L)/100,-1,1)},${Math.clamp(Cast.toNumber(R)/100,-1,1)}))`, util);
    }
    async go({DIR,SEC},util){
        await this.cozmars.scmd(`await cozmars.${DIR}(${Cast.toNumber(SEC)})`,util);
    }
    async stop(args, util){
        if(util.getParam('rcute-run-async')) throw "cannot run stop block asynchronously";
        await this.cozmars.scmd('await cozmars.stop()');
    }
    async say({TXT}, util) {
        await this.cozmars.scmd(`await cozmars.say("${TXT}")`, util);
    }
    isButtonState({STATE}){
        if(STATE=='released') return !this.cozmars.sensors.pressed;
        return this.cozmars.sensors[STATE];
    }
    isIrState({LR, ONEZERO}) {
        return this.cozmars.sensors[`${LR}ir`]==Cast.toNumber(ONEZERO);
    }
    getSonarDistance() {
        return this.cozmars.sensors['sonar']*100;
    }
    whenSonarDistanceRange({GL,DIST}) {
        return GL=='>'?this.getSonarDistance()>DIST:this.getSonarDistance()<DIST;
    }
    serial(){return this.cozmars._serial}
}

module.exports = Scratch3RcuteCozmarsBlocks;

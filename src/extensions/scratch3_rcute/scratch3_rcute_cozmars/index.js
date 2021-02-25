const ArgumentType = require('../../../extension-support/argument-type');
const BlockType = require('../../../extension-support/block-type');
const log = require('../../../util/log');
const Cast = require('../../../util/cast');
const Color = require('../../../util/color');
const formatMessage = require('format-message');
const scrlink = require('../rcute-scrlink-ws');
const _formatMessage = require('../translate');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';

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

    scmd(cmd) {return scrlink.rpc('scmd', [cmd.replace('cozmars.', `lv["${this._serial}"].`)])}
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
                    opcode: 'animate',
                    text: _('animate [ANIM]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ANIM: {
                            type: ArgumentType.STRING,
                            menu: 'animationMenu'
                        }
                    }
                },
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
                },
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
                    opcode: 'setMotorSpeed',
                    text: _('set [LR] motor speed to [VALUE]%'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LR: {
                            type: ArgumentType.STRING,
                            menu: 'leftRightMenu',
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'stop',
                    text: _('stop'),
                    blockType: BlockType.COMMAND,
                },
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
                },
                {
                    opcode: 'serial',
                    text: _("Cozmars' camera"),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'micSerial',
                    func:'serial',
                    text: _("Cozmars' microphone"),
                    blockType: BlockType.REPORTER,
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
            }
        };
    }
    getExpressionMenu(){
        return (this.expressionList||['auto', 'happy', 'sad', 'surprised', 'angry', 'neutral', 'focused', 'sleepy']).map(i=>({text:this._(i),value:i}))
    }
    getAnimationMenu(){
        return (this.animationList||['pick up cube']).map(i=>({text:this._(i),value:i}));
    }
    async animate({ANIM}) {
        await this.cozmars.scmd(`await cozmars.animate("${ANIM}")`);
    }
    async displayText({TXT,SIZE,COLOR}){
        await this.cozmars.scmd(`await cozmars.screen.text("${TXT}",size=${Cast.toNumber(SIZE)},color="${Color.rgbToHex(Cast.toRgbColorObject(COLOR))}")`)
    }
    async setScreenBrightness({VALUE,SPEED}){
        await this.cozmars.scmd(`await cozmars.screen.set_brightness(${Cast.toNumber(VALUE)/100},fade_speed=${['None',0.6,0.2][SPEED]})`);
    }
    async setEyeColor ({COLOR}) {
        await this.cozmars.scmd(`await cozmars.eyes.color("${Color.rgbToHex(Cast.toRgbColorObject(COLOR))}")`);
    }
    async setEyeExpression({EXP}) {
        await this.cozmars.scmd(`await cozmars.eyes.expression("${EXP}")`);
    }
    async setLiftHeight({VALUE,SPEED}) {
        await this.cozmars.scmd(`await cozmars.lift.set_height(${VALUE/100},speed=${['None',2,1][Cast.toNumber(SPEED)]})`);
    }
    async setHeadAngle({VALUE,SPEED}) {
        await this.cozmars.scmd(`await cozmars.head.set_angle(${VALUE},speed=${['None',80,30][Cast.toNumber(SPEED)]})`);
    }
    async setMotorSpeed({LR,VALUE}) {        
        this.cozmars.motorSpeed[LR=='l'?0:1]=Cast.toNumber(VALUE)/100;
        await this.cozmars.scmd(`await cozmars.motor.speed((${this.cozmars.motorSpeed[0]},${this.cozmars.motorSpeed[1]}))`);
    }
    async stop(){
        await this.cozmars.scmd('await cozmars.stop()');
    }
    async say({TXT}) {
        await this.cozmars.scmd(`await cozmars.say("${TXT}")`);
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

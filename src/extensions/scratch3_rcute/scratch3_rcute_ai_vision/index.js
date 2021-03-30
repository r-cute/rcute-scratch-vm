const ArgumentType = require('../../../extension-support/argument-type');
const BlockType = require('../../../extension-support/block-type');
const log = require('../../../util/log');
const Cast = require('../../../util/cast');
const formatMessage = require('format-message');
const scrlink = require('../rcute-scrlink-ws');
const _formatMessage = require('../translate');
const Video = require('../../../io/video');
const VideoProvider = require('./video-provider');
const rutil = require('../util');
/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';


class Scratch3RcuteAiVisionBlocks {

    static get EXTENSION_ID () {
        return 'rcuteAiVision';
    }

    constructor (runtime) {
        this.runtime = runtime;
        this.videoTransparency = 0;
        this.memorizedFaces=new Set();
    }

    getInfo () {
        var _ = this._ = new _formatMessage(formatMessage.setup().locale,Scratch3RcuteAiVisionBlocks.EXTENSION_ID);
        propMenu= [{text:_('center x'),value:'0'},
                            {text:_('center y'),value:'1'},
                            {text:_('width'),value:'2'},
                            {text:_('height'),value:'3'},
                            {text:_('size'),value:'size'},
                        ];
        return {
            id: Scratch3RcuteAiVisionBlocks.EXTENSION_ID,
            name: _('Robot Vision'),
            blockIconURI: blockIconURI,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'openCamera',
                    text: _('turn camera [CAMONOFF]: [CAM]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CAM: {
                            type: ArgumentType.STRING,
                            menu: 'videoMenu'
                        },
                        CAMONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'camonoffMenu'
                        }
                    }
                },
                {
                    opcode: 'pauseVideo',
                    text: _('[ONOFF] video'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'pauseMenu'
                        },
                    }
                },
                {
                    opcode: 'setVideoTransparency',
                    text: _('set video transparency to [TRANSPARENCY]%'),
                    arguments: {
                        TRANSPARENCY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },'---',
                {
                    opcode: 'facRec',
                    text: _('[ONOFF] face recognition'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'onoffMenu'
                        }
                    }
                },
                {
                    opcode: 'memorizeFace',
                    text: _('memorize current face as [NAME]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: _('Mike')
                        }
                    }
                },
                {
                    opcode: 'forgetFace',
                    text: _("forget [NAME]'s face"),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'faceNameMenu'
                        }
                    }
                },
                {
                    opcode: 'getFaceProp',
                    text: _('face [PROP]'),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PROP: {
                            type: ArgumentType.STRING,
                            menu: 'facePropMenu'
                        }
                    }
                },'---',
                {
                    opcode: 'qrRec',
                    text: _('[ONOFF] QR code recognition'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'onoffMenu'
                        }
                    }
                },
                {
                    opcode: 'getQrProp',
                    text: _('QR code [PROP]'),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PROP: {
                            type: ArgumentType.STRING,
                            menu: 'qrPropMenu'
                        }
                    }
                },'---',
                {
                    opcode: 'objRec',
                    text: _('[ONOFF] object recognition'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'onoffMenu'
                        }
                    }
                },
                {
                    opcode: 'getObjProp',
                    text: _('object [PROP]'),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PROP: {
                            type: ArgumentType.STRING,
                            menu: 'objPropMenu'
                        }
                    }
                },

            ],

            menus: {
                videoMenu: {
                    acceptReporters: true,
                    items: 'getConnectedPeripheralCameras'
                },
                camonoffMenu: {
                    acceptReporters: false,
                    items: [{text:_('on'),value:'on'},{text:_('off'),value:'off'},{text:_('on flipped'),value:'on-flipped'}]
                },
                pauseMenu: {
                    acceptReporters: false,
                    items: [{text:_('pause'),value:'on'},{text:_('resume'),value:'off'}]
                },
                onoffMenu: {
                    acceptReporters: false,
                    items: [{text:_('start'),value:'on'},{text:_('stop'),value:'off'}]
                },
                facePropMenu: {
                    acceptReporters: false,
                    items: [{text:_('name'),value:'content'},].concat(propMenu)
                },
                objPropMenu: {
                    acceptReporters: false,
                    items: [{text:_('object'),value:'content'},].concat(propMenu)
                },
                qrPropMenu: {
                    acceptReporters: false,
                    items: [{text:_('content'),value:'content'},]//.concat(propMenu)
                },
                faceNameMenu: {
                    acceptReporters: true,
                    items: 'getFacesInMemory'
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
    getConnectedPeripheralCameras() {
        var r = ['rcuteCozmars']
                        .map(i=>this.runtime.getPeripheralIsConnected(i)&&this.runtime.peripheralExtensions[i]._serial)
                        .filter(i=>i);
        return r.length?r:[{text:this._('no available cameras'),value:null}];
    }
    setVideoTransparency (args) {
        this.videoTransparency = Cast.toNumber(args.TRANSPARENCY);
        this.video.setPreviewGhost(this.videoTransparency);
    }
    async pauseVideo({ONOFF}){
        await this.videoProvider.videoSettings('pause','on'==ONOFF);
    }
    async openCamera ({CAMONOFF,CAM}) {
        if(CAM){
            if(CAMONOFF.indexOf('on')!=-1){
                this.runtime.ioDevices.video.disableVideo();
                if(!this.video){
                    this.video = new Video(this.runtime);
                    this.videoProvider = new VideoProvider();
                    this.video.setProvider(this.videoProvider);
                }
                this.video.mirror = CAMONOFF=='on-flipped';
                this.video.setPreviewGhost(this.videoTransparency);
                if(this.videoProvider.camSerial!=CAM){
                    this.video.disableVideo();
                    this.videoProvider.setCamSerial(CAM);
                }
                this.video.enableVideo();
            }else if(CAMONOFF=='off'){
                this.video && this.video.disableVideo();
            }
        }
        await rutil.sleep(400);
    }
    async facRec({ONOFF}){
        await (ONOFF=='on'?
            this.arpc('add_video_processor',['face','FaceRecognizer()','recognize','annotate'])
            :this.arpc('rm_video_processor', ['face']));
    }
    getFaceProp({PROP}){
        const r=this.videoProvider.rec && this.videoProvider.rec.face;
        if(!(r && r[0] && r[0].length))return '';
        [loc,content] = r;
        switch(PROP){
            case 'content':return content[0];
            case 'size':return loc[0][2]*loc[0][3];
            default: return loc[0][PROP];
        }
    }
    async memorizeFace({NAME}){
        await this.arpc('scmd',[`lv["face"].memorize("${NAME}",lastimg)`]);
        this.memorizedFaces.add(NAME);
    }
    async forgetFace({NAME}){
        await this.arpc('scmd',[`lv["face"].forget("${NAME}")`]);
        this.memorizedFaces.delete(NAME);
    }
    getFacesInMemory(){
        return this.memorizedFaces.size? [...this.memorizedFaces]:[this._('Mike')]
    }
    async qrRec({ONOFF}){
        await (ONOFF=='on'?
            this.arpc('add_video_processor',['qr','QRCodeRecognizer()','recognize','annotate'])
            :this.arpc('rm_video_processor', ['qr']));
    }
    getQrProp({PROP}){
        const r=this.videoProvider.rec && this.videoProvider.rec.qr;
        if(!(r && r.length))return '';
        [loc,content] = r;
        switch(PROP){
            case 'content':return content;
            case 'size':return loc[2]*loc[3];
            default: return loc[PROP];
        }
    }
    async objRec({ONOFF}){
        await (ONOFF=='on'?
            this.arpc('add_video_processor',['obj','ObjectRecognizer()','recognize','annotate'])
            :this.arpc('rm_video_processor', ['obj']));
    }
    getObjProp({PROP}){
        const r=this.videoProvider.rec && this.videoProvider.rec.obj;
        if(!(r && r[0] && r[0].length))return '';
        [loc,content] = r;
        switch(PROP){
            case 'content':return content[0];
            case 'size':return loc[0][2]*loc[0][3];
            default: return loc[0][PROP];
        }
    }
}

module.exports = Scratch3RcuteAiVisionBlocks;

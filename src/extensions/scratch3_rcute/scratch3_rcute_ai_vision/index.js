const ArgumentType = require('../../../extension-support/argument-type');
const BlockType = require('../../../extension-support/block-type');
const log = require('../../../util/log');
const Cast = require('../../../util/cast');
const formatMessage = require('format-message');
const scrlink = require('../rcute-scrlink-ws');
const _formatMessage = require('../translate');
const Video = require('../../../io/video');
const VideoProvider = require('./video-provider');
/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';


class Scratch3RcuteAiVisionBlocks {

    static get EXTENSION_NAME () {
        return '图像识别';
    }
    static get EXTENSION_ID () {
        return 'rcuteAiVision';
    }
    
    constructor (runtime) {
        this.runtime = runtime;
        this.videoTransparency = 0;
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
            name: Scratch3RcuteAiVisionBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'openCamera',
                    text: _('open camera [CAM]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CAM: {
                            type: ArgumentType.STRING,
                            menu: 'videoMenu'
                        }
                    }
                },
                {
                    opcode: 'closeCamera',
                    text: _('close camera'),
                    blockType: BlockType.COMMAND,
                },
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
                    opcode: 'getFaceProp',
                    text: _('face [PROP]'),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PROP: {
                            type: ArgumentType.STRING,
                            menu: 'facePropMenu'
                        }
                    }
                },
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
                },
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
                {
                    opcode: 'setVideoTransparency',
                    text: _('set video transparency to [TRANSPARENCY]%'),
                    arguments: {
                        TRANSPARENCY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                }
            ],
            
            menus: {
                videoMenu: {
                    acceptReporters: true,
                    items: 'getConnectedPeripheralCameras'
                },
                onoffMenu: {
                    acceptReporters: false,
                    items: [{text:_('start'),value:'on'},{text:_('stop'),value:'off'}]
                },
                facePropMenu: {
                    acceptReporters: false,
                    items: propMenu.concat([{text:_('name'),value:'content'},])
                },
                objPropMenu: {
                    acceptReporters: false,
                    items: propMenu.concat([{text:_('object'),value:'content'},])
                },
                qrPropMenu: {
                    acceptReporters: false,
                    items: propMenu.concat([{text:_('content'),value:'content'},])
                },               
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
    openCamera ({CAM}) {
        this.runtime.ioDevices.video.disableVideo();
        if(!CAM)return;
        if(!this.video){
            this.video = new Video(this.runtime);
            this.videoProvider = new VideoProvider();
            this.video.setProvider(this.videoProvider);
        }
        if(this.videoProvider.camSerial!=CAM){
            this.videoProvider.setCamSerial(CAM);
            this.video.disableVideo();
        }
        this.video.setPreviewGhost(this.videoTransparency);
        this.video.enableVideo();
    }
    closeCamera () {
        this.video && this.video.disableVideo();
    }
    async facRec({ONOFF}){
        await (ONOFF=='on'?
            this.arpc('add_video_processor',['face','FaceRecognizer()','recognize','annotate'])
            :this.arpc('rm_video_processor', ['face']));
    }
    getFaceProp({PROP}){
        const r=this.videoProvider.rec.face;
        if(!(r && r[0] && r[0].length))return null;
        [loc,content] = r;
        switch(PROP){
            case 'content':return content[0];
            case 'size':return loc[0][2]*loc[0][3];
            default: return loc[0][PROP];
        }
    }
    async qrRec({ONOFF}){
        await (ONOFF=='on'?
            this.arpc('add_video_processor',['qr','QRCodeRecognizer()','recognize','annotate'])
            :this.arpc('rm_video_processor', ['qr']));
    }
    getQrProp({PROP}){
        const r=this.videoProvider.rec.qr;
        if(!(r && r[0] && r[0].length))return null;
        [loc,content] = r;
        switch(PROP){
            case 'content':return content[0];
            case 'size':return loc[0][2]*loc[0][3];
            default: return loc[0][PROP];
        }
    }
    async objRec({ONOFF}){
        await (ONOFF=='on'?
            this.arpc('add_video_processor',['obj','ObjectRecognizer()','recognize','annotate'])
            :this.arpc('rm_video_processor', ['obj']));
    }
    getObjProp({PROP}){
        const r=this.videoProvider.rec.obj;
        if(!(r && r[0] && r[0].length))return null;
        [loc,content] = r;
        switch(PROP){
            case 'content':return content[0];
            case 'size':return loc[0][2]*loc[0][3];
            default: return loc[0][PROP];
        }
    }
}

module.exports = Scratch3RcuteAiVisionBlocks;

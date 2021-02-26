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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAFdUlEQVR4Ae3BwYEkSQzEMNJ/o+McUGjuoc9mFyCfnyafnyafnyafnyafnyafnyafnyb/X/j8a+QP8rfw+ddJIX8Ln3+dFLILn1fIQHbh8woZyC58XiED2YXPK2Qgu9DJjdDJO0InN0InA9mFTm6ETt4ROrkROhnILnRyI3TyjtDJjdDJQHahkxuhk3eETm6ETgayC53cCJ28I3RyI3QykF3o5Ebo5B2hkxuhk4HsQic3QifvCJ3cCJ0MZBc6uRE6eUfo5EboZCC70MmN0Mk7Qic3QicD2YVOboRO3hE6uRE6GcgudHIjdPKO0MmN0MlAdqGTG6GTd4ROboROBrILndwInbwjdHIjdDKQXejkRujkHaGTG6GTgexCJzdCJ+8IndwInQxkFzq5ETp5R+jkRuhkILvQyY3QyTtCJzdCJwPZhU5uhE7eETq5EToZyC58XiED2YXPK2Qgu/B5hQxkFz6vkIHswucVMpBd+LxCBrILn1fIQHahkxuhk3eETm6ETgayC53cCJ28I3RyI3QykF3o5Ebo5B2hkxuhk4HsQic3QifvCJ3cCJ0MZBc6uRE6eUfo5EboZCC70MmN0Mk7Qic3QicD2YVOboRO3hE6uRE6GcgudHIjdPKO0MmN0MlAdqGTG6GTd4ROboROBrILndwInbwjdHIjdDKQXejkRujkHaGTG6GTgexCJzdCJ+8IndwInQxkFzq5ETp5R+jkRuhkILvQyY3QyTtCJzdCJwPZhU5uhE7eETq5EToZyC50ciN08o7QyY3QyUB2oZMboZN3hE5uhE4Gsgud3AidvCN0ciN0MpBd6ORG6OQdoZMboZOB7EInN0In7wid3AidDGQXOrkROnlH6ORG6GQgu9DJjdDJO0InN0InA9mFTm6ETt4ROrkROhnILnRyI3TyjtDJjdDJQHahkxuhk3eETm6ETgayC53cCJ28I3RyI3QykF3o5Ebo5B2hkxuhk4HsQic3QifvCJ3cCJ0MZBc6uRE6eUfo5EboZCC70MmN0Mk7Qic3QicD2YVOboRO3hE6uRE6GcgudHIjdPKO0MmN0MlAdqGTG6GTd4ROboROBrILndwInbwjdHIjdDKQXejkRujkHaGTG6GTgexCJzdCJ+8IndwInQxkFzq5ETp5R+jkRuhkILvQyY3QyTtCJzdCJwPZhU5uhE7eETq5EToZyC50ciN08o7QyY3QyUB2oZMboZN3hE5uhE4Gsgud3AidvCN0ciN0MpBd6ORG6OQdoZMboZOB7EInN0In7wid3AidDGQXOrkROnlH6ORG6GQgu9DJjdDJO0InN0InA9mFTm6ETt4ROrkROhnILnRyI3TyjtDJjdDJQHahkxuhk3eETm6ETgayC53cCJ28I3RyI3QykF3o5Ebo5B2hkxuhk4HswucVMpBd+LxCBrILn1fIQHbh8woZyC58XiED2YXPK2Qgu/B5hQxkFzq5ETp5R+jkRuhkILvQyY3QyTtCJzdCJwPZhU5uhE7eETq5EToZyC50ciN08o7QyY3QyUB2oZMboZN3hE5uhE4Gsgud3AidvCN0ciN0MpBd6ORG6OQdoZMboZOB7EInN0In7wid3AidDGQXOrkROnlH6ORG6GQgu9DJjdDJO0InN0InA9mFTm6ETt4ROrkROhnILnRyI3TyjtDJjdDJQHahkxuhk3eETm6ETgayC53cCJ28I3RyI3QykF3o5Ebo5B2hkxuhk4HsQic3QifvCJ3cCJ0MZBc6uRE6eUfo5EboZCC70MmN0Mk7Qic3QicD2YXPK2Qgu/B5hQxkFz6vkIHswucVMpC/hc+/Tgr5W/j866SQ/y98/jXyB/n8NPn8NPn8NPn8NPn8NPn8tP8Aeqt4kGGrg3kAAAAASUVORK5CYII=';

class Cube {

    constructor (runtime, extensionId) {
        this._runtime = runtime;
        this._extensionId = extensionId;
        runtime.registerPeripheralExtension(extensionId, this);
    }

    // called by runtime
    scan () {
        if (!scrlink.connected) scrlink.connect();
        scrlink.waitOpen().then(()=>{scrlink.requestPeripheral('rcute-cube-????', '_ws._tcp.local.', this)});
    }

    // called by runtime
    connect (serial) {
        scrlink.connectPeripheral('AioCube("'+serial.split('-')[2]+'")', serial, this)
        .then(()=>{
            (async ()=>{
                var rpc=scrlink.rpc('peripheral_event',[serial]);
                rpc.catch(e=>{});
                for await (var ev of rpc){
                    this.lastAction = ev;
                    if(ev[0]=='static') this.scmd('await cube.guess_top_face()').then(a=>{this.topFace=a})
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

    scmd(cmd) {return scrlink.rpc('scmd', [cmd.replace('cube.', `lv["${this._serial}"].`)])}
}


class Scratch3RcuteCubeBlocks {

    static get EXTENSION_NAME () {
        return '魔方';
    }
    static get EXTENSION_ID () {
        return 'rcuteCube';
    }

    constructor (runtime) {
        this.runtime = runtime;
        this.cube = new Cube(this.runtime, Scratch3RcuteCubeBlocks.EXTENSION_ID);
    }

    getInfo () {
        var _ = new _formatMessage(formatMessage.setup().locale, Scratch3RcuteCubeBlocks.EXTENSION_ID);
        return {
            id: Scratch3RcuteCubeBlocks.EXTENSION_ID,
            name: Scratch3RcuteCubeBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'setLedColor',
                    text: _('set led color [COLOR]'),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                        }
                    }
                },
                {
                    opcode: 'whenState',
                    text: _('when [STATE]'),
                    blockType: BlockType.HAT,
                    arguments: {
                        STATE: {
                            type: ArgumentType.STRING,
                            menu: 'noArgStateMenu'
                        }
                    }
                },
                {
                    opcode: 'whenStateDir',
                    text: _('when [STATE], direction [DIR]'),
                    blockType: BlockType.HAT,
                    arguments: {
                        STATE: {
                            type: ArgumentType.STRING,
                            menu: 'argStateMenu'
                        },
                        DIR: {
                            type: ArgumentType.STRING,
                            menu: 'dirMenu'
                        }
                    }
                },
                {
                    opcode: 'whenFlipped',
                    text: _('when flipped [DEG] degrees'),
                    blockType: BlockType.HAT,
                    arguments: {
                        DEG: {
                            type: ArgumentType.STRING,
                            menu: 'flipDegMenu'
                        }
                    }
                },
                {
                    opcode: 'whenRotated',
                    text: _('when rotated, direction [DIR]'),
                    blockType: BlockType.HAT,
                    arguments: {
                        DIR: {
                            type: ArgumentType.STRING,
                            menu: 'rotateDirMenu'
                        }
                    }
                },
                {
                    opcode: 'topFace',
                    text: _('top face'),
                    blockType: BlockType.REPORTER,
                },
            ],

            menus: {
                argStateMenu: [{text:_('pushed'),value:'pushed'}, {text:_('tilted'),value:'tilted'}],
                noArgStateMenu: [{text:_('moved'),value:'moved'}, {text:_('static'),value:'static'}, {text:_('fall'),value:'fall'}, {text:_('shaken'),value:'shaken'}],
                flipDegMenu: ['90','180',{text:_('any'),value:'any'}],
                rotateDirMenu: [{text:_('clockwise'),value:'cw'}, {text:_('counter clockwise'),value:'ccw'}, {text:_('any'),value:'any'}],
                dirMenu: ['+x', '-x', '+y', '-y', '+z', '-z',{text:_('any'),value:'any'}],
            }
        };
    }

    async setLedColor ({COLOR}) {
        var {r,g,b} = Cast.toRgbColorObject(COLOR);
        await this.cube.scmd(`await cube.led((${b},${g},${r}))`);
    }
    whenState({STATE}){
        return this.cube.lastAction[0]==STATE
    }
    whenStateDir({STATE, DIR}){
        var [a,d] = this.cube.lastAction;
        return DIR=='any'?a==STATE:a==STATE&&d==DIR;
    }
    whenRotated({DIR}){
        return this.whenStateDir({STATE:'rotated',DIR:DIR});
    }
    whenFlipped({DEG}) {
        return this.whenStateDir({STATE:'flipped',DIR:DIR});
    }
    topFace(){
        return this.cube.lastAction[0]=='static'?this.cube.topFace:undefined;
    }
}

module.exports = Scratch3RcuteCubeBlocks;

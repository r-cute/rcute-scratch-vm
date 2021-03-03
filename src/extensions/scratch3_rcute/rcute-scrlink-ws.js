const {RPCClient} = require('./wsmprpc.client');
class RcuteScrlink {

    /**
    * scan for rcute scratch link service
    */
    // static findLinkService(timeout=1500) {
    //     var b = require('bonjour')();
    //     var found = [];
    //     b.find({type: 'ws'}, (service)=>{
    //         if (service.name=='rcute-scratch-link')
    //             found.push(service);
    //     });
    //     return new Promise((r,j)=> setTimeout(()=>{
    //             b.destroy();
    //             if(found.length==1)r(found[0]);
    //             else j((found.length?'More than one':'No')+' rcute-scratch-link found')},
    //         timeout));
    // }

    // /**
    // * factory method to create an instance without scratch link address provided.
    // */
    // static async createLink (runtime, extensionId) {
    //     var service = await findLinkService();
    //     var ws = new WebSocket('ws://'+service.host+":"+service.port);
    //     return new RcuteScrlink(ws, runtime, extensionId);
    // }

    constructor (url) {
        this.disconnectCallbacks={};
        this.requestErrorCallbacks={};
        this.connect(url);
        this._url = url;
    }

    requestPeripheral (serv, type, peri) {
        return this.rpc('discover_peripheral', [serv, type]).then(found=>{
            if (found.length) {
                list ={};
                for(var p of found) list[p[0]]={"rssi": 0.1, 'peripheralId': p[0], 'name': p[0]};
                peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_LIST_UPDATE, list);
            }
            else
                peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
            });
    }

    connectPeripheral (init, serial, peri) {
        return this.rpc('connect_peripheral', [init, serial]).then(()=>{
            peri._serial = serial;
            peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_CONNECTED);
            this.addErrorCallback(peri);
        }).catch(e=>{
            peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
                message: `Scratch lost connection to`,
                extensionId: peri._extensionId
            });
        })
    }

    disconnectPeripheral (peri) {
        return this.rpc('disconnect_peripheral', [peri._serial]).then(()=>{
            peri._serial = null;
            peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_DISCONNECTED);
        })
    }

    disconnect () {
        if (this.connected) {
            this._ws.close();
            this._ws = null;
        }
    }

    connect(url) {
        this._url = url || this._url;
        this._ws = new WebSocket(this._url);
        this._stub = new RPCClient(this._ws);
        this.rpc = this._stub.rpc.bind(this._stub)
        this._ws.onclose = this.handleDisconnectError.bind(this);
        this._ws.onerror = this.handleRequestError.bind(this);
    }

    get connected () {
        return this._ws && (this._ws.readyState === WebSocket.OPEN || this._ws.readyState==WebSocket.CONNECTING);
    }

    addErrorCallback(peri) {
        this.disconnectCallbacks[peri._extensionId] = ()=>{
            peri._serial = null;
            peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
                message: `Scratch lost connection to`,
                extensionId: peri._extensionId
            });
            peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_DISCONNECTED);
        };
        this.requestErrorCallbacks[peri._extensionId] = ()=> {
            peri._serial = null;
            peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
                message: `Scratch lost connection to`,
                extensionId: peri._extensionId
            });
            peri._runtime.emit(peri._runtime.constructor.PERIPHERAL_DISCONNECTED);
        };
    }
    handleDisconnectError (/* e */) {
        Object.keys(this.disconnectCallbacks).forEach(k=>this.disconnectCallbacks[k]());
    }

    handleRequestError (/* e */) {
        Object.keys(this.requestErrorCallbacks).forEach(k=>this.requestErrorCallbacks[k]());
    }

    waitOpen(){
        return new Promise((r,j)=>{waitForSocketConnection(this._ws,r,j)});
    }
}

function waitForSocketConnection(socket, callback, error){
    setTimeout(
        function () {
            if (socket.readyState===WebSocket.CONNECTING){
                waitForSocketConnection(socket, callback, error);
            } else if(socket.readyState === WebSocket.OPEN) {
                callback();
            }else{
                error();
            }
        }, 100);
}

module.exports = new RcuteScrlink(`ws://${window.location.hostname}:20111`);

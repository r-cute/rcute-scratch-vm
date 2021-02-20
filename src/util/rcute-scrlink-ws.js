const {RPCClient} = require('./wsmprpc.client');
class RcuteScrlink extends RPCClient{

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

    constructor (ws, runtime, extensionId) {
        super(ws);
        this._extensionId = extensionId;
        this._runtime = runtime;
        ws.onclose = this.handleDisconnectError.bind(this);
        ws.onerror = this._handleRequestError.bind(this);   
        this._peripherals = [];     
    }

    requestPeripheral (serv, type) {
        this.rpc('discover_peripheral', [serv, type]).then(found=>{
            if (found.length) {
                peri ={};
                for(var p of found) peri[p[0]]={"rssi": 0.1, 'peripheralId': p[0], 'name': p[0]};
                this._runtime.emit(this._runtime.constructor.PERIPHERAL_LIST_UPDATE, peri);
            }
            else
                this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
            });
    }

    connectPeripheral (init, id) {
        this.rpc('connect_peripheral', [init, id]).then(()=>{
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
            this._peripherals.push(id);
        }).catch(e=>{
            this._handleRequestError();
        })
    }

    disconnectPeripheral (id) {
        this.rpc('disconnect_peripheral', [id])
    }
    /**
     * disconnect all peripherals and Close the websocket.
     */
    disconnect () {
        if (this.isConnected()) {
            // Sets connection status icon to orange            
            this._ws.close();
            this._ws = null;
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
        }
        this._peripherals = [];
    }

    isConnected () {
        return this._ws && this._ws.readyState === WebSocket.OPEN;
    }

    
    handleDisconnectError (/* e */) {
        this._ws && this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
            message: `Scratch lost connection to`,
            extensionId: this._extensionId
        });
        this.disconnect();
    }

    _handleRequestError (/* e */) {
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
            message: `Scratch lost connection to`,
            extensionId: this._extensionId
        });
    }

}

module.exports = RcuteScrlink;

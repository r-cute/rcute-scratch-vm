const scrlink = require('../rcute-scrlink-ws');

module.exports = class VideoProvider {
    constructor() {        
        this.canvas = document.createElement('canvas');
        [this.canvas.width, this.canvas.height] = this.RESOLUTION;
        this.ctx = this.canvas.getContext('2d');
        this.rec = this.imgdata=null;
    }
	setCamSerial(serial) {
		this.camSerial = serial;
	}
    get RESOLUTION(){return [480,360]}
	getFrame ({
        dimensions,
        mirror,
        format,
        cacheTimeout
    }){
        if(!this.videoReady)return null;
        if(format=='image-data'){
            return this.imgdata;
        }
        return null;
    }
    getUrl(raw){
        return URL.createObjectURL(new Blob([new Uint8Array(raw)], {type: "image/jpeg"}));
    }
    getImage(url){
        return new Promise(r=>{
            var img=new Image();
            img.onload=()=>{r(img)};
            img.src=url;
        });
    }
    getImageData(img){
        this.ctx.drawImage(img, 0, 0);
        return this.ctx.getImageData(0,0,...this.RESOLUTION);
    }
    async enableVideo(){
        !scrlink.connected && (scrlink.connect()||await scrlink.waitOpen());
        this.imRPC= scrlink.rpc('video',[this.camSerial]);
        this.imRPC.catch(e=>{this.imRPC=null});
        (async()=>{
                for await (var im of this.imRPC){
                    this.ctx.drawImage(await this.getImage(this.getUrl(im[0])), 0, 0);
                    this.imgdata = this.ctx.getImageData(0,0,...this.RESOLUTION);
                    this.rec = im[1];
                    this.timestamp = Date.now();
                }
            })().catch(console.warn);//e=>{if(e.name!='RPCError')throw e;});
    }
    disableVideo(){
        this.imRPC && this.imRPC.cancel();
        this.imgdata=this.rec=null;
    }
    get videoReady(){
        return Boolean(this.imRPC);
    }
};
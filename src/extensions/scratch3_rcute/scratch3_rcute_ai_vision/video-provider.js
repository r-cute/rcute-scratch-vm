const scrlink = require('../rcute-scrlink-ws');

module.exports = class VideoProvider {
    constructor() {
        this.canvas = document.createElement('canvas');
        [this.canvas.width, this.canvas.height] = this.RESOLUTION;
        this.ctx = this.canvas.getContext('2d');
        this.rec = this.imgdata=null;
        this.timestamp=Date.now();
        this.request={dimensions:this.RESOLUTION, mirror:false};
    }
	setCamSerial(serial) {
		this.camSerial = serial;
	}
    async videoSettings(k,v){
        await scrlink.rpc('set_video', [k,v]);
    }
    get RESOLUTION(){return [480,360]}
	getFrame ({
        dimensions,
        mirror,
        format,
        cacheTimeout
    }){
        if(this.videoReady){
            this.request.dimensions=dimensions;
            this.request.mirror = mirror;
            if(format=='image-data')
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
        if(this.imRPC){return;}
        !scrlink.connected && (scrlink.connect()||await scrlink.waitOpen());
        this.imRPC= scrlink.rpc('video',[this.camSerial]);
        this.imRPC.catch(e=>{});
        (async()=>{
                for await (var im of this.imRPC){
                    if (this.request.mirror!=this.mirrored){
                        this.ctx.scale(-1, 1);
                        this.ctx.translate(this.request.dimensions[0] * -1, 0);
                        this.mirrored = this.request.mirror;
                    }
                    this.imgdata = this.getImageData(await this.getImage(this.getUrl(im[0])));
                    this.rec = im[1];
                    this.timestamp = Date.now();
                }
            })().catch(e=>{this.imRPC=this.imgdata=this.rec=null;console.warn(e)});//e=>{if(e.name!='RPCError')throw e;});
    }
    disableVideo(){
        this.imRPC && this.imRPC.cancel();
    }
    get videoReady(){
        return Boolean(this.imRPC);
    }
};
class CameraUnif{
  constructor(){
    
  }
}
class GeneralUnif{
  constructor(){

  } 
}

export default class ResourceManager {
  constructor(device) {
    this.device = device;
    this.buffers = new Map();
    this.textures = new Map();
  }

  createBuffer(name, size, usage) {
    const buffer = this.device.createBuffer({ size, usage });
    this.buffers.set(name, buffer);
    return buffer;
  }

  get(name) { return this.buffers.get(name); }
}
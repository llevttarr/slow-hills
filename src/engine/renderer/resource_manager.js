class CameraUnif{
  constructor(){
    this.pos = null;
    this.fov = null;
    this.aspect = null;
    this.forward = null;
    this.up = null;
    this.right = null;
  }
}
class GeneralUnif{
  constructor(){
    this.w=1000;
    this.h=1000;
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
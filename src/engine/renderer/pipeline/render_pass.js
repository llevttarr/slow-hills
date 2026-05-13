import ResourceManager from "../resource_manager";

export default class WebGPUPass {
  constructor(device, format, layout) {
    this.device = device;
    this.format = format;
    this.layout = layout;
    this.pipeline = null;
  }
  async init() {
    this.createPipeline();
    this.createBuffers();
  }
  createPipeline(){}
  createBuffers(resourceManager){}
  encode(pass, bindGroups) {}
}
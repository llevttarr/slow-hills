
import ComputePass from "./pipeline/compute_pass";
import MainPass from "./pipeline/main_pass";
import WeatherPass from "./pipeline/weather_pass";
import BillboardPass from "./pipeline/billboard_pass";
import ResourceManager from "./resource_manager";

export default class Renderer {
  constructor({ device, context, format }) {
    this.device = device;
    this.context = context;
    this.format = format;
    this.running = false;
    this.dirty = false;
  }
  async init(width,height){ 
    this.w = width;
    this.h = height;
    this.resources = new ResourceManager(this.device);
    /** resource initialization */
    this.resources.init(width, height,/**params */);

    this.mainPass = new MainPass(this.device,this.format);
    this.computePass = new ComputePass(this.device);
    this.billboardPass = new BillboardPass(this.device,this.format);
    this.weatherPass = new WeatherPass(this.device,this.format);

    this.computePass.init(this.resources);
    this.mainPass.init(this.resources);
    this.billboardPass.init(this.resources);
    this.weatherPass.init(this.resources);

  }
  start() {
    this.running = true;
    this.frame();
  }
  startRegen(params) {
    this.genOffset = 0;
    this.isGenerating = true;
    this.resources.regen(params);
    this.resources.clearTerrain();
  }
  stop() {
    this.running = false;
  }
  resize(w, h){
    this.w = w;
    this.h = h;
  }
  frame = () => {
    if (!this.running)
        return;

    this.resources.writeUniforms(this.camera, this.general);
  
    const encoder = this.device.createCommandEncoder();

    if (this.computeDirty) {
      const { xSize, zSize, genChunkSize } = this.resources.params;
      const total = xSize * zSize;

      this.resources.writeGenState(this.genOffset, genChunkSize);

      const workgroups = Math.ceil(genChunkSize / 64);
      this.computePass.encode(encoder, this.resources, workgroups);

      this.genOffset += genChunkSize;
      if (this.genOffset >= total) this.isGenerating = false;
    }
    const colorView = this.context.getCurrentTexture().createView();
    const depthView = this.resources.textures.depth.createView();
    const renderPassDesc = {
      colorAttachments: [{
        view: colorView,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'discard',
      },
    };
    const pass = encoder.beginRenderPass(renderPassDesc);
    this.mainPass.encode(pass, this.resources);
    this.billboardPass.encode(pass, this.resources);
    pass.end();

    const weatherPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: colorView,
        loadOp: 'load',
        storeOp: 'store',
      }],
    });
    this.weatherPass.encode(weatherPass, this.resources);
    weatherPass.end();

    this.device.queue.submit([encoder.finish()]);
    requestAnimationFrame(this.frame);
  };
}

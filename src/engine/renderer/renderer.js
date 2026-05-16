import Camera from "./camera";
import ComputePass from "./pipeline/compute_pass";
import MainPass from "./pipeline/main_pass";
import WeatherPass from "./pipeline/weather_pass";
import BillboardPass from "./pipeline/billboard_pass";
import ResourceManager from "./resource_manager";

import { makeParams, DEFAULT_PARAMS } from "../../core/params";
import { vec3 } from "gl-matrix";

export default class Renderer {
  constructor({ device, context, format }) {
    this.device = device;
    this.context = context;
    this.format = format;
    this.running = false;
    this.dirty = false;
    this.frameCount = 0;
    this.genOffset = 0;
    this.sunDir = vec3.normalize(vec3.create(), vec3.fromValues(0.4, 1.0, 0.3));
  }
  async init(width,height,params=DEFAULT_PARAMS){ 
    this.w = width;
    this.h = height;
    this.resources = new ResourceManager(this.device);
    /** resource initialization */
    this.resources.init(width, height, params);

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
  }
  stop() {
    this.running = false;
  }
  resize(w, h){
    this.w = w;
    this.h = h;
    this.resources.resize(w, h); 
  }
  frame = () => {
    if (!this.running)
        return;

    this.resources.writeFrameUniforms(
      this.camera,
      this.frameCount,
      this.sunDir,
    );
  
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
    const opaquePass = encoder.beginRenderPass({
      colorAttachments: [{
        view: colorView,
        clearValue: { r: 0.5, g: 0.7, b: 0.9, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'discard',
      },
    });
    this.mainPass.encode(opaquePass, this.resources);
    this.billboardPass.encode(opaquePass, this.resources);
    opaquePass.end();

    const weatherRenderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: colorView,
        loadOp: 'load',
        storeOp: 'store',
      }],
    });
    this.weatherPass.encode(weatherRenderPass, this.resources);
    weatherRenderPass.end();

    this.device.queue.submit([encoder.finish()]);
    this.frameCount++;
    requestAnimationFrame(this.frame);
  };
}

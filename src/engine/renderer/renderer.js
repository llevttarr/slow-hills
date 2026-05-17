import Camera from "./camera";
import ComputePass from "./pipeline/compute_pass";
import MainPass from "./pipeline/main_pass";
import WeatherPass from "./pipeline/weather_pass";
import BillboardPass from "./pipeline/billboard_pass";
import ResourceManager from "./resource_manager";

import TextureManager from "./texture_manager";

import { makeParams, DEFAULT_PARAMS } from "../../core/params";
import { vec3 } from "gl-matrix";

const BILLBOARD_IMAGES = [
  { src: '/textures/test.png', label: 'test'} // PLACEHOLDER
];

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
    this.camera = new Camera();
  
    this.camera.pos = vec3.fromValues(32, 30, 32);
    this.camera.pitch = -0.6;
    this.camera.upd_dir();    

    this.resources = new ResourceManager(this.device);
    /** resource initialization */
    this.resources.init(width, height, params);

    this.mainPass = new MainPass(this.device,this.format);
    this.computePass = new ComputePass(this.device);
    this.billboardPass = new BillboardPass(this.device,this.format);
    this.weatherPass = new WeatherPass(this.device,this.format);
  
    // this.texManager = new TextureManager(this.device);
    // await this.texManager.init(BILLBOARD_IMAGES);
    // this.resources.createBillboardBindGroup(this.texManager);

    this.computePass.init(this.resources);
    this.mainPass.init(this.resources);
    this.billboardPass.init(this.resources);
    this.weatherPass.init(this.resources);

  }
  updWeather(code){
    this.resources.updateWeather(code);
  }
  start() {
    this.running = true;
    this.frame();
  }
  startRegen(params) {
    this.genOffset = 0;
    this.computeDirty = true;
    this.resources.regen(params);
    this.frameCount = 0;
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
    if (!this.camera) {
      requestAnimationFrame(this.frame);
      return;
    }
    const canvas = this.context.canvas;
    if (canvas.width === 0 || canvas.height === 0) {
      requestAnimationFrame(this.frame);
      return;
    }
    if (canvas.width !== this.w || canvas.height !== this.h) {
      this.resize(canvas.width, canvas.height);
    }
    const now = performance.now();
    const dt = Math.min((now - (this._lastTime ?? now)) / 1000, 0.1);
    this._lastTime = now;

    this.camera.move(dt);
    this.resources.writeFrameUniforms(
      this.camera,
      this.frameCount,
      this.sunDir,
    );
  
    const encoder = this.device.createCommandEncoder();

    if (this.computeDirty) {
      const { xSize, zSize, genChunkSize, agingRate } = this.resources.params;
      const total = xSize * zSize;

      const framesToAge = Math.ceil(1.0 / agingRate);
      const framesSinceLast = this.frameCount - (this.lastChunkFrame ?? -framesToAge);
  
      if (framesSinceLast >= framesToAge) {
        this.resources.writeGenState(this.genOffset, genChunkSize);
        this.computePass.encode(
          encoder, this.resources,
          Math.ceil(genChunkSize / 64),
        );
        this.lastChunkFrame = this.frameCount;
        this.genOffset += genChunkSize;
        if (this.genOffset >= total) this.computeDirty = false;
      }
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
    // this.billboardPass.encode(opaquePass, this.resources);
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

import vs from "../shaders/vs.wgsl?raw";
import fs from "../shaders/fs.wgsl?raw";
import WebGPUPass from "./pipeline_factory";

export default class Pipeline extends WebGPUPass{
  async init() {
    this.createBuffers();
    this.createPipeline();
  }
  createBuffers() {
    // TODO
  }
  createPipeline() {
    this.pipeline = this.device.createRenderPipeline({
      // TODO
    });
  }
  encode(pass) {
    pass.setPipeline(this.pipeline);
    // pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw( /* n */ );
  }
}

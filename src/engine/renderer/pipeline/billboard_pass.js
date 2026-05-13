import vs from "../shaders/vs.wgsl?raw";
import fs from "../shaders/fs.wgsl?raw";
import WebGPUPass from "./render_pass";

export default class WeatherPass extends WebGPUPass{
  createBuffers(resourceManager) {
    // TODO
  }
  createPipeline() {
    this.pipeline = this.device.createRenderPipeline({
      // TODO
    });
  }
  encode(pass, bindGroups) {
    pass.setPipeline(this.pipeline);
    // pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw( /* n */ );
  }
}

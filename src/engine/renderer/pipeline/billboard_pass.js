import shader from "../shaders/billboard.wgsl?raw";
import WebGPUPass from "./render_pass";

export default class WeatherPass extends WebGPUPass{
  createBuffers(resources) {
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

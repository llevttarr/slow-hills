import shader from "../shaders/main.wgsl?raw";
import WebGPUPass from "./render_pass";

export default class MainPass extends WebGPUPass{
  init(resources) {
    const module = this.device.createShaderModule({ code: shader });
    this.buildPipeline(module, [/* layout */], true, [
      resources.layouts.frame,
      resources.layouts.computeRead,
    ]);
  }

  encode(pass, resources) {
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, resources.bindGroups.frame);
    pass.setBindGroup(1, resources.bindGroups.computeRead);
    pass.setVertexBuffer(0, resources.buffers.computeOutput);
    pass.draw(vertexCount, instanceCount);
  }
}

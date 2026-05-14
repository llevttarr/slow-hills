import vs from "../shaders/vs.wgsl?raw";
import fs from "../shaders/fs.wgsl?raw";
import WebGPUPass from "./render_pass";

export default class WeatherPass extends RenderPass {
  init(resources) {
    const module = this.device.createShaderModule({ code: shader });
    this.buildPipeline(module, null, false, [resources.layouts.frame]);
  }

  encode(pass, resources) {
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, resources.bindGroups.frame);
    pass.draw(3);
  }
}
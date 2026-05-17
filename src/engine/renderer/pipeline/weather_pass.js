import shader from "../../shaders/weather.wgsl?raw";
import WebGPUPass from "./render_pass";

const ALPHA_BLEND = {
  color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
  alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
};

export default class WeatherPass extends WebGPUPass {
  init(resources) {
    const module = this.device.createShaderModule({ code: shader });
    this.buildPipeline(module,null, null, [resources.layouts.group0],ALPHA_BLEND,);
  }

  encode(pass, resources) {
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, resources.bindGroups.group0);
    pass.draw(3);
  }
}

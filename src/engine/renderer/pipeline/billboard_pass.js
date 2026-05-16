import shader from "../shaders/billboard.wgsl?raw";
import WebGPUPass from "./render_pass";

const ALPHA_BLEND = {
  color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
  alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
};

export default class BillboardPass extends WebGPUPass {
  init(resources) {
    const module = this.device.createShaderModule({ code: shader });
    this.buildPipeline(module, null,false, [resources.layouts.group0, resources.layouts.group1Read], ALPHA_BLEND,);
  }

  encode(pass, resources) {
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, resources.bindGroups.group0);
    pass.setBindGroup(1, resources.bindGroups.group1Read);

    //fixme
    pass.draw(6, 1000);
  }
}
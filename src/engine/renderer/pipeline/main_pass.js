import shader from "../shaders/main.wgsl?raw";
import WebGPUPass from "./render_pass";

export default class MainPass extends WebGPUPass{
  init(resources) {
    const module = this.device.createShaderModule({ code: shader });
    this.buildPipeline(module,null, true,[resources.layouts.group0, resources.layouts.group1Read],null,);
  }

  encode(pass, resources) {
    const { xSize, zSize } = resources.params;
    const indexCount = (xSize - 1) * (zSize - 1) * 6;
    const bottomICount = (2 * (xSize - 1) + 2 * (zSize - 1)) * 6;

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, resources.bindGroups.group0);
    pass.setBindGroup(1, resources.bindGroups.group1Read);
    pass.setIndexBuffer(resources.buffers.terrainIndex, 'uint32');
    pass.drawIndexed(indexCount+bottomICount);
  }
}

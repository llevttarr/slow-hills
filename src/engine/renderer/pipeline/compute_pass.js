import vs from "../shaders/vs.wgsl?raw";
import fs from "../shaders/fs.wgsl?raw";
import WebGPUPass from "./render_pass";

export default class ComputePass{
   constructor(device) {
    this.device = device;
    this.pipeline = null;
  }

  init(resources) {
    const layout = this.device.createPipelineLayout({
      bindGroupLayouts: [resources.layouts.frame, resources.layouts.computeWrite],
    });

    this.pipeline = this.device.createComputePipeline({
      layout,
      compute: {
        module: this.device.createShaderModule({ code: computeShader }),
        entryPoint: 'main',
      },
    });
  }

  encode(encoder, resources, workgroupCount) {
    const pass = encoder.beginComputePass({ label: 'compute' });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, resources.bindGroups.frame);
    pass.setBindGroup(1, resources.bindGroups.computeWrite);
    pass.dispatchWorkgroups(workgroupCount);
    pass.end();
  }
}

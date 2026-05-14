import shader from "../shaders/weather.wgsl?raw";
import WebGPUPass from "./render_pass";

export default class WeatherPass extends RenderPass {
  init(resources) {
    const module = this.device.createShaderModule({ code: shader });
    this.buildPipeline(module, null, false, [resources.layouts.frame]);
  }
  buildPipeline(shaderModule, vertexLayout, depthWrite, layouts) {
    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: layouts,
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: vertexLayout ?? [],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format: this.format }],
      },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: depthWrite,
        depthCompare: depthWrite ? 'less' : 'less-equal',
      },
      primitive: { topology: 'triangle-list' },
    });
  }
  encode(pass, resources) {
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, resources.bindGroups.frame);
    pass.draw(3);
  }
}
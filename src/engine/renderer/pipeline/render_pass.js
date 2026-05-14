import ResourceManager from "../resource_manager";

export default class WebGPUPass {
  constructor(device, format) {
    this.device = device;
    this.format = format;
    this.pipeline = null;
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

  encode(pass, resources) {}
}
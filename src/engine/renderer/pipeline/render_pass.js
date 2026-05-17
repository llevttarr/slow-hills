import ResourceManager from "../resource_manager";

export default class WebGPUPass {
  constructor(device, format) {
    this.device = device;
    this.format = format;
    this.pipeline = null;
  }
  buildPipeline(shaderModule, vertexLayout, depthWrite, layouts, blend = null) {
    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: layouts,
    });
    const depthStencil = depthWrite !== null ? {
      format: 'depth24plus',
      depthWriteEnabled: depthWrite,
      depthCompare: depthWrite ? 'less' : 'less-equal',
    } : undefined;

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
        targets: [{ format: this.format, blend: blend ?? undefined }],
      },
      depthStencil,
      primitive: { topology: 'triangle-list', cullMode: 'none' },
    });
  }

  encode(pass, resources) {}
}
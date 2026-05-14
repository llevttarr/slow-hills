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
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{
          format: this.format,
          blend: {
            color: {
              srcFactor:  'src-alpha',
              dstFactor:  'one-minus-src-alpha',
              operation:  'add',
            },
            alpha: {
              srcFactor:  'one',
              dstFactor:  'one-minus-src-alpha',
              operation:  'add',
            },
          },
        }],
      },
    });
  }

  encode(pass, resources) {}
}
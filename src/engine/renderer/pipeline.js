import vs from "../shaders/vs.wgsl?raw";
import fs from "../shaders/fs.wgsl?raw";

export default class Pipeline {
  constructor(device, format) {
    this.device = device;
    this.format = format;
  }
  init() {
    this.createBuffers();
    this.createPipeline();
  }
  createBuffers() {
    // TODO
    const vertices = new Float32Array([
        0.0, 0.0, 0.0, 1, 0, 0,
        0.5, 0.5, 0.0, 0, 1, 0,
        0.5, 0.0, 0.0, 0, 0, 1,
    ]);
    this.vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.vertexBuffer, 0, vertices);
  }
  createPipeline() {
    this.pipeline = this.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: this.device.createShaderModule({ code: vs }),
        entryPoint: "vs_main",
        buffers: [
          {
            arrayStride: 6*4,
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x3" },
              { shaderLocation: 1, offset: 3*4, format: "float32x3" },
            ],
          },
        ],
      },
      fragment: {
        module: this.device.createShaderModule({ code: fs }),
        entryPoint: "fs_main",
        targets: [{ format: this.format }],
      },
      primitive: {
        topology: "triangle-list",
      },
    });
  }
  encode(pass) {
    pass.setPipeline(this.pipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw(3);
  }
}

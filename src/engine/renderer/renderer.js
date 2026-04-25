import Pipeline from "./pipeline";
export default class Renderer {
  constructor({ device, context, format }) {
    this.device = device;
    this.context = context;
    this.format = format;
    this.running = false;
  }
  init(){ 
    this.pipeline = new Pipeline(this.device, this.format);
    this.pipeline.init();
  }
  start() {
    this.running = true;
    this.frame();
  }
  stop() {
    this.running = false;
  }
  resize(w, h){
    this.w = w;
    this.h = h;
  }
  frame = () => {
    if (!this.running)
        return;

    const encoder = this.device.createCommandEncoder();
    const view = this.context.getCurrentTexture().createView();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    this.pipeline.encode(pass);
    pass.end();

    this.device.queue.submit([encoder.finish()]);
    requestAnimationFrame(this.frame);
  };
}

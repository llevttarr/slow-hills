
export default class WebGPUPass {
  constructor(device, format, layout) {
    this.device = device;
    this.format = format;
    this.layout = layout;
    this.pipeline = null;
  }
  async init() {
  
  }
  run(encoder, bindGroups) {
  
  }
}

export default class PipelineFactory {
  static async createComputePass(device, resources) {
    const pass = new ComputePass(device);
    await pass.init(resources.get('generationParams'));

    return pass;
  }
  static async createTerrainPipeline(device, resources) {
    const pass = new TerrainPass(device);
    await pass.init(resources.get('heightBuffer'));
    
    return pass;
  }
  static async createBillboardPass(device, resources) {
    const pass = new WeatherPass(device);
    await pass.init(resources.get('billboardBuffer'));
    
    return pass;
  }
  static async createWeatherPass(device, resources) {
    const pass = new WeatherPass(device);
    await pass.init(resources.get('depthTexture'));
    
    return pass;
  }
}
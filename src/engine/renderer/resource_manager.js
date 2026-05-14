const FRAME_UNIFORMS_SIZE = 28*4;
const WORLD_UNIFORMS_SIZE = 12*4;

const REGION_DEF_BYTES = 32;
const TERRAIN_CELL_BYTES = 16;
const BILLBOARD_BYTES = 32;
const MAX_BILLBOARDS = 1000;

const WEATHER_UNIFORMS_SIZE = 64;
const WEATHER_POLL_MS = 15 * 60 * 1000;

export default class ResourceManager {
  /** initialization */

  constructor(device) {
    this.device = device;
    this.buffers = {};
    this.textures = {};
    this.layouts = {};
    this.bindGroups = {};
    this.frameArr = new Float32Array(28);
    this.w = 1;
    this.h = 1;
  }
  init(width,height,params){
    const D =this.device;
    const U = GPUBufferUsage;
    this.w = width;
    this.h = height;
    this.params = params;
    const { xSize, zSize, numRegions } = params;
    const cellCount = xSize * zSize;
  
    this.buffers.frameUniforms = D.createBuffer({
      label: 'frameUniforms',
      size:  FRAME_UNIFORMS_SIZE,
      usage: U.UNIFORM | U.COPY_DST,
    });
    this.buffers.worldUniforms = D.createBuffer({
      label: 'worldUniforms',
      size:  WORLD_UNIFORMS_SIZE,
      usage: U.UNIFORM | U.COPY_DST,
    });

    this.buffers.terrainBuffer = D.createBuffer({
      label: 'terrainBuffer',
      size:  cellCount * TERRAIN_CELL_BYTES,
      usage: U.STORAGE | U.COPY_DST,
    });
    this.buffers.regionDefBuffer = D.createBuffer({
      label: 'regionDefBuffer',
      size:  numRegions * REGION_DEF_BYTES,
      usage: U.STORAGE | U.COPY_DST,
    });
    this.buffers.billboardBuffer = D.createBuffer({
      label: 'billboardBuffer',
      size:  MAX_BILLBOARDS * BILLBOARD_BYTES,
      usage: U.STORAGE | U.VERTEX,
    });
    this.buffers.billboardCount = D.createBuffer({
      label: 'billboardCount',
      size:  4,
      usage: U.STORAGE | U.COPY_SRC | U.COPY_DST,
    });
    this.buffers.weatherUniforms = D.createBuffer({
      label: 'weatherUniforms',
      size:  WEATHER_UNIFORMS_SIZE,
      usage: U.UNIFORM | U.COPY_DST,
    });

    this.buffers.terrainIndex = this.buildIndexBuffer(xSize, zSize);

    this.textures.depth = D.createTexture({
      label: 'depth',
      size: [width, height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.writeWorldUniforms(params);
    this.writeRegionDefs(params.regions);

    this.createLayouts();
    this.createBindGroups();
  }

  /** uploads (const) */
  writeWorldUniforms(p) {
    const buf = new ArrayBuffer(WORLD_UNIFORMS_BYTES);
    const dv = new DataView(buf);
    dv.setUint32(0, p.xSize, true);
    dv.setUint32(4, p.zSize, true);
    dv.setUint32(8,p.seed, true);
    dv.setUint32(12, p.numRegions, true);
    dv.setFloat32(16, p.cellSize, true);
    dv.setFloat32(20, p.heightIntensity, true);
    dv.setFloat32(24, p.objectIntensity, true);
    dv.setFloat32(28, p.agingRate, true);
    dv.setUint32 (32, 0, true);
    dv.setUint32 (36, p.genChunkSize, true);
    dv.setUint32 (40, 0, true);
    dv.setUint32 (44, 0, true);
    this.device.queue.writeBuffer(this.buffers.worldUniforms, 0, buf);
  }
  writeRegionDefs(regions) {
    const buf = new ArrayBuffer(regions.length * REGION_DEF_BYTES);
    const dv = new DataView(buf);
    regions.forEach((r, i) => {
      const o = i * REGION_DEF_BYTES;
      dv.setFloat32(o + 0, r.color[0], true);
      dv.setFloat32(o + 4, r.color[1], true);
      dv.setFloat32(o + 8, r.color[2], true);
      dv.setUint32 (o + 12, r.billboardType, true);
      dv.setFloat32(o + 16, r.heightMin, true);
      dv.setFloat32(o + 20, r.heightMax, true);
      dv.setFloat32(o + 24, r.billboardChance, true);
      dv.setFloat32(o + 28, 0, true);
    });
    this.device.queue.writeBuffer(this.buffers.regionDefBuffer, 0, buf);
  }
  buildIndexBuffer(xSize, zSize) {
    const count = (xSize - 1) * (zSize - 1) * 6;
    const indices = new Uint32Array(count);
    let n = 0;
    for (let z = 0; z < zSize - 1; z++) {
      for (let x = 0; x < xSize - 1; x++) {
        const tl = z * xSize + x;
        const tr = tl + 1;
        const bl = tl + xSize;
        const br = bl + 1;
        indices[n++] = tl;
        indices[n++] = bl;
        indices[n++] = tr;

        indices[n++] = tr;
        indices[n++] = bl;
        indices[n++] = br;
      }
    }
    const gpuBuf = this.device.createBuffer({
      label: 'terrainIndex',
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(gpuBuf, 0, indices);
    return gpuBuf;
  }

  /** frame change  */

  writeFrameUniforms(camera, frameCount, sunDir) {
    const a = this.frameArr;
    camera.write(a);
    a[7] = frameCount;
    a[16] = sunDir[0];
    a[17] = sunDir[1];
    a[18] = sunDir[2];
    a[19] = 0;
    a[20] = this.w;
    a[21] = this.h;
    
    this.device.queue.writeBuffer(this.buffers.frameUniforms, 0, a);
  }
  
  /** binding logic */
  
  createLayouts() {
    const D = this.device;
    const V = GPUShaderStage.VERTEX;
    const F = GPUShaderStage.FRAGMENT;
    const C = GPUShaderStage.COMPUTE;

    this.layouts.group0 = D.createBindGroupLayout({
      label: 'group0',
      entries: [
        { binding: 0, visibility: V|F|C, buffer: { type: 'uniform' } }, // frameUniforms
        { binding: 1, visibility: V|F|C, buffer: { type: 'uniform' } }, // worldUniforms
        { binding: 2, visibility: V|F|C, buffer: { type: 'read-only-storage' }}, // regionDefBuffer
        { binding: 3, visibility: V|F|C, buffer: { type: 'uniform' } },
      ],
    });

    // g1 compute
    this.layouts.group1Write = D.createBindGroupLayout({
      label: 'group1Write',
      entries: [
        { binding: 0, visibility: C, buffer: { type: 'storage' } }, // terrainBuffer
        { binding: 1, visibility: C, buffer: { type: 'storage' } }, // billboardBuffer
        { binding: 2, visibility: C, buffer: { type: 'storage' } }, // billboardCount
      ],
    });

    // g1 render
    this.layouts.group1Read = D.createBindGroupLayout({
      label: 'group1Read',
      entries: [
        { binding: 0, visibility: V|F, buffer: { type: 'read-only-storage' } }, // terrainBuffer
        { binding: 1, visibility: V|F, buffer: { type: 'read-only-storage' } }, // billboardBuffer
        { binding: 2, visibility: V|F, buffer: { type: 'read-only-storage' } }, // billboardCount
      ],
    });
  }

  createBindGroups() {
    const D = this.device;
    const B = this.buffers;
    this.bindGroups.group0 = D.createBindGroup({
      label: 'group0', layout: this.layouts.group0,
      entries: [
        { binding: 0, resource: { buffer: B.frameUniforms } },
        { binding: 1, resource: { buffer: B.worldUniforms } },
        { binding: 2, resource: { buffer: B.regionDefBuffer } },
        { binding: 3, resource: { buffer: B.weatherUniforms } },
      ],
    });

    const terrainEntries = [
      { binding: 0, resource: { buffer: B.terrainBuffer } },
      { binding: 1, resource: { buffer: B.billboardBuffer } },
      { binding: 2, resource: { buffer: B.billboardCount } },
    ];
    this.bindGroups.group1Write = D.createBindGroup({
      label: 'group1Write', layout: this.layouts.group1Write, entries: terrainEntries,
    });
    this.bindGroups.group1Read = D.createBindGroup({
      label: 'group1Read', layout: this.layouts.group1Read, entries: terrainEntries,
    });
  }

  /** extern-use util */
  regen(params) {
    this.params = params;
    this.writeWorldUniforms(params);
    this.writeRegionDefs(params.regions);
    this.clearTerrain();
  }
  resize(width, height) {
    this.w = width; this.h = height;
    this.textures.depth.destroy();
    this.textures.depth = this.device.createTexture({
      size: [width, height], format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }
  writeGenState(genOffset, genChunkSize) {
    const arr = new Uint32Array([genOffset, genChunkSize]);
    this.device.queue.writeBuffer(this.buffers.worldUniforms, 32, arr);
  }
  clearTerrain() {
    const zeros = new Uint8Array(this.buffers.terrainBuffer.size);
    this.device.queue.writeBuffer(this.buffers.terrainBuffer, 0, zeros);
    this.device.queue.writeBuffer(this.buffers.billboardCount, 0, new Uint32Array([0]));
  }

  /** weather */
  writeWeatherUniforms(w) {
    const buf = new ArrayBuffer(WEATHER_UNIFORMS_SIZE);
    const dv = new DataView(buf);
    dv.setFloat32(0, w.windDir[0], true);
    dv.setFloat32(4, w.windDir[1], true);
    dv.setFloat32(8, w.windSpeed, true);
    dv.setFloat32(12, w.precipitation, true);
    dv.setFloat32(16, w.cloudCover, true);
    dv.setFloat32(20, w.temperature, true);
    dv.setFloat32(24, w.fogDensity, true);
    dv.setFloat32(28, w.fogColor[0], true);
    dv.setFloat32(32, w.fogColor[1], true);
    dv.setFloat32(36, w.fogColor[2], true);
    dv.setFloat32(40, 0, true);
    dv.setFloat32(44, w.uvIndex, true);
    dv.setUint32(48, w.weatherCode, true);
    dv.setFloat32(52, w.snowfall, true);
    dv.setFloat32(56, 0, true);
    dv.setFloat32(60, 0, true);
    this.device.queue.writeBuffer(this.buffers.weatherUniforms, 0, buf);
  }

  startWeatherPolling(lat, lon) {
    const poll = async () => {
      try {
        const w = await fetchWeather(lat, lon);
        this.writeWeatherUniforms(w);
      } catch (e) {
        console.warn('weather fetch failed', e);
      }
    };
    poll();
    this._weatherTimer = setInterval(poll, WEATHER_POLL_MS);
  }

  stopWeatherPolling() {
    clearInterval(this._weatherTimer);
  }
}
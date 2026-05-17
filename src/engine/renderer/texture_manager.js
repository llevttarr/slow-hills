const ATLAS_ENTRY_BYTES = 16;

export default class TextureManager {
  constructor(device) {
    this.device = device;
    this.texture = null;
    this.sampler = null;
    this.atlasEntriesBuffer = null;
    this.entries = [];
  }

  async init(images) {
    const loaded = await Promise.all(images.map(img => this.loadImage(img.src)));

    const cols = Math.ceil(Math.sqrt(images.length));
    const rows = Math.ceil(images.length / cols);
    const cellW = Math.max(...loaded.map(i => i.width));
    const cellH = Math.max(...loaded.map(i => i.height));

    const atlasW = cols*cellW;
    const atlasH = rows*cellH;

    const canvas= new OffscreenCanvas(atlasW, atlasH);
    const ctx = canvas.getContext('2d');

    this.entries = [];
    loaded.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const px  = col * cellW;
      const py  = row * cellH;
      ctx.drawImage(img, px, py, cellW, cellH);
      this.entries.push({
        uMin: px / atlasW, vMin: py / atlasH,
        uMax: (px + cellW) / atlasW, vMax: (py + cellH) / atlasH,
        label: images[i].label,
      });
    });

    const imageBitmap = await createImageBitmap(canvas);
    this.texture = this.device.createTexture({
      label: 'billboardAtlas',
      size: [atlasW, atlasH],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING| GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT,
      mipLevelCount: Math.floor(Math.log2(Math.max(atlasW, atlasH))) + 1,
    });
    this.device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      { texture: this.texture },
      [atlasW, atlasH],
    );
    // this.generateMipmaps(atlasW, atlasH);
  
    this.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
    });

    const buf = new ArrayBuffer(this.entries.length * ATLAS_ENTRY_BYTES);
    const dv = new DataView(buf);
    this.entries.forEach((e, i) => {
      const o = i * ATLAS_ENTRY_BYTES;
      dv.setFloat32(o + 0, e.uMin, true);
      dv.setFloat32(o + 4, e.vMin, true);
      dv.setFloat32(o + 8, e.uMax, true);
      dv.setFloat32(o + 12, e.vMax, true);
    });
    this.atlasEntriesBuffer = this.device.createBuffer({
      label: 'atlasEntries',size: buf.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.atlasEntriesBuffer, 0, buf);
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(createImageBitmap(img));
      img.onerror = reject;
      img.src = src;
    });
  }

  generateMipmaps(width, height) {
    // TODO ?
  }

  destroy() {
    this.texture?.destroy();
    this.atlasEntriesBuffer?.destroy();
  }
}
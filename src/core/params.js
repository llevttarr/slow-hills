export const DEFAULT_PARAMS = {
  xSize: 64,
  zSize: 64,
  cellSize: 1.0,
  seed: 0xDEADBEEF,
  numRegions: 3,
  heightIntensity: 20.0,
  objectIntensity: 0.0,
  agingRate: 0.1,
  genChunkSize: 256,
  regions: [
    { color: [0.20, 0.55, 0.15], heightMin: 0, heightMax: 8, billboardChance: 0, billboardType: 0 },
    { color: [0.45, 0.38, 0.22], heightMin: 8, heightMax: 16, billboardChance: 0, billboardType: 0 },
    { color: [0.80, 0.80, 0.85], heightMin: 16, heightMax: 20, billboardChance: 0, billboardType: 0 },
  ],
};

export function makeParams(overrides = {}) {
  return { ...DEFAULT_PARAMS, ...overrides, seed: Math.random() * 0xFFFFFFFF | 0 };
}
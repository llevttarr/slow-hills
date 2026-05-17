export const DEFAULT_PARAMS = {
  xSize: 512,
  zSize: 512,
  cellSize: 1.0,
  seed: 0x67676767,
  numRegions: 3,
  heightIntensity: 140.0,
  objectIntensity: 0.0,
  agingRate: 0.01,
  genChunkSize: 4096,
  regions: [
    { color: [0.165, 0.561, 0.059], heightMin: 0, heightMax: 10, billboardChance: 0, billboardType: 0 },
    { color: [0.24, 0.678, 0.259], heightMin: 10, heightMax: 17, billboardChance: 0, billboardType: 0 },
    { color: [0.45, 0.8, 0.404], heightMin: 17, heightMax: 999, billboardChance: 0, billboardType: 0 },
  ],
};

export function makeParams(overrides = {}) {
  return { ...DEFAULT_PARAMS, ...overrides, seed: Math.random() * 0xFFFFFFFF | 0 };
}
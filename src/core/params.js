export const DEFAULT_PARAMS = {
  xSize: 256,
  zSize: 256,
  cellSize: 1.0,
  seed: 0xDEADBEEF,
  numRegions: 6,
  heightIntensity: 40.0,
  objectIntensity: 0.35,
  agingRate: 0.04,
  genChunkSize: 1024,
  regions: [],
};

export function makeParams(overrides = {}) {
  return { ...DEFAULT_PARAMS, ...overrides, seed: Math.random() * 0xFFFFFFFF | 0 };
}
export function buildPermTable(seed) {
  const perm = new Uint32Array(512);
  for (let i = 0; i < 256; i++){
    perm[i] = i;
  }
  let s = seed >>> 0;
  for (let i = 255; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++){
    perm[i + 256] = perm[i];
  }
  return perm;
}

export function buildGradTable() {
  const grads = new Float32Array([
     1, 1,-1, 1,  
     1,-1,-1,-1,
     1, 0,-1, 0,
     1, 0,-1, 0,
     0, 1, 0,-1,
     0, 1,0,-1,
     1, 1,-1, 1,
     0,-1, 0, 1,
  ]);
  return grads;
}
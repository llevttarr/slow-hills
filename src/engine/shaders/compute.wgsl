struct FrameUniforms {
  cam_pos: vec3<f32>, fov: f32,
  cam_fwd: vec3<f32>, time: f32,
  cam_right: vec3<f32>, pad0: f32,
  cam_up: vec3<f32>, pad1: f32,
  sun_dir: vec3<f32>, pad2: f32,
  resolution: vec2<f32>,
};
struct WorldUniforms {
  x_size: u32,
  z_size: u32,
  seed: u32,
  num_regions: u32,

  cell_size: f32,
  height_intensity: f32,
  object_intensity: f32,
  aging_rate: f32,

  gen_offset: u32,
  gen_chunk_size: u32, pad0: u32, pad1: u32,
};
struct RegionDef {
  color: vec3<f32>, billboard_type: u32,
  height_min: f32, height_max: f32, billboard_chance: f32, pad: f32,
};
struct TerrainCell {
  height: f32, region_id: u32, billboard_id: i32, gen_frame: u32,
};
struct Billboard {
  pos: vec3<f32>, b_type: u32,
  scale: f32, yaw: f32, pad: vec2<f32>,
};

@group(0) @binding(0) var<uniform> frame : FrameUniforms;
@group(0) @binding(1) var<uniform> world : WorldUniforms;
@group(0) @binding(2) var<storage, read> region_defs : array<RegionDef>;

@group(1) @binding(0) var<storage, read_write> terrain : array<TerrainCell>;
@group(1) @binding(1) var<storage, read_write> billboards : array<Billboard>;
@group(1) @binding(2) var<storage, read_write> bb_count : atomic<u32>;
@group(1) @binding(3) var<storage, read> perm : array<u32>;
@group(1) @binding(4) var<storage, read> grads : array<f32>;

fn grad2(hash: u32, x: f32, z: f32) -> f32 {
  let h = hash & 7u;
  let gx = grads[h * 2u];
  let gz = grads[h * 2u + 1u];
  return gx * x + gz * z;
}
fn fade(t: f32) -> f32 { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

fn perlin2(x: f32, z: f32) -> f32 {
  let xi = u32(floor(x)) & 255u;
  let zi = u32(floor(z)) & 255u;
  let xf = fract(x);
  let zf = fract(z);
  let u = fade(xf); 
  let v = fade(zf);

  let aa = perm[perm[xi] + zi];
  let ab = perm[perm[xi] + zi + 1u];
  let ba = perm[perm[xi + 1u] + zi];
  let bb = perm[perm[xi + 1u] + zi + 1u];

  return mix(
    mix(grad2(aa, xf, zf),grad2(ba, xf - 1.0, zf), u),
    mix(grad2(ab, xf,zf - 1.0),grad2(bb, xf - 1.0, zf - 1.0), u),v,);
}

fn fbm(x: f32, z: f32) -> f32 {
  let raw= perlin2(x * 0.008, z * 0.008) * 0.500 + perlin2(x * 0.016, z * 0.016) * 0.250
       + perlin2(x * 0.032, z * 0.032) * 0.125 + perlin2(x * 0.064, z * 0.064) * 0.063;
  return (raw / 0.938)*0.5 + 0.5;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let li = gid.x;
  if li >= world.gen_chunk_size { return; }
  let idx = world.gen_offset + li;
  if idx >= world.x_size * world.z_size { return; }

  let col = idx % world.x_size;
  let row = idx / world.x_size;

  let fx = f32(col) / f32(world.x_size);
  let fz = f32(row) / f32(world.z_size);

  // let h = (sin(fx))* (cos(fz))* world.height_intensity;
  let h = (fbm(f32(col), f32(row)) * world.height_intensity);
  var rid = 0u;
  for (var r = 0u; r < world.num_regions; r++) {
    if h >= region_defs[r].height_min && h < region_defs[r].height_max {
      rid = r;
      break;
    }
  }

  terrain[idx] = TerrainCell(h, rid, -1i, u32(frame.time) + 1u);
}
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
struct WeatherUniforms {
  wind_dir: vec2<f32>, wind_speed: f32, precipitation: f32,
  cloud_cover: f32, temperature: f32, fog_density: f32,
  fog_r: f32, fog_g: f32, fog_b: f32, pad0: f32,
  uv_index: f32, weather_code: u32, snowfall: f32, pad1: f32, pad2: f32,
};
struct RegionDef {
  color: vec3<f32>, billboard_type: u32,
  height_min: f32, height_max: f32, billboard_chance: f32, pad: f32,
};

struct Billboard {
  pos: vec3<f32>, b_type: u32,
  scale: f32, yaw: f32, pad: vec2<f32>,
};
@group(1) @binding(1) var<storage, read> billboards : array<Billboard>;

struct AtlasEntry {
  u_min: f32, v_min: f32, u_max: f32, v_max: f32,
};

@group(2) @binding(0) var atlas_tex : texture_2d<f32>;
@group(2) @binding(1) var atlas_samp : sampler;
@group(2) @binding(2) var<storage, read> atlas_entries: array<AtlasEntry>;
struct BBOut {
  @builtin(position) clip_pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
  @location(1) world_pos : vec3<f32>,
  @location(2) b_type : u32,
};
fn bb_corner(vi: u32) -> vec2<f32> {
  let xs = array<f32,6>(-0.5,  0.5, -0.5, -0.5,  0.5,  0.5);
  let ys = array<f32,6>( 0.0,  0.0,  1.0,  1.0,  0.0,  1.0);
  return vec2<f32>(xs[vi], ys[vi]);
}
fn bb_uv_local(vi: u32) -> vec2<f32> {
  let us = array<f32,6>(0.0, 1.0, 0.0, 0.0, 1.0, 1.0);
  let vs = array<f32,6>(1.0, 1.0, 0.0, 0.0, 1.0, 0.0);
  return vec2<f32>(us[vi], vs[vi]);
}
@vertex
fn vs_main(@builtin(vertex_index) vi : u32,@builtin(instance_index) ii : u32,) -> BBOut {
  let bb = billboards[ii];
  let corner = bb_corner(vi);
  let local_uv = bb_uv_local(vi);

  let e = atlas_entries[bb.b_type];
  let atlas_uv = vec2<f32>(
    mix(e.u_min, e.u_max, local_uv.x),
    mix(e.v_min, e.v_max, local_uv.y),
  );

  let wpos = bb.pos+ frame.cam_right * (corner.x * bb.scale)+ vec3<f32>(0.0, 1.0, 0.0) * (corner.y * bb.scale);

  let view = make_view(frame.cam_pos, frame.cam_fwd, frame.cam_right, frame.cam_up);
  let proj = make_proj(frame.fov, frame.resolution.x / frame.resolution.y, 0.1, 1000.0);

  var out: BBOut;
  out.clip_pos  = proj * view * vec4<f32>(wpos, 1.0);
  out.uv = atlas_uv;
  out.world_pos = wpos;
  out.b_type = bb.b_type;
  return out;
}

@fragment
fn fs_main(in: BBOut) -> @location(0) vec4<f32> {
  let c = textureSample(atlas_tex, atlas_samp, in.uv);
  if c.a < 0.15 { discard; }

  let fog_color = vec3<f32>(weather.fog_r, weather.fog_g, weather.fog_b);
  let dist = length(in.world_pos - frame.cam_pos);
  let fog_f = 1.0 - exp(-weather.fog_density * dist);
  let lit = mix(c.rgb, fog_color, fog_f);

  return vec4<f32>(lit, c.a);
}
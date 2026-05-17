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
  sky_top : vec3<f32>, fog_density : f32,
  sky_horizon : vec3<f32>, precipitation: f32,
  fog_color : vec3<f32>, snowfall : f32,
  sun_color : vec3<f32>, sun_intensity: f32,
  wind_dir : vec2<f32>, wind_speed : f32,
  ambient_mult: f32,
};
struct RegionDef {
  color: vec3<f32>, billboard_type: u32,
  height_min: f32, height_max: f32, billboard_chance: f32, pad: f32,
};

struct Billboard {
  pos: vec3<f32>, b_type: u32,
  scale: f32, yaw: f32, pad: vec2<f32>,
};

@group(0) @binding(0) var<uniform> frame : FrameUniforms;
@group(0) @binding(1) var<uniform> world : WorldUniforms;
@group(0) @binding(2) var<storage, read> region_defs : array<RegionDef>;
@group(0) @binding(3) var<uniform> weather : WeatherUniforms;

@group(1) @binding(1) var<storage, read> billboards : array<Billboard>;
@group(1) @binding(2) var<storage, read> bb_count_buf: array<u32>;

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
  @location(2) @interpolate(flat) b_type : u32,
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
fn make_view(pos: vec3<f32>, fwd: vec3<f32>, right: vec3<f32>, up: vec3<f32>) -> mat4x4<f32> {
  return mat4x4<f32>(
    vec4<f32>(right.x, up.x, -fwd.x, 0.0),
    vec4<f32>(right.y, up.y, -fwd.y, 0.0),
    vec4<f32>(right.z, up.z, -fwd.z, 0.0),
    vec4<f32>(-dot(right, pos), -dot(up, pos), dot(fwd, pos), 1.0),
  );
}
fn make_proj(fov: f32, aspect: f32, near: f32, far: f32) -> mat4x4<f32> {
  let f = 1.0 / tan(fov * 0.5);
  let nf = near - far;
  return mat4x4<f32>(
    vec4<f32>(f/aspect, 0.0, 0.0, 0.0),
    vec4<f32>(0.0, f, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, far/nf, -1.0),
    vec4<f32>(0.0, 0.0, (near*far)/nf, 0.0),
  );
}
@vertex
fn vs_main(@builtin(vertex_index) vi : u32,@builtin(instance_index) ii : u32,) -> BBOut {
  var out: BBOut;
  if ii >= bb_count_buf[0] {
    out.clip_pos = vec4<f32>(0.0, 0.0, 2.0, 1.0);
    out.uv = vec2<f32>(0.0);
    out.world_pos = vec3<f32>(0.0);
    out.b_type = 0u;
    return out;
  }
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

  let fog_color = weather.fog_color;
  let dist = length(in.world_pos - frame.cam_pos);
  let fog_f = 1.0 - exp(-weather.fog_density * dist);
  let lit = mix(c.rgb, fog_color, fog_f);

  return vec4<f32>(lit, c.a);
}
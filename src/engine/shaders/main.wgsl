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
struct TerrainCell {
  height: f32, region_id: u32, billboard_id: i32, gen_frame: u32,
};

@group(0) @binding(0) var<uniform> frame : FrameUniforms;
@group(0) @binding(1) var<uniform> world : WorldUniforms;
@group(0) @binding(2) var<storage, read> region_defs : array<RegionDef>;
@group(0) @binding(3) var<uniform> weather : WeatherUniforms;
@group(1) @binding(0) var<storage, read> terrain : array<TerrainCell>;


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

struct VertOut {
  @builtin(position) clip_pos : vec4<f32>,
  @location(0) color : vec3<f32>,
  @location(1) world_pos : vec3<f32>,
  @location(2) appear : f32,
};

@vertex
fn vs_main(@builtin(vertex_index) vi: u32) -> VertOut {
  var out: VertOut;
  let cell = terrain[vi];

  // TODO
  out.clip_pos = vec4<f32>(0.0, 0.0, 2.0, 1.0);
  out.color = vec3<f32>(0.0);
  out.world_pos = vec3<f32>(0.0);
  out.appear = 0.0;
  return out;
}

@fragment
fn fs_main(in: VertOut) -> @location(0) vec4<f32> {
  if in.appear < 0.01 { 
    discard; 
  }

  var n = normalize(cross(dpdx(in.world_pos), dpdy(in.world_pos)));
  if n.y < 0.0 { n = -n; }

  let diffuse = max(dot(n, normalize(frame.sun_dir)), 0.0);
  let lit = in.color * (0.25 + 0.75 * diffuse);

  let fog_color = vec3<f32>(weather.fog_r, weather.fog_g, weather.fog_b);
  let dist = length(in.world_pos - frame.cam_pos);
  let fog_f = 1.0 - exp(-weather.fog_density * dist);

  return vec4<f32>(mix(lit, fog_color, fog_f), 1.0);
}
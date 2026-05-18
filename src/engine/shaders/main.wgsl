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

const BOTTOM_FLAG : u32 = 0x80000000u;
@vertex
fn vs_main(@builtin(vertex_index) vi: u32) -> VertOut {
  var out: VertOut;

  let is_bottom = (vi & BOTTOM_FLAG) != 0u;
  let cell_idx = vi & ~BOTTOM_FLAG;
  let cell = terrain[cell_idx];

  let col = cell_idx % world.x_size;
  let row = cell_idx / world.x_size;

  let floor_y = 0.0;

  if (cell.gen_frame == 0u && !is_bottom) {
    out.clip_pos = vec4<f32>(0.0, 0.0, 2.0, 1.0);
    out.color = vec3<f32>(0.0);
    out.world_pos = vec3<f32>(0.0);
    out.appear = 0.0;
    return out;
  }

  let gen_at = f32(cell.gen_frame - 1u);
  let age = max(0.0, frame.time - gen_at);
  let t = smoothstep(0.0, 1.0, clamp(age * world.aging_rate, 0.0, 1.0));

  let surface_y = mix(floor_y, cell.height, t);
  let y = select(surface_y, floor_y, is_bottom);

  let wpos = vec3<f32>(f32(col) * world.cell_size, y, f32(row) * world.cell_size);

  let view = make_view(frame.cam_pos, frame.cam_fwd, frame.cam_right, frame.cam_up);
  let proj = make_proj(frame.fov, frame.resolution.x / frame.resolution.y, 0.1, 1000.0);
  let rid = min(cell.region_id, world.num_regions - 1u);

  out.clip_pos = proj * view * vec4<f32>(wpos, 1.0);

  let base_color = select(region_defs[rid].color, vec3<f32>(0.25, 0.22, 0.18), is_bottom);

  out.color = mix(vec3<f32>(1.0), base_color, t);

  out.world_pos = wpos;
  out.appear = select(t, 1.0, is_bottom);
  return out;
}

@fragment
fn fs_main(in: VertOut) -> @location(0) vec4<f32> {
  if (in.appear < 0.01) { 
    discard; 
  }

  var n = normalize(cross(dpdx(in.world_pos), dpdy(in.world_pos)));
  if (n.y < 0.0) { 
    n = -n; 
  }

  let sun_dir = normalize(frame.sun_dir);
  let diffuse = max(dot(n, sun_dir), 0.0);
  let sun_contrib = weather.sun_color * (weather.sun_intensity * diffuse);

  let hemi = n.y * 0.5 + 0.5;
  let ambient = mix(vec3<f32>(0.08, 0.07, 0.06), weather.sky_top, hemi)* weather.ambient_mult;
  let lit = in.color * (ambient + sun_contrib);
  let dist = length(in.world_pos - frame.cam_pos);
  let fog_f = 1.0 - exp(-weather.fog_density * dist);

  return vec4<f32>(mix(lit, weather.fog_color, fog_f), 1.0);
}
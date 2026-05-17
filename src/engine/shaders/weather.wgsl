struct FrameUniforms {
  cam_pos: vec3<f32>, fov: f32,
  cam_fwd: vec3<f32>, time: f32,
  cam_right: vec3<f32>, pad0: f32,
  cam_up: vec3<f32>, pad1: f32,
  sun_dir: vec3<f32>, pad2: f32,
  resolution: vec2<f32>,
};
struct WeatherUniforms {
  sky_top : vec3<f32>, fog_density : f32,
  sky_horizon : vec3<f32>, precipitation: f32,
  fog_color : vec3<f32>, snowfall : f32,
  sun_color : vec3<f32>, sun_intensity: f32,
  wind_dir : vec2<f32>, wind_speed : f32,
  ambient_mult: f32,
};
@group(0) @binding(0) var<uniform> frame : FrameUniforms;
@group(0) @binding(3) var<uniform> weather : WeatherUniforms;

@vertex
fn vs_main(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4<f32> {
  // fullscreen tri
  let x = f32((vi & 1u) << 2u) - 1.0;
  let y = f32((vi & 2u) << 1u) - 1.0; 
  return vec4<f32>(x, y, 0.0, 1.0);
}
@fragment
fn fs_main(@builtin(position) frag_pos: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = frag_pos.xy / frame.resolution;
  let t = frame.time;

  var overlay = vec3<f32>(0.0);
  var alpha = 0.0;
  
  // TODO

  return vec4<f32>(overlay, alpha);
}
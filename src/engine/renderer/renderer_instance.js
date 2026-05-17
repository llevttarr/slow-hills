import Renderer from "./renderer";
import { DEFAULT_PARAMS, makeParams } from "../../core/params";
import { weatherCodes } from "../../data/WeatherCodes";
let renderer = null;

export function setRenderer(newR){
  renderer = newR;
}
export function rerun(overrides = {}){
  if (!renderer){
    console.warn("Renderer is not initialized");
    return;
  }
  const params = makeParams(overrides);
  renderer.startRegen(params);
}
export function getRenderer(){
  return renderer;
}
export function updWeather(w){
  if (!renderer){
    console.warn("Renderer is not initialized");
    return;
  }
  const code = Object.keys(weatherCodes).find(key => weatherCodes[key] === w);

  renderer.updWeather(code ?? 0);
}
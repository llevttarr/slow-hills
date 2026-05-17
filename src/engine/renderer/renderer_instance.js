import Renderer from "./renderer";
import { DEFAULT_PARAMS, makeParams } from "../../core/params";
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

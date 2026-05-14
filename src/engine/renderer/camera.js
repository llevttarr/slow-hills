import { vec3 } from "gl-matrix";
import { pi } from "mathjs";
export default class Camera{
  constructor(){
    this.pos = vec3.fromValues(0.0,1.0,0.0);
    this.forward = vec3.fromValues(0.0,0.0,1.0);
    this.right = vec3.fromValues(1.0,0.0,0.0);
    this.up = vec3.fromValues(0.0,1.0,0.0);

    this.fov = 70.0*pi/180.0;
    this.yaw = 0.1;
    this.speed = 1.0;
    this.moveTicks = 0;
    this.pitch = 0.1;
  }
  move(){

  }
  upd_dir(){

  }
  
}
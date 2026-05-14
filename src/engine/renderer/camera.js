import { vec3 } from "gl-matrix";

const WORLD_UP = vec3.fromValues(0, 1, 0);
const PITCH_MAX = Math.PI / 2 - 0.01;
const FOV_RAD = 70 * Math.PI / 180;

export default class Camera{
  constructor(){
    this.pos = vec3.fromValues(0, 1, 0);
    this.forward = vec3.fromValues(0, 0, 1);
    this.right = vec3.fromValues(1, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);


    this.fov = FOV_RAD;
    this.yaw = 0.1;
    this.speed = 1.0;
    this.moveTicks = 0;
    this.pitch = 0.1;

    this._keys = new Set();
    
    this._locked = false;
    this._cruise = false;
    this._cruiseDir = vec3.create();
    this._canvas = null;
    this.upd_dir();
  }
  move(dt){
    if (!this._locked){
      return;
    }
    const spd = this.speed * dt;
    const moveKeys = ['KeyW','KeyS','KeyA','KeyD','Space','ShiftLeft'];
    const anyMove  = moveKeys.some(k => this._keys.has(k));

    if (this._cruise) {
      if (anyMove) {
        this._cruise = false;
      } else {
        vec3.scaleAndAdd(this.pos, this.pos, this._cruiseDir, spd);
        return;
      }
    }
    const flatFwd = vec3.fromValues(this.forward[0], 0, this.forward[2]);
    vec3.normalize(flatFwd, flatFwd);

    if (this._keys.has('KeyW')) vec3.scaleAndAdd(this.pos, this.pos, flatFwd, spd);
    if (this._keys.has('KeyS')) vec3.scaleAndAdd(this.pos, this.pos, flatFwd, -spd);
    if (this._keys.has('KeyA')) vec3.scaleAndAdd(this.pos, this.pos, this.right,-spd);
    if (this._keys.has('KeyD')) vec3.scaleAndAdd(this.pos, this.pos, this.right, spd);
    if (this._keys.has('Space')) this.pos[1] += spd;
    if (this._keys.has('ShiftLeft'))this.pos[1] -= spd;
  }
  upd_dir(){
    const cosPitch = Math.cos(this.pitch);
    this.forward[0] = cosPitch * Math.sin(this.yaw);
    this.forward[1] = Math.sin(this.pitch);
    this.forward[2] = cosPitch * Math.cos(this.yaw);
    vec3.normalize(this.forward, this.forward);

    vec3.cross(this.right, this.forward, WORLD_UP);
    vec3.normalize(this.right, this.right);

    vec3.cross(this.up, this.right, this.forward);
  }
  /** events poll */
  onMouseMove(dx, dy, sensitivity = 0.0015) {
    if (!this._locked) return;
    if (this._cruise) this._cruise = false;
    this.yaw += dx * sensitivity;
    this.pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, this.pitch - dy * sensitivity));
    this.upd_dir();
  }

  requestPointerLock(canvas) {
    canvas.addEventListener('click', () => canvas.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === canvas) {
        document.addEventListener('mousemove', this._onMouse);
      } else {
        document.removeEventListener('mousemove', this._onMouse);
      }
    });
  }
  _onKeyDown = (e) => {
    if (e.code === 'KeyR') {
      if (this._locked) {
        document.exitPointerLock();
      }else{ 
        this._canvas?.requestPointerLock();
      }
      return;
    }

    if (e.code === 'KeyG') {
      if (this._cruise) {
        this._cruise = false;
      } else if (this._locked) {
        const flatFwd = vec3.fromValues(this.forward[0], 0, this.forward[2]);
        vec3.normalize(this._cruiseDir, flatFwd);
        this._cruise = true;
      }
      return;
    }

    this._keys.add(e.code);
    if (this._cruise) this._cruise = false;
  };

  _onKeyUp = (e) => {
    this._keys.delete(e.code);
  };
  
  _onMouse = (e) => this.onMouseMove(e.movementX, e.movementY);

  _onLockChange = () => {
    this._locked = document.pointerLockElement === this._canvas;
    if (!this._locked) {
      this._cruise = false;
      this._keys.clear();
    }
  };
  /**write */
  write(arr) {
    arr[0] = this.pos[0];
    arr[1] = this.pos[1];
    arr[2] = this.pos[2];
    
    arr[3] = this.fov;
    arr[4] = this.forward[0];
    arr[5] = this.forward[1];
    arr[6] = this.forward[2];
    
    arr[8] = this.right[0]; 
    arr[9] = this.right[1];
    arr[10] = this.right[2];
    
    arr[11] = 0;
    arr[12] = this.up[0];
    arr[13] = this.up[1];
    arr[14] = this.up[2];
    arr[15] = 0;
  }
  /** bind */
  bind(canvas) {
    this._canvas = canvas;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouse);
    document.addEventListener('pointerlockchange', this._onLockChange);
  }

  unbind() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousemove', this._onMouse);
    document.removeEventListener('pointerlockchange', this._onLockChange);
    if (this._locked) document.exitPointerLock();
  }
}
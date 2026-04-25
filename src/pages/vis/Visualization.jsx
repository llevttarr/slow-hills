import { useRef, useEffect } from "react";
import { useWebGPU } from "../../hooks/useWebGPU";
import Renderer from "../../engine/renderer/Renderer";

export default function Visualization() {
  const canvasRef = useRef(null);
  const gpu = useWebGPU(canvasRef);
  
  useEffect(() => {
    if (!gpu)
        return;
    const renderer = new Renderer(gpu);
    renderer.init();
    renderer.start();
    return () => renderer.stop();
  }, [gpu]);

  return <canvas ref={canvasRef} />;
}

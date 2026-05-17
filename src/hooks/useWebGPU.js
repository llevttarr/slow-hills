import { useEffect, useState } from "react";
import { initWebGPU } from "../engine/context/initWebGPU";

export function useWebGPU(canvasRef) {
  const [gpu, setGpu] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('useWebGPU: canvas not mounted yet');
      return;
    }
    let cancelled = false;
    
    initWebGPU(canvas).then((ctx) => {
      if (!cancelled) setGpu(ctx);
    }).catch(err => console.error('WebGPU init failed:', err));

    return () => {
      cancelled = true;
    };
  }, [canvasRef]);
  return gpu;
}

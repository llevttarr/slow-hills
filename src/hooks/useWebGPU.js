import { useEffect, useState } from "react";
import { initWebGPU } from "../engine/context/initWebGPU";

export function useWebGPU(canvasRef) {
  const [gpu, setGpu] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    
    initWebGPU(canvas).then((ctx) => {
      if (!cancelled) setGpu(ctx);
    });

    return () => {
      cancelled = true;
    };
  }, [canvasRef]);
  return gpu;
}

import { useEffect, useState } from "react";
import { initWebGPU } from "../engine/context/initWebGPU";
export function useWebGPU(canvasRef) {
  const [gpu, setGpu] = useState(null);
  useEffect(() => {
    if (!canvasRef.current)
        return;
    initWebGPU(canvasRef.current).then(setGpu);
  }, [canvasRef]);

  return gpu;
}

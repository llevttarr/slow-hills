import { useRef, useEffect } from "react";
import { useWebGPU } from "../../hooks/useWebGPU";
import Renderer from "../../engine/renderer/renderer";

export default function Visualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const gpu = useWebGPU(canvasRef);

  useEffect(() => {
    if (!gpu || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width  = canvas.clientWidth || 800;
    canvas.height = canvas.clientHeight || 600;

    const renderer = new Renderer(gpu);
    rendererRef.current = renderer;

    renderer.init(canvas.width, canvas.height)
      .then(() => {
        renderer.camera.bind(canvas);
        renderer.startRegen(renderer.resources.params);
        renderer.start();
      });

    return () => {
      renderer.stop();
      rendererRef.current = null;
    };
  }, [gpu]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      canvas.width = width;
      canvas.height = height;
      rendererRef.current?.resize(width, height);
    });
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
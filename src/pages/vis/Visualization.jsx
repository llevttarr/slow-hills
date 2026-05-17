import { useRef, useEffect } from "react";
import { useWebGPU } from "../../hooks/useWebGPU";
import Renderer from "../../engine/renderer/renderer";
import { resizeRenderer, setRenderer } from "../../engine/renderer/renderer_instance";

export default function Visualization() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const gpu = useWebGPU(canvasRef);

  useEffect(() => {
    if (!gpu || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;

    const renderer = new Renderer(gpu);
    rendererRef.current = renderer;

    renderer.init(canvas.width, canvas.height)
      .then(() => {
        setRenderer(renderer);
        renderer.camera.bind(canvas);
        renderer.startRegen(renderer.resources.params);
        renderer.start();
        console.log('renderer started, canvas:', canvas.width, 'x', canvas.height);
      })
      .catch(err => {
        console.error('renderer init failed:', err);
      });

    return () => {
      renderer.stop();
      rendererRef.current = null;
      setRenderer(null);
    };
  }, [gpu]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      canvas.width = width;
      canvas.height = height;
      resizeRenderer(width,height);
    });
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-screen w-screen"
    />
  );
}
import { useEffect, useRef } from 'react';
import type { BoundingBox } from '../../types';

interface BoundingBoxViewerProps {
  imageUrl: string;
  detections: BoundingBox[];
}

export default function BoundingBoxViewer({ imageUrl, detections }: BoundingBoxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const drawBoxes = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const { naturalWidth, naturalHeight, offsetWidth, offsetHeight } = img;
    canvas.width = offsetWidth;
    canvas.height = offsetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = offsetWidth / 1000;
    const scaleY = offsetHeight / 1000;

    detections.forEach(({ label, box_2d }) => {
      const [ymin, xmin, ymax, xmax] = box_2d;
      const x = xmin * scaleX;
      const y = ymin * scaleY;
      const w = (xmax - xmin) * scaleX;
      const h = (ymax - ymin) * scaleY;

      // Glow shadow
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;

      // Box
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Fill tint
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(x, y, w, h);

      // Label background
      const labelText = label || 'Affected Area';
      ctx.font = 'bold 11px Inter, sans-serif';
      const textW = ctx.measureText(labelText).width + 10;
      const textH = 20;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(x, y - textH - 2, textW, textH, 4);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#fff';
      ctx.fillText(labelText, x + 5, y - 7);
    });
  };

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      drawBoxes();
    } else {
      img.onload = drawBoxes;
    }
    const observer = new ResizeObserver(drawBoxes);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [imageUrl, detections]);

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden bg-black">
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Pet scan"
        className="w-full object-contain max-h-[500px]"
        onLoad={drawBoxes}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      {detections.length === 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-green-400 text-xs px-4 py-1.5 rounded-full border border-green-500/30">
          ✓ No affected areas detected
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

/**
 * Lightweight pan/zoom viewer for a single high-resolution image (e.g. a IIIF
 * "max" rendering). Keyboard: + / − to zoom, arrow keys to pan, 0 to reset.
 * Deep-zoom tiling (OpenSeadragon) can replace this when tiled IIIF is needed.
 */
export function ZoomViewer({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const clamp = (v: number) => Math.min(6, Math.max(1, v));
  const zoom = (d: number) => setScale((s) => clamp(s * d));
  const reset = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  return (
    <div>
      <div
        role="application"
        aria-label={`Zoomable image: ${alt}. Use plus and minus to zoom, arrow keys to move, 0 to reset.`}
        tabIndex={0}
        className="relative aspect-[4/5] cursor-grab touch-none overflow-hidden border border-rule bg-graphite active:cursor-grabbing"
        onWheel={(e) => zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15)}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => drag.current && setPos({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })}
        onPointerUp={() => (drag.current = null)}
        onKeyDown={(e) => {
          const step = 40;
          if (e.key === "+" || e.key === "=") zoom(1.25);
          else if (e.key === "-") zoom(0.8);
          else if (e.key === "0") reset();
          else if (e.key === "ArrowLeft") setPos((p) => ({ ...p, x: p.x + step }));
          else if (e.key === "ArrowRight") setPos((p) => ({ ...p, x: p.x - step }));
          else if (e.key === "ArrowUp") setPos((p) => ({ ...p, y: p.y + step }));
          else if (e.key === "ArrowDown") setPos((p) => ({ ...p, y: p.y - step }));
          else return;
          e.preventDefault();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- allow-listed institutional image */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="pill" onClick={() => zoom(1.25)} aria-label="Zoom in">
          +
        </button>
        <button type="button" className="pill" onClick={() => zoom(0.8)} aria-label="Zoom out">
          −
        </button>
        <button type="button" className="pill" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}

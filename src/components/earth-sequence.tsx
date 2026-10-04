"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function EarthSequence() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.Worker || !HTMLCanvasElement.prototype.transferControlToOffscreen) return;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    container.append(canvas);
    const worker = new Worker(new URL("./earth-worker.ts", import.meta.url), { type: "module" });
    const offscreen = canvas.transferControlToOffscreen();
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 700px)").matches;
    let range = 1;
    worker.postMessage({ type: "init", canvas: offscreen, mobile, paused: motion.matches }, [offscreen]);
    worker.onmessage = ({ data }: MessageEvent<{ frame: number; cached: number }>) => {
      canvas.dataset.frame = String(data.frame);
      canvas.dataset.cached = String(data.cached);
    };
    worker.onerror = () => { canvas.remove(); worker.terminate(); };

    function update() {
      worker.postMessage({ type: "scroll", progress: Math.min(1, Math.max(0, scrollY / range)) });
    }
    function scroll() {
      if (!motion.matches && !document.hidden) update();
    }
    function resize() {
      const density = Math.min(devicePixelRatio || 1, mobile ? 2 : 1.5);
      const width = Math.min(mobile ? 1080 : 2560, Math.round(innerWidth * density));
      range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      worker.postMessage({ type: "resize", width, height: Math.round(width * innerHeight / innerWidth) });
      scroll();
    }
    function pause() {
      worker.postMessage({ type: "pause", paused: motion.matches || document.hidden });
      if (!motion.matches && !document.hidden) { resize(); scroll(); }
    }

    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    resize();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    motion.addEventListener("change", pause);
    document.addEventListener("visibilitychange", pause);
    return () => {
      worker.terminate();
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      motion.removeEventListener("change", pause);
      document.removeEventListener("visibilitychange", pause);
      canvas.remove();
    };
  }, []);

  return <>
    <picture><source media="(max-width: 700px)" srcSet="/earth/v2/mobile/earth-001.webp" /><Image className="earth-poster" src="/earth/v2/desktop/earth-001.webp" alt="" fill sizes="100vw" loading="eager" fetchPriority="high" unoptimized /></picture>
    <div ref={containerRef} aria-hidden="true" />
  </>;
}

"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./earth-3d.module.css";

export function Earth3D({ paused = false }: { paused?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<ReturnType<typeof import("./earth-3d-scene").createEarth> | null>(null);
  const pauseState = useRef(paused);

  useEffect(() => {
    pauseState.current = paused;
    controller.current?.setPaused(paused);
  }, [paused]);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let cancel: (() => void) | undefined;
    let generation = 0;
    const update = async () => {
      const current = ++generation;
      cancel?.();
      cancel = undefined;
      if (motion.matches || !canvas.current) return;
      try {
        const { createEarth } = await import("./earth-3d-scene");
        if (current !== generation || !canvas.current) return;
        controller.current = createEarth(canvas.current);
        controller.current.setPaused(pauseState.current);
        cancel = () => { controller.current?.dispose(); controller.current = null; };
      } catch {
        // The static Earth remains available if WebGL or its module cannot load.
      }
    };
    void update();
    motion.addEventListener("change", update);
    return () => { generation++; cancel?.(); motion.removeEventListener("change", update); };
  }, []);

  return <div className={styles.background} aria-hidden="true">
    <picture>
      <source media="(max-width: 700px)" srcSet="/earth-3d/poster-mobile.webp" />
      <Image className={styles.poster} src="/earth-3d/poster-desktop.webp" alt="" fill sizes="100vw" loading="eager" fetchPriority="high" unoptimized />
    </picture>
    <canvas ref={canvas} className={styles.canvas} />
  </div>;
}

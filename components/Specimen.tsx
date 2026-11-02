"use client";

import { useEffect, useRef } from "react";
import { drawSpecimen, grain, type FlowerKind } from "@/lib/flora";

/** Tek tür çiçek çizimi (rehber sekmesi, herbaryum yaprağı). */
export default function Specimen({ kind, size, className, label }: { kind: FlowerKind; size: number; className?: string; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    let done = false;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !done) { done = true; io.disconnect(); paint(); } }, { rootMargin: "400px" });
    io.observe(c);
    return () => io.disconnect();
    function paint() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.round(size * dpr);
    c.width = px; c.height = px;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, (size * dpr) / 2, (size * dpr) / 2);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.clearRect(-size, -size, size * 2, size * 2);
    drawSpecimen(ctx, kind, size);
    grain(ctx, px, [0.5, 0.5], 0.06);
    }
  }, [kind, size]);
  return <canvas ref={ref} className={className} style={{ width: size, height: size }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}

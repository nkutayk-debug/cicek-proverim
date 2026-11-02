/* Kök sistemi üretici + çizici. Yerçekimine yönelen, dallanan, saksı duvarına
   çarpınca duvar boyunca dönen kökler. Büyüme animasyonu için her kökün
   doğum zamanı ve uzunluğu tutulur. */
import { rng } from "./flora";

export type RootPt = { x: number; y: number; w: number };
export type Root = { pts: RootPt[]; born: number; len: number; level: number; hairs: { i: number; a: number; l: number }[] };

type Bounds = { left: (y: number) => number; right: (y: number) => number; bottom: number; top: number };

export function growRoots(seed: number, origin: { x: number; y: number }, b: Bounds, o: { mains: number; step: number; maxSteps: number; width: number; spread: number; branch: number; stopAtBottom?: boolean }) {
  const R = rng(seed);
  const roots: Root[] = [];
  const walk = (x: number, y: number, a: number, w: number, level: number, born: number, steps: number) => {
    const pts: RootPt[] = [{ x, y, w }];
    const hairs: Root["hairs"] = [];
    for (let i = 0; i < steps; i++) {
      // yerçekimi: açıyı aşağıya (π/2) çek
      a += (Math.PI / 2 - a) * (0.06 + level * 0.01) + (R() - 0.5) * 0.42;
      x += Math.cos(a) * o.step;
      y += Math.sin(a) * o.step;
      // saksı duvarı: içeri yansıt (dolanma)
      const L = b.left(y) + 8, Rr = b.right(y) - 8;
      if (x < L) { x = L; a = Math.PI / 2 + (R() * 0.6 - 0.1); }
      if (x > Rr) { x = Rr; a = Math.PI / 2 - (R() * 0.6 - 0.1); }
      if (y > b.bottom - 8) { if (o.stopAtBottom) break; y = b.bottom - 8; a = R() > 0.5 ? 0.25 : Math.PI - 0.25; }
      w *= 0.965;
      pts.push({ x, y, w: Math.max(0.6, w) });
      if (R() < 0.55) hairs.push({ i: pts.length - 1, a: a + (R() > 0.5 ? 1 : -1) * (1.1 + R() * 0.7), l: 4 + R() * 9 });
      if (level < 2 && i > 2 && R() < o.branch) {
        const side = R() > 0.5 ? 1 : -1;
        const childBorn = born + (i / steps) * (1 - born) * 0.8;
        walk(x, y, a + side * (0.7 + R() * 0.7), w * 0.62, level + 1, childBorn, Math.floor(steps * (0.35 + R() * 0.35)));
      }
    }
    roots.push({ pts, born, len: pts.length, level, hairs });
  };
  for (let m = 0; m < o.mains; m++) {
    const t = o.mains === 1 ? 0 : m / (o.mains - 1) - 0.5;
    walk(origin.x + t * 26, origin.y, Math.PI / 2 + t * o.spread, o.width * (0.8 + R() * 0.4), 0, R() * 0.08, o.maxSteps - ((R() * 6) | 0));
  }
  roots.sort((a, b) => b.level - a.level);
  return roots;
}

/** Kökleri çiz. grow: 0..1 (doğum + uzama). */
export function drawRoots(ctx: CanvasRenderingContext2D, roots: Root[], grow: number, style: { fill: string; ink: string; hair?: number; halo?: number }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const visible = (r: Root) => {
    const local = (grow - r.born) / Math.max(0.0001, 1 - r.born);
    return Math.max(0, Math.min(1, local * 1.25));
  };
  // halo (rizosfer)
  if (style.halo && style.halo > 0) {
    for (const [wMul, a] of [[9, 0.05], [5, 0.07], [2.6, 0.08]] as const) {
      ctx.strokeStyle = `rgba(70,130,235,${a * style.halo})`;
      for (const r of roots) {
        const n = Math.floor(r.len * visible(r));
        if (n < 2) continue;
        ctx.beginPath();
        ctx.moveTo(r.pts[0].x, r.pts[0].y);
        for (let i = 1; i < n; i++) ctx.lineTo(r.pts[i].x, r.pts[i].y);
        ctx.lineWidth = (r.pts[0].w + 6) * wMul * 0.5;
        ctx.stroke();
      }
    }
  }
  for (const pass of [0, 1]) {
    for (const r of roots) {
      const n = Math.floor(r.len * visible(r));
      if (n < 2) continue;
      ctx.strokeStyle = pass ? style.fill : style.ink;
      for (let i = 1; i < n; i++) {
        const p0 = r.pts[i - 1], p1 = r.pts[i];
        ctx.lineWidth = pass ? p1.w : p1.w + 1.6;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      }
    }
  }
  if (style.hair && style.hair > 0) {
    ctx.strokeStyle = style.fill;
    ctx.globalAlpha = Math.min(1, style.hair);
    ctx.lineWidth = 0.8;
    for (const r of roots) {
      const n = Math.floor(r.len * visible(r));
      for (const h of r.hairs) {
        if (h.i >= n) continue;
        const p = r.pts[h.i];
        const l = h.l * style.hair;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(h.a) * l, p.y + Math.sin(h.a) * l); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}

/** Kök üzerinde rastgele bir nokta (parçacık yerleşimi için). */
export function pointOnRoots(roots: Root[], R: () => number, grow = 1) {
  const r = roots[(R() * roots.length) | 0];
  const n = Math.max(1, Math.floor(r.len * Math.min(1, Math.max(0, (grow - r.born) / (1 - r.born)))));
  const p = r.pts[(R() * n) | 0];
  return p;
}

/* Kök bölgesi büyüteci (Canvas). İlerleme p (0..1):
   0-.25 salgı · .25-.5 mavi bakteriler köke yerleşir · .5-.75 kök tüyleri · .75-1 besin yukarı + çiçek.
   Kaydırmaya bağlı DEĞİL; çağıran zamanla sürer. */
import { PAL, css, geraniumFloret, geraniumLeaf, bud, mix, rng, sprite, stamp, type Sprite } from "./flora";
import { growRoots, drawRoots, type Root } from "./roots";

const V = 1000, C = 500, RAD = 486, SURF = 300;
export const sm = (x: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function createRootLens(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const R = rng(404);
  const half = (y: number) => Math.sqrt(Math.max(0, RAD * RAD - (y - C) * (y - C))) * 0.94;
  const roots: Root[] = growRoots(21, { x: C, y: SURF + 4 }, {
    left: (y) => C - half(y), right: (y) => C + half(y), bottom: C + RAD * 0.86, top: SURF,
  }, { mains: 6, step: 15, maxSteps: 38, width: 11, spread: 1.7, branch: 0.2, stopAtBottom: true });
  const pick = () => { const r = roots[(R() * roots.length) | 0]; return r.pts[(R() * r.pts.length) | 0]; };
  const exud = Array.from({ length: 150 }, () => { const p = pick(); return { x: p.x, y: p.y, a: R() * 6.28, ph: R(), sp: 0.25 + R() * 0.4, s: 1.6 + R() * 2.4 }; });
  const microbes = Array.from({ length: 300 }, () => {
    const p = pick(); const a = R() * 6.28, d = p.w * 0.5 + 3 + R() * 10;
    let sx = C + (R() - 0.5) * 900, sy = SURF + 30 + R() * 640;
    if (Math.hypot(sx - C, sy - C) > RAD) { sx = C + (sx - C) * 0.6; sy = C + (sy - C) * 0.6; }
    return { hx: p.x + Math.cos(a) * d, hy: p.y + Math.sin(a) * d, sx, sy, ph: R(), s: 1.4 + R() * 1.6 };
  });
  const nutrients = Array.from({ length: 90 }, () => ({ r: roots[(R() * roots.length) | 0], off: R(), sp: 0.12 + R() * 0.12, fe: R() > 0.6 }));
  const grains = Array.from({ length: 1400 }, () => { const a = R() * 6.28, d = Math.sqrt(R()) * RAD; return { x: C + Math.cos(a) * d, y: C + Math.sin(a) * d, s: R(), c: R() }; }).filter((g) => g.y > SURF + 4);

  let dpr = 1, k = 1;
  let spr: Record<string, Sprite> = {};
  let soil: HTMLCanvasElement | null = null;

  const resize = (w: number) => {
    dpr = Math.min(window.devicePixelRatio || 1, 2); k = w / V;
    c.width = Math.round(w * dpr); c.height = Math.round(w * dpr);
    const d = dpr * k;
    spr = {};
    for (let v = 0; v < 3; v++) spr["f" + v] = sprite("rl-floret" + v, 60, d, [0.5, 0.5], (x, s) => geraniumFloret(x, s * 0.44, PAL.geranium, 40 + v * 9));
    for (let i = 0; i < 3; i++) spr["leaf" + i] = sprite("rl-leaf" + i, 170, d, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, PAL.leaf, 0.55, 9 + i * 7));
    spr.bud = sprite("rl-bud", 44, d, [0.5, 0.86], (x, s) => bud(x, s * 0.21, PAL.geranium, 0));
    soil = document.createElement("canvas");
    soil.width = c.width; soil.height = c.height;
    const s = soil.getContext("2d")!;
    s.setTransform(d, 0, 0, d, 0, 0);
    s.save(); s.beginPath(); s.arc(C, C, RAD, 0, 6.28); s.clip();
    const air = s.createLinearGradient(0, 0, 0, SURF);
    air.addColorStop(0, "#ffffff"); air.addColorStop(1, "#fdf2f6");
    s.fillStyle = air; s.fillRect(0, 0, V, SURF + 10);
    s.beginPath(); s.moveTo(0, SURF);
    for (let x = 0; x <= V; x += 20) s.lineTo(x, SURF + Math.sin(x * 0.03) * 4 + Math.sin(x * 0.11) * 2);
    s.lineTo(V, V); s.lineTo(0, V); s.closePath();
    const sg = s.createLinearGradient(0, SURF, 0, V);
    sg.addColorStop(0, "#d9bf9f"); sg.addColorStop(0.5, "#c9a984"); sg.addColorStop(1, "#b38f6b");
    s.fillStyle = sg; s.fill();
    for (const g of grains) {
      s.fillStyle = g.c > 0.93 ? "rgba(255,255,252,.9)" : g.c > 0.6 ? "rgba(110,75,45,.35)" : "rgba(240,225,200,.5)";
      s.beginPath(); s.arc(g.x, g.y, g.c > 0.93 ? 3 + g.s * 3 : 1 + g.s * 2.2, 0, 6.28); s.fill();
    }
    const P = rng(9);
    for (let i = 0; i < 26; i++) {
      const a = P() * 6.28, d2 = Math.sqrt(P()) * RAD * 0.92, x = C + Math.cos(a) * d2, y = C + Math.sin(a) * d2;
      if (y < SURF + 20) continue;
      s.fillStyle = "rgba(150,120,95,.55)"; s.strokeStyle = "rgba(80,55,35,.35)"; s.lineWidth = 1.2;
      s.beginPath(); s.ellipse(x, y, 7 + P() * 12, 5 + P() * 8, P() * 3, 0, 6.28); s.fill(); s.stroke();
    }
    s.restore();
  };

  const draw = (p: number, t: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    if (soil) ctx.drawImage(soil, 0, 0);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.arc(C, C, RAD, 0, 6.28); ctx.clip();
    ctx.lineCap = "round";
    // toprak üstü: saplı sardunya yaprakları + kavisli çiçek sapı (ön/arka sıra)
    const sway = Math.sin(t * 0.9) * 3;
    const petiole = (lx: number, ly: number, w: number) => {
      ctx.strokeStyle = css(mix(PAL.leaf.dark, PAL.leaf.base, 0.4)); ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(C + (lx - C) * 0.04, SURF + 4); ctx.quadraticCurveTo(C + (lx - C) * 0.35, Math.min(ly, SURF) - 40, lx, ly); ctx.stroke();
    };
    const back: [number, number, number, number, number][] = [[C - 96, 150, 0.82, -0.25, 1], [C + 104, 168, 0.78, 0.3, 2]];
    const front: [number, number, number, number, number][] = [[C - 196, 232, 0.95, -0.55, 0], [C + 200, 246, 0.9, 0.6, 1], [C - 30, 262, 0.62, 0.1, 2]];
    for (const [x, y, sc, r, v] of back) { petiole(x + sway, y, 5); stamp(ctx, spr["leaf" + v], x + sway, y, sc, r, 1, 0.74); }
    const ux = C + 14 + sway * 1.6, uy = 84;
    ctx.strokeStyle = css(PAL.leaf.dark); ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(C, SURF + 6); ctx.bezierCurveTo(C - 18, 230, C + 22, 150, ux, uy + 14); ctx.stroke();
    ctx.strokeStyle = css(PAL.leaf.light, 0.7); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(C - 3, SURF + 6); ctx.bezierCurveTo(C - 21, 230, C + 19, 150, ux - 3, uy + 14); ctx.stroke();
    for (const [x, y, sc, r, v] of front) { petiole(x - sway, y, 6); stamp(ctx, spr["leaf" + v], x - sway, y, sc, r, 1, 0.74); }
    drawRoots(ctx, roots, 0.55 + sm(p, 0, 0.18) * 0.45, { fill: "#fbf5ea", ink: "rgba(95,60,35,.55)", hair: sm(p, 0.52, 0.66) * 1.1, halo: sm(p, 0.27, 0.42) });
    const ex = sm(p, 0.02, 0.12) * (1 - sm(p, 0.3, 0.45) * 0.6);
    if (ex > 0.01) for (const e of exud) {
      const cyc = (t * e.sp + e.ph) % 1, d = cyc * 26;
      ctx.fillStyle = `rgba(214,160,40,${Math.sin(cyc * Math.PI) * 0.85 * ex})`;
      ctx.beginPath(); ctx.arc(e.x + Math.cos(e.a) * d, e.y + Math.sin(e.a) * d, e.s, 0, 6.28); ctx.fill();
    }
    const mb = sm(p, 0.26, 0.34);
    if (mb > 0.01) for (const m of microbes) {
      const st = sm(p, 0.28 + m.ph * 0.1, 0.44 + m.ph * 0.1);
      const jx = Math.sin(t * 2 + m.ph * 30) * (3 - st * 2), jy = Math.cos(t * 1.7 + m.ph * 20) * (3 - st * 2);
      const x = m.sx + (m.hx - m.sx) * st + jx, y = m.sy + (m.hy - m.sy) * st + jy;
      ctx.fillStyle = `rgba(80,140,240,${0.18 * mb})`; ctx.beginPath(); ctx.arc(x, y, m.s * 2.6, 0, 6.28); ctx.fill();
      ctx.fillStyle = `rgba(45,105,215,${0.9 * mb})`; ctx.beginPath(); ctx.arc(x, y, m.s, 0, 6.28); ctx.fill();
    }
    const nu = sm(p, 0.76, 0.86);
    if (nu > 0.01) for (const n of nutrients) {
      const cyc = (t * n.sp + n.off) % 1, len = n.r.pts.length;
      let x: number, y: number;
      if (cyc < 0.75) {
        const f = (1 - cyc / 0.75) * (len - 1), i = Math.floor(f), fr = f - i;
        const a = n.r.pts[i], b = n.r.pts[Math.min(len - 1, i + 1)];
        x = a.x + (b.x - a.x) * fr; y = a.y + (b.y - a.y) * fr;
      } else { const q = (cyc - 0.75) / 0.25; x = C + (n.r.pts[0].x - C) * (1 - q); y = SURF - q * 200; }
      ctx.fillStyle = n.fe ? `rgba(196,92,40,${0.9 * nu})` : `rgba(224,170,40,${0.95 * nu})`;
      ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 6.28); ctx.fill();
    }
    const bl = sm(p, 0.86, 0.98);
    // şemsiye: pedisellerin ucunda sarkık tomurcuklar
    if (bl < 0.6) for (let b = 0; b < 9; b++) {
      const a = -Math.PI / 2 + (b - 4) * 0.36, L = 26 + (b % 3) * 6, bx = ux + Math.cos(a) * L, by = uy + 16 + Math.sin(a) * L * 0.7;
      ctx.strokeStyle = css(PAL.leaf.base, 1 - sm(bl, 0, 0.6)); ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(ux, uy + 16); ctx.lineTo(bx, by); ctx.stroke();
      stamp(ctx, spr.bud, bx, by + 2, 1.35, Math.PI + (b - 4) * 0.28, 1 - sm(bl, 0, 0.6));
    }
    if (bl > 0.01) for (let i = 13; i >= 0; i--) {
      const a = i * 2.39996, d = Math.sqrt((i + 0.5) / 14), q = sm(bl, (1 - d) * 0.4, (1 - d) * 0.4 + 0.6);
      stamp(ctx, spr["f" + (i % 3)], ux + Math.cos(a) * d * 70 * q, uy + Math.sin(a) * d * 52 * q, q * (1.15 - d * 0.3), a, Math.min(1, q * 2));
    }
    ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(143,22,72,.22)"; ctx.beginPath(); ctx.arc(C, C, RAD + 6, 0, 6.28); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(143,22,72,.16)"; ctx.beginPath(); ctx.arc(C, C, RAD + 13, 0, 6.28); ctx.stroke();
  };
  return { resize, draw };
}

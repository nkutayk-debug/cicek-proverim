/* Orkide kök büyüteci. p (0..1): 0-.25 velamen suyu emer (kök gümüşiden yeşile) ·
   .25-.5 mavi bakteriler velamene yerleşir · .5-.75 yeni kök uçları · .75-1 besin yukarı + çiçek sapı. */
import { OPALS, barkChip, css, hex, mix, orchid, orchidBud, ovalLeaf, rng, sprite, stamp, type Sprite } from "./flora";
import { sm } from "./rootlens";

const V = 1000, C = 500, RAD = 486, TOP = 250;

export function createOrchidLens(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const R = rng(733);
  const inside = (x: number, y: number) => Math.hypot(x - C, y - C) < RAD - 30;
  // kökler: tepeden aşağı dolanan kalın yollar (son %28 = yeni uç)
  const roots = Array.from({ length: 4 }, (_, i) => {
    const pts: { x: number; y: number }[] = [];
    let x = C + (i - 1.5) * 34, y = TOP + 6, a = Math.PI / 2 + (i - 1.5) * 0.5;
    for (let k = 0; k < 40; k++) {
      a += (Math.PI / 2 - a) * 0.05 + (R() - 0.5) * 0.32;
      const nx = x + Math.cos(a) * 14, ny = y + Math.sin(a) * 14;
      if (!inside(nx, ny)) { a += Math.PI * 0.6 * (R() > 0.5 ? 1 : -1); continue; }
      x = nx; y = ny; pts.push({ x, y });
    }
    return pts;
  });
  const lenOf = (r: { x: number; y: number }[]) => r.length;
  const chips = Array.from({ length: 70 }, (_, i) => {
    let x = 0, y = 0;
    for (let tries = 0; tries < 20; tries++) { const a = R() * 6.28, d = Math.sqrt(R()) * RAD; x = C + Math.cos(a) * d; y = C + Math.sin(a) * d; if (y > TOP + 20) break; }
    return { x, y, w: 50 + R() * 46, rot: R() * 6.28, v: i % 6 };
  });
  const drops = Array.from({ length: 70 }, () => ({ x: C + (R() - 0.5) * 600, st: R() * 0.2, len: 0.06 + R() * 0.05, y1: TOP + 60 + R() * 520 }));
  const microbes = Array.from({ length: 260 }, () => {
    const r = roots[(R() * roots.length) | 0], p = r[(R() * Math.floor(r.length * 0.72)) | 0];
    const a = R() * 6.28, d = 17 + R() * 9;
    let sx = C + (R() - 0.5) * 860, sy = TOP + 40 + R() * 600;
    if (Math.hypot(sx - C, sy - C) > RAD) { sx = C + (sx - C) * 0.6; sy = C + (sy - C) * 0.6; }
    return { hx: p.x + Math.cos(a) * d, hy: p.y + Math.sin(a) * d, sx, sy, ph: R(), s: 1.6 + R() * 1.6 };
  });
  const nutrients = Array.from({ length: 70 }, () => ({ r: roots[(R() * roots.length) | 0], off: R(), sp: 0.12 + R() * 0.12, fe: R() > 0.6 }));

  let dpr = 1, k = 1;
  let spr: Record<string, Sprite> = {};
  let bg: HTMLCanvasElement | null = null;

  const resize = (w: number) => {
    dpr = Math.min(window.devicePixelRatio || 1, 2); k = w / V;
    c.width = Math.round(w * dpr); c.height = Math.round(w * dpr);
    const d = dpr * k;
    spr = {};
    for (let i = 0; i < 6; i++) spr["c" + i] = sprite("ol-c" + i, 100, d, [0.5, 0.5], (x, s) => barkChip(x, s * 0.9, i + 31));
    spr.leaf = sprite("ol-leaf", 420, d, [0.5, 0.94], (x, s) => ovalLeaf(x, s * 0.9, s * 0.22, { dark: hex("#16452a"), base: hex("#2f6e3a"), light: hex("#6da35a") }, { gloss: 1.4, tip: 1.5 }));
    spr.f = sprite("ol-f", 140, d, [0.5, 0.5], (x, s) => orchid(x, s * 0.44, OPALS.phalPink));
    spr.bud = sprite("ol-bud", 44, d, [0.5, 0.5], (x, s) => orchidBud(x, s * 0.3, OPALS.phalPink));
    bg = document.createElement("canvas"); bg.width = c.width; bg.height = c.height;
    const b = bg.getContext("2d")!;
    b.setTransform(d, 0, 0, d, 0, 0);
    b.save(); b.beginPath(); b.arc(C, C, RAD, 0, 6.28); b.clip();
    const air = b.createLinearGradient(0, 0, 0, TOP);
    air.addColorStop(0, "#ffffff"); air.addColorStop(1, "#f6f1fd");
    b.fillStyle = air; b.fillRect(0, 0, V, TOP + 10);
    b.fillStyle = "#4d3526"; b.fillRect(0, TOP, V, V);
    const G = rng(4);
    for (let i = 0; i < 500; i++) { b.fillStyle = G() > 0.8 ? "rgba(255,255,255,.18)" : "rgba(20,12,6,.35)"; b.beginPath(); b.arc(G() * V, TOP + G() * (V - TOP), 1 + G() * 2.5, 0, 6.28); b.fill(); }
    b.restore();
  };

  const draw = (p: number, t: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    if (bg) ctx.drawImage(bg, 0, 0);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.arc(C, C, RAD, 0, 6.28); ctx.clip();
    // arka kabuklar
    chips.forEach((ch, i) => { if (i % 2 === 0) stamp(ctx, spr["c" + ch.v], ch.x, ch.y, ch.w / 90, ch.rot); });
    // kökler
    const wetFront = sm(p, 0.04, 0.22);
    const grow = sm(p, 0.5, 0.72);
    const halo = sm(p, 0.27, 0.42);
    for (const r of roots) {
      const n = lenOf(r), base = Math.floor(n * 0.72), visible = base + Math.floor((n - base) * grow);
      if (halo > 0.01) {
        ctx.strokeStyle = `rgba(70,130,235,${0.12 * halo})`; ctx.lineWidth = 64; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); for (let i = 0; i < visible; i++) { if (i) ctx.lineTo(r[i].x, r[i].y); else ctx.moveTo(r[i].x, r[i].y); } ctx.stroke();
      }
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (let i = 1; i < visible; i++) {
        const a = r[i - 1], b2 = r[i];
        const f = i / n;
        const wet = Math.max(0, Math.min(1, (wetFront * 1.3 - f) * 4));
        const isTip = i >= base;
        ctx.strokeStyle = "rgba(60,48,30,.55)"; ctx.lineWidth = 32;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
        ctx.strokeStyle = css(isTip ? mix(hex("#b8dc7a"), hex("#8cc35a"), (i - base) / Math.max(1, n - base)) : mix(hex("#d6dbd0"), hex("#7fb064"), wet));
        ctx.lineWidth = isTip ? 28 - ((i - base) / Math.max(1, n - base)) * 8 : 29;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
      }
      // velamen parlaklığı
      ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 7;
      ctx.beginPath(); for (let i = 0; i < visible; i++) { if (i) ctx.lineTo(r[i].x - 7, r[i].y); else ctx.moveTo(r[i].x - 7, r[i].y); } ctx.stroke();
    }
    // ön kabuklar
    chips.forEach((ch, i) => { if (i % 2 === 1 && i % 4 === 1) stamp(ctx, spr["c" + ch.v], ch.x, ch.y, ch.w / 110, ch.rot); });
    // su damlaları
    const wd = sm(p, 0, 0.04) * (1 - sm(p, 0.24, 0.3));
    if (wd > 0.01) for (const d of drops) {
      const q = (p - d.st) / d.len;
      if (q < 0 || q > 1) continue;
      const y = 140 + q * (d.y1 - 140);
      ctx.fillStyle = `rgba(120,180,240,${0.85 * wd * (1 - q * 0.5)})`;
      ctx.beginPath(); ctx.ellipse(d.x, y, 5, 8, 0, 0, 6.28); ctx.fill();
    }
    // bakteriler
    const mb = sm(p, 0.26, 0.34);
    if (mb > 0.01) for (const m of microbes) {
      const st = sm(p, 0.28 + m.ph * 0.1, 0.44 + m.ph * 0.1);
      const jx = Math.sin(t * 2 + m.ph * 30) * (3 - st * 2), jy = Math.cos(t * 1.7 + m.ph * 20) * (3 - st * 2);
      const x = m.sx + (m.hx - m.sx) * st + jx, y = m.sy + (m.hy - m.sy) * st + jy;
      ctx.fillStyle = `rgba(80,140,240,${0.2 * mb})`; ctx.beginPath(); ctx.arc(x, y, m.s * 2.6, 0, 6.28); ctx.fill();
      ctx.fillStyle = `rgba(45,105,215,${0.92 * mb})`; ctx.beginPath(); ctx.arc(x, y, m.s, 0, 6.28); ctx.fill();
    }
    // besin yukarı
    const nu = sm(p, 0.76, 0.86);
    if (nu > 0.01) for (const n of nutrients) {
      const cyc = (t * n.sp + n.off) % 1, len = n.r.length;
      let x: number, y: number;
      if (cyc < 0.8) { const f = (1 - cyc / 0.8) * (len * 0.72 - 1), i = Math.floor(f), fr = f - i; const a = n.r[i], b2 = n.r[Math.min(len - 1, i + 1)]; x = a.x + (b2.x - a.x) * fr; y = a.y + (b2.y - a.y) * fr; }
      else { const q = (cyc - 0.8) / 0.2; x = n.r[0].x + (C - n.r[0].x) * q; y = TOP - q * 40; }
      ctx.fillStyle = n.fe ? `rgba(196,92,40,${0.9 * nu})` : `rgba(224,170,40,${0.95 * nu})`;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.28); ctx.fill();
    }
    // bitki tepesi: yapraklar + çiçek sapı
    stamp(ctx, spr.leaf, C, TOP + 8, 0.62, -1.68, 1, 0.75);
    stamp(ctx, spr.leaf, C, TOP + 8, 0.58, 1.62, 1, 0.75);
    const sp = sm(p, 0.8, 0.9);
    if (sp > 0.01) {
      const ex = C - 30 - 150 * sp, ey = TOP - 10 - 150 * sp;
      ctx.strokeStyle = "#5d7a3a"; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(C + 6, TOP); ctx.quadraticCurveTo(C - 10, ey + 20, ex, ey); ctx.stroke();
      const bl = sm(p, 0.88, 0.99);
      [[0.55, 0.9], [0.8, 0.8], [1, 0.7]].forEach(([f, s], i) => {
        const x = C + 6 + (ex - C - 6) * f, y = TOP + (ey - TOP) * f + 26;
        const o = sm(bl, i * 0.2, i * 0.2 + 0.6);
        stamp(ctx, spr.bud, x, y - 8, 1, 0, 1 - o);
        if (o > 0.01) stamp(ctx, spr.f, x, y, s * o, i * 0.3, o);
      });
    }
    ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(74,37,129,.22)"; ctx.beginPath(); ctx.arc(C, C, RAD + 6, 0, 6.28); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(74,37,129,.16)"; ctx.beginPath(); ctx.arc(C, C, RAD + 13, 0, 6.28); ctx.stroke();
  };
  return { resize, draw };
}

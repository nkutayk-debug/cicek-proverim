/* Kaktüs kök büyüteci (çakıllı mineral harç). p (0..1): 0-.25 su gelir, ince yağmur kökleri çıkar ·
   .25-.5 mavi bakteriler kök ve taş yüzeyine yerleşir · .5-.75 taş ufalanır, mineraller köke akar · .75-1 gövde dolgunlaşır. */
import { CTONE, cactusBody, css, hex, mix, rng, sprite, stamp, type LeafTone, type Sprite } from "./flora";
import { sm } from "./rootlens";

const V = 1000, C = 500, RAD = 486, TOP = 300;

export function createKaktusLens(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const R = rng(919);
  const inside = (x: number, y: number) => Math.hypot(x - C, y - C) < RAD - 30;
  // ana kökler: yanlara yayılan, sığ (kaktüs kökü)
  type Pt = { x: number; y: number };
  const grow = (x: number, y: number, a0: number, n: number, step: number, pull: number) => {
    const pts: Pt[] = [{ x, y }]; let a = a0;
    for (let k = 0; k < n; k++) {
      a += (a0 - a) * pull + (R() - 0.5) * 0.34;
      const nx = x + Math.cos(a) * step, ny = y + Math.sin(a) * step;
      if (!inside(nx, ny) || ny < TOP + 6) break;
      x = nx; y = ny; pts.push({ x, y });
    }
    return pts;
  };
  // ana kökler: sığ, yanlara yayılan; uca doğru incelir
  const mains = [-1.25, -0.72, -0.25, 0.22, 0.7, 1.2].map((o, i) => ({ pts: grow(C + (i - 2.5) * 20, TOP + 8, Math.PI / 2 + o, 44, 13, 0.05), w0: 24 }));
  const laterals = mains.flatMap((m) => [0.3, 0.55].map((fr) => { const p = m.pts[Math.floor(m.pts.length * fr)] ?? m.pts[0]; return { pts: grow(p.x, p.y, Math.PI / 2 + (R() - 0.5) * 2.2, 14, 11, 0.03), w0: 12 }; }));
  const roots = [...mains, ...laterals].filter((r) => r.pts.length > 3);
  const width = (r: { w0: number; pts: Pt[] }, i: number) => r.w0 * (1 - 0.62 * (i / r.pts.length));
  // yağmur kökleri: düzensiz aralıklarla, tek yana, farklı boy ve açıda ince beyaz kökler
  const hairs = roots.flatMap((r) => r.pts.flatMap((p, i) => {
    if (i < 3 || R() > 0.42) return [];
    const q = r.pts[Math.min(r.pts.length - 1, i + 1)], dx = q.x - p.x, dy = q.y - p.y, m = Math.hypot(dx, dy) || 1, s2 = R() > 0.5 ? 1 : -1;
    const a = Math.atan2((dx / m) * s2, (-dy / m) * s2) + (R() - 0.5) * 1.3;
    return [{ x: p.x, y: p.y, nx: Math.cos(a), ny: Math.sin(a), l: 10 + R() * 40, ph: R(), bend: (R() - 0.5) * 1.1, sub: R() > 0.6 }];
  }));
  const rocks = Array.from({ length: 9 }, () => {
    let x = 0, y = 0;
    for (let tries = 0; tries < 30; tries++) { const a = R() * 6.28, d = Math.sqrt(R()) * (RAD - 80); x = C + Math.cos(a) * d; y = C + Math.sin(a) * d; if (y > TOP + 60) break; }
    const n = 6 + ((R() * 3) | 0), r = 34 + R() * 34;
    return { x, y, pts: Array.from({ length: n }, (_, i) => { const a = (i / n) * 6.28 + R() * 0.4; return [Math.cos(a) * r * (0.7 + R() * 0.35), Math.sin(a) * r * 0.75 * (0.7 + R() * 0.35)] as [number, number]; }), shade: R() };
  });
  const grit = Array.from({ length: 520 }, () => { const a = R() * 6.28, d = Math.sqrt(R()) * RAD; return { x: C + Math.cos(a) * d, y: C + Math.sin(a) * d, r: 3 + R() * 8, k: R(), rot: R() * 3 }; }).filter((g) => g.y > TOP + 6);
  const drops = Array.from({ length: 70 }, () => ({ x: C + (R() - 0.5) * 620, st: R() * 0.16, len: 0.05 + R() * 0.04, y1: TOP + 40 + R() * 520 }));
  const microbes = Array.from({ length: 300 }, (_, i) => {
    let hx: number, hy: number;
    if (i % 3 === 0) { const rk = rocks[(R() * rocks.length) | 0], v = rk.pts[(R() * rk.pts.length) | 0]; hx = rk.x + v[0] * 1.05; hy = rk.y + v[1] * 1.05; }
    else { const r = roots[(R() * roots.length) | 0].pts, p = r[(R() * r.length) | 0], a = R() * 6.28, d = 10 + R() * 8; hx = p.x + Math.cos(a) * d; hy = p.y + Math.sin(a) * d; }
    let sx = C + (R() - 0.5) * 860, sy = TOP + 40 + R() * 620;
    if (Math.hypot(sx - C, sy - C) > RAD) { sx = C + (sx - C) * 0.6; sy = C + (sy - C) * 0.6; }
    return { hx, hy, sx, sy, ph: R(), s: 1.6 + R() * 1.6 };
  });
  const minerals = Array.from({ length: 90 }, () => {
    const rk = rocks[(R() * rocks.length) | 0];
    let best = roots[0].pts[0], bd = 1e9;
    for (const r of roots) for (const p of r.pts) { const d = Math.hypot(p.x - rk.x, p.y - rk.y); if (d < bd) { bd = d; best = p; } }
    return { rk, to: best, off: R(), sp: 0.18 + R() * 0.16, col: ["224,150,40", "160,90,200", "196,92,40", "90,170,90"][(R() * 4) | 0] };
  });
  const up = Array.from({ length: 60 }, () => ({ r: mains[(R() * mains.length) | 0].pts, off: R(), sp: 0.14 + R() * 0.12, col: ["224,150,40", "120,180,235", "196,92,40"][(R() * 3) | 0] }));

  let dpr = 1, k = 1;
  let spr: Record<string, Sprite> = {};
  let bg: HTMLCanvasElement | null = null;
  const pale = (t: LeafTone): LeafTone => ({ dark: mix(t.dark, CTONE.pale.dark, 0.6), base: mix(t.base, CTONE.pale.base, 0.6), light: mix(t.light, CTONE.pale.light, 0.6) });

  const resize = (w: number) => {
    dpr = Math.min(window.devicePixelRatio || 1, 2); k = w / V;
    c.width = Math.round(w * dpr); c.height = Math.round(w * dpr);
    const d = dpr * k;
    spr = {};
    spr.cf = sprite("kl-cf", 560, d, [0.5, 0.9], (x) => cactusBody(x, 440, 420, { tuber: true, rows: 220, spineLen: 30 }));
    spr.cp = sprite("kl-cp", 560, d, [0.5, 0.9], (x) => cactusBody(x, 440, 420, { tuber: true, rows: 220, spineLen: 30, tone: pale(CTONE.cactus) }));
    bg = document.createElement("canvas"); bg.width = c.width; bg.height = c.height;
    const b = bg.getContext("2d")!;
    b.setTransform(d, 0, 0, d, 0, 0);
    b.save(); b.beginPath(); b.arc(C, C, RAD, 0, 6.28); b.clip();
    const air = b.createLinearGradient(0, 0, 0, TOP);
    air.addColorStop(0, "#ffffff"); air.addColorStop(1, "#eef8f1");
    b.fillStyle = air; b.fillRect(0, 0, V, TOP + 10);
    b.fillStyle = "#b99c78"; b.fillRect(0, TOP, V, V);
    for (const g of grit) {
      b.fillStyle = g.k > 0.7 ? "#f4f2ec" : g.k > 0.45 ? "#9d978c" : g.k > 0.2 ? "#d2b98f" : "#7d6248";
      b.strokeStyle = "rgba(58,40,24,.25)"; b.lineWidth = 1;
      b.beginPath(); b.ellipse(g.x, g.y, g.r, g.r * 0.72, g.rot, 0, 6.28); b.fill(); b.stroke();
    }
    b.restore();
  };

  const rock = (rk: (typeof rocks)[number], scale: number) => {
    ctx.beginPath(); rk.pts.forEach(([x, y], i) => (i ? ctx.lineTo(rk.x + x * scale, rk.y + y * scale) : ctx.moveTo(rk.x + x * scale, rk.y + y * scale))); ctx.closePath();
    const g = ctx.createLinearGradient(rk.x - 40, rk.y - 40, rk.x + 40, rk.y + 40);
    g.addColorStop(0, css(mix(hex("#c9c4bb"), hex("#9a948a"), rk.shade))); g.addColorStop(1, css(mix(hex("#7c766d"), hex("#5d5852"), rk.shade)));
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = "rgba(40,30,20,.45)"; ctx.lineWidth = 2; ctx.stroke();
  };

  const draw = (p: number, t: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    if (bg) ctx.drawImage(bg, 0, 0);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.arc(C, C, RAD, 0, 6.28); ctx.clip();
    // ıslanma cephesi
    const wet = sm(p, 0.03, 0.2) * (1 - sm(p, 0.86, 1) * 0.4);
    if (wet > 0.01) {
      const front = TOP + (V - TOP) * Math.min(1, sm(p, 0.03, 0.2) * 1.1);
      const g = ctx.createLinearGradient(0, TOP, 0, front);
      g.addColorStop(0, `rgba(60,40,24,${0.4 * wet})`); g.addColorStop(0.85, `rgba(60,40,24,${0.3 * wet})`); g.addColorStop(1, "rgba(60,40,24,0)");
      ctx.fillStyle = g; ctx.fillRect(0, TOP, V, front - TOP);
    }
    // taşlar (ufalanır)
    const erode = sm(p, 0.52, 0.74);
    for (const rk of rocks) {
      rock(rk, 1 - erode * 0.16);
      if (erode > 0.01 && erode < 1) for (let i = 0; i < 5; i++) { const v = rk.pts[i % rk.pts.length], q = (t * 0.6 + i * 0.2) % 1; ctx.fillStyle = `rgba(150,144,134,${(1 - q) * 0.8})`; ctx.beginPath(); ctx.arc(rk.x + v[0] * (1 + q * 0.6), rk.y + v[1] * (1 + q * 0.6) + q * 10, 3, 0, 6.28); ctx.fill(); }
    }
    // bakteri katmanı
    const halo = sm(p, 0.3, 0.46);
    // ana kökler
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const seg = (r: (typeof roots)[number], add: number, k2: number, dx = 0, dy = 0) => { for (let i = 1; i < r.pts.length; i++) { ctx.lineWidth = width(r, i) * k2 + add; ctx.beginPath(); ctx.moveTo(r.pts[i - 1].x + dx, r.pts[i - 1].y + dy); ctx.lineTo(r.pts[i].x + dx, r.pts[i].y + dy); ctx.stroke(); } };
    if (halo > 0.01) { ctx.strokeStyle = `rgba(70,130,235,${0.13 * halo})`; for (const r of roots) seg(r, 30, 1); }
    ctx.strokeStyle = "rgba(60,44,26,.6)"; for (const r of roots) seg(r, 5, 1);
    ctx.strokeStyle = css(mix(hex("#dccba4"), hex("#c9b088"), wet)); for (const r of roots) seg(r, 0, 1);
    ctx.strokeStyle = "rgba(255,250,236,.45)"; for (const r of roots) seg(r, 0, 0.22, -4, -3);
    // yağmur kökleri
    const rr = sm(p, 0.07, 0.24);
    if (rr > 0.01) {
      ctx.lineCap = "round";
      for (const h of hairs) {
        const g = sm(rr, h.ph * 0.5, h.ph * 0.5 + 0.5); if (g <= 0.01) continue;
        const L = h.l * g, ex = h.x + h.nx * L + h.ny * h.bend * L * 0.5, ey = h.y + h.ny * L - h.nx * h.bend * L * 0.5;
        const mx = h.x + h.nx * L * 0.55, my = h.y + h.ny * L * 0.55;
        ctx.strokeStyle = "rgba(90,70,40,.3)"; ctx.lineWidth = 4.4; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
        ctx.strokeStyle = "#fbf8ee"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
        if (h.sub && L > 20) { ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + (h.nx - h.ny) * L * 0.3, my + (h.ny + h.nx) * L * 0.3); ctx.stroke(); }
        ctx.fillStyle = "#eaf7de"; ctx.beginPath(); ctx.arc(ex, ey, 2, 0, 6.28); ctx.fill();
      }
    }
    // su damlaları
    const wd = sm(p, 0, 0.03) * (1 - sm(p, 0.2, 0.26));
    if (wd > 0.01) for (const d of drops) {
      const q = (p - d.st) / d.len;
      if (q < 0 || q > 1) continue;
      const y = 120 + q * (d.y1 - 120);
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
    // mineraller: taştan köke
    const mi = sm(p, 0.52, 0.6) * (1 - sm(p, 0.9, 1) * 0.6);
    if (mi > 0.01) for (const m of minerals) {
      const q = (t * m.sp + m.off) % 1;
      const x = m.rk.x + (m.to.x - m.rk.x) * q, y = m.rk.y + (m.to.y - m.rk.y) * q + Math.sin(q * 6 + m.off * 9) * 6;
      const ma = mi * Math.min(1, q * 4) * Math.min(1, (1 - q) * 4);
      ctx.fillStyle = `rgba(${m.col},${0.25 * ma})`; ctx.beginPath(); ctx.arc(x, y, 11, 0, 6.28); ctx.fill();
      ctx.fillStyle = `rgba(${m.col},${0.95 * ma})`; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 6.28); ctx.fill();
    }
    // kökten gövdeye akış
    const fl = sm(p, 0.74, 0.84);
    if (fl > 0.01) for (const n of up) {
      const cyc = (t * n.sp + n.off) % 1, len = n.r.length;
      let x: number, y: number;
      if (cyc < 0.8) { const f = (1 - cyc / 0.8) * (len - 1), i = Math.floor(f), fr = f - i; const a = n.r[i], b2 = n.r[Math.min(len - 1, i + 1)]; x = a.x + (b2.x - a.x) * fr; y = a.y + (b2.y - a.y) * fr; }
      else { const q = (cyc - 0.8) / 0.2; x = n.r[0].x + (C - n.r[0].x) * q; y = TOP - q * 60; }
      ctx.fillStyle = `rgba(${n.col},${0.95 * fl})`; ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.28); ctx.fill();
    }
    // gövde
    const plump = sm(p, 0.78, 0.96);
    stamp(ctx, spr.cp, C, TOP + 14, 1, 0, 1);
    stamp(ctx, spr.cf, C, TOP + 14, 1 + plump * 0.03, 0, 0.35 + plump * 0.65);
    ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(29,94,53,.24)"; ctx.beginPath(); ctx.arc(C, C, RAD + 6, 0, 6.28); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(29,94,53,.16)"; ctx.beginPath(); ctx.arc(C, C, RAD + 13, 0, 6.28); ctx.stroke();
  };
  return { resize, draw };
}

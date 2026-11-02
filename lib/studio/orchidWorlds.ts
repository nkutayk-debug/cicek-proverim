/* Orkide filmi dünyaları: (1) pencere önünde şeffaf saksıda orkide, (2) kabuk harç içinde velamen kökler. */
import { OPALS, barkChip, css, hex, mix, orchidBud, ovalLeaf, rng, sprite, stamp, type RGB, type Sprite } from "../flora";
import { W, H, lerp, sm, outCubic } from "./fx";

type Cam = { x: number; y: number; z: number; r: number };

export function createOrchidWorld(win: HTMLCanvasElement, lctx: CanvasRenderingContext2D, lay: HTMLCanvasElement) {
  const R = rng(515);
  const POT = { x: 540, top: 1080, h: 420, wTop: 390, wBot: 318 };
  const CROWN = { x: 540, y: 1094 };
  const SP = { x0: 560, y0: 1084, x1: 570, y1: 560, cx: 720, cy: 330, x2: 880, y2: 610 };
  const spikeAt = (t: number) => {
    if (t < 0.42) { const q = t / 0.42; return { x: SP.x0 + (SP.x1 - SP.x0) * q, y: SP.y0 + (SP.y1 - SP.y0) * q }; }
    const q = (t - 0.42) / 0.58, a = 1 - q;
    return { x: a * a * SP.x1 + 2 * a * q * SP.cx + q * q * SP.x2, y: a * a * SP.y1 + 2 * a * q * SP.cy + q * q * SP.y2 };
  };
  const budsT = [0.52, 0.62, 0.71, 0.79, 0.86, 0.92, 0.97, 1];
  const f = spikeAt(0.8);
  const FOCUS = { x: f.x, y: f.y + 40 };
  const S: Record<string, Sprite> = {};
  const lush = { dark: hex("#16452a"), base: hex("#2f6e3a"), light: hex("#6da35a") };
  const tired = { dark: hex("#5f6b3a"), base: hex("#8e9a55"), light: hex("#c3c182") };
  for (let i = 0; i < 4; i++) {
    S["l" + i] = sprite("ow-l" + i, 520, 1.6, [0.5, 0.94], (x, s) => ovalLeaf(x, s * 0.9, s * 0.22, lush, { gloss: 1.4, tip: 1.4 }));
    S["t" + i] = sprite("ow-t" + i, 520, 1.6, [0.5, 0.94], (x, s) => {
      ovalLeaf(x, s * 0.9, s * 0.22, tired, { gloss: 0.3, tip: 1.4 });
      x.strokeStyle = "rgba(80,70,30,.25)"; x.lineWidth = s * 0.005;
      for (let q = 0; q < 7; q++) { const y = -s * (0.12 + q * 0.11); x.beginPath(); x.moveTo(-s * 0.08, y); x.quadraticCurveTo(0, y - s * 0.03, s * 0.08, y + s * 0.01); x.stroke(); }
    });
  }
  S.bud = sprite("ow-bud", 60, 7, [0.5, 0.5], (x, s) => orchidBud(x, s * 0.3, OPALS.phalPink));
  for (let i = 0; i < 6; i++) S["c" + i] = sprite("ow-c" + i, 90, 1.6, [0.5, 0.5], (x, s) => barkChip(x, s * 0.85, i + 40));
  const chips = Array.from({ length: 46 }, (_, i) => ({ x: (R() - 0.5) * 0.86, y: R(), w: 36 + R() * 30, rot: R() * 6, v: i % 6 }));
  const roots = Array.from({ length: 6 }, (_, i) => {
    const pts: [number, number][] = []; let x = CROWN.x + (i - 2.5) * 22, y = CROWN.y + 20, a = Math.PI / 2 + (i - 2.5) * 0.28;
    for (let k = 0; k < 16; k++) { a += (Math.PI / 2 - a) * 0.12 + (R() - 0.5) * 0.5; x += Math.cos(a) * 26; y += Math.sin(a) * 26; const t = (y - POT.top) / POT.h, half = (POT.wTop / 2) * (1 - t) + (POT.wBot / 2) * t - 20; x = Math.max(POT.x - half, Math.min(POT.x + half, x)); if (y > POT.top + POT.h - 20) break; pts.push([x, y]); }
    return pts;
  });
  const aerial = [
    [[CROWN.x - 30, CROWN.y + 6], [POT.x - 250, CROWN.y - 50], [POT.x - 260, POT.top + 90], [POT.x - 222, POT.top + 230]],
    [[CROWN.x + 36, CROWN.y + 4], [POT.x + 270, CROWN.y - 80], [POT.x + 245, POT.top + 50], [POT.x + 210, POT.top + 170]],
  ];
  const rootCol: RGB = hex("#d4d9cc");

  const draw = (c: CanvasRenderingContext2D, t: number, cam: Cam, st: { vigor: number; leafBlur: number; cloud: number }) => {
    c.save();
    c.save();
    c.translate(W / 2, H / 2); c.scale(1 + (cam.z - 1) * 0.25, 1 + (cam.z - 1) * 0.25); c.translate(-W / 2 - (cam.x - W / 2) * 0.25, -H / 2 - (cam.y - 1100) * 0.25);
    c.drawImage(win, 0, 0);
    c.restore();
    c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.rotate(cam.r); c.translate(-cam.x, -cam.y);
    // saksı içi
    const potPath = () => { c.beginPath(); c.moveTo(POT.x - POT.wTop / 2, POT.top); c.lineTo(POT.x - POT.wBot / 2, POT.top + POT.h); c.quadraticCurveTo(POT.x, POT.top + POT.h + 12, POT.x + POT.wBot / 2, POT.top + POT.h); c.lineTo(POT.x + POT.wTop / 2, POT.top); c.closePath(); };
    c.save(); potPath(); c.clip();
    c.fillStyle = "rgba(150,115,85,.4)"; c.fillRect(POT.x - 220, POT.top + 20, 440, POT.h);
    chips.slice(0, 22).forEach((ch) => stamp(c, S["c" + ch.v], POT.x + ch.x * POT.wTop, POT.top + 26 + ch.y * (POT.h - 36), ch.w / 76, ch.rot));
    for (const r of roots) {
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "rgba(70,60,40,.5)"; c.lineWidth = 17; c.beginPath(); r.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      c.strokeStyle = css(rootCol); c.lineWidth = 13; c.beginPath(); r.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    }
    chips.slice(22).forEach((ch) => stamp(c, S["c" + ch.v], POT.x + ch.x * POT.wTop, POT.top + 26 + ch.y * (POT.h - 36), ch.w / 76, ch.rot));
    c.restore();
    potPath(); c.fillStyle = "rgba(225,235,242,.26)"; c.fill(); c.strokeStyle = "rgba(120,140,160,.55)"; c.lineWidth = 3; c.stroke();
    c.strokeStyle = "rgba(255,255,255,.75)"; c.lineWidth = 9; c.beginPath(); c.moveTo(POT.x - POT.wTop / 2 + 28, POT.top + 44); c.lineTo(POT.x - POT.wBot / 2 + 28, POT.top + POT.h - 36); c.stroke();
    c.fillStyle = "rgba(235,242,248,.75)"; c.strokeStyle = "rgba(120,140,160,.55)"; c.lineWidth = 3; c.beginPath(); c.roundRect(POT.x - POT.wTop / 2 - 12, POT.top - 8, POT.wTop + 24, 24, 7); c.fill(); c.stroke();
    // yapraklar (alan derinliği katmanı) + sap + tomurcuklar
    const leafLayer = (front: boolean) => {
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); lctx.setTransform(c.getTransform());
      const leaf = (i: number, rot: number, scl: number) => {
        const droop = (1 - st.vigor) * 0.3 * Math.sign(rot), r = rot + droop + Math.sin(t * 0.8 + i) * 0.012;
        stamp(lctx, S["t" + i], CROWN.x, CROWN.y, scl, r, 1, 0.8);
        stamp(lctx, S["l" + i], CROWN.x, CROWN.y, scl, r, st.vigor, 0.8);
      };
      if (front) { leaf(0, -1.62, 0.82); leaf(1, 1.56, 0.78); }
      else {
        leaf(2, -1.05, 0.66); leaf(3, 1.1, 0.62);
        lctx.strokeStyle = "#c9a46a"; lctx.lineWidth = 9; lctx.lineCap = "round"; lctx.beginPath(); lctx.moveTo(SP.x0 + 14, POT.top + 80); lctx.lineTo(SP.x1 + 12, SP.y1 - 14); lctx.stroke();
      }
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = st.leafBlur > 0.3 ? `blur(${st.leafBlur.toFixed(1)}px)` : "none"; c.drawImage(lay, 0, 0); c.restore();
    };
    leafLayer(false);
    c.strokeStyle = css(mix(hex("#5d7a3a"), hex("#7a5a3a"), 0.25)); c.lineWidth = 8; c.lineCap = "round";
    c.beginPath(); for (let i = 0; i <= 50; i++) { const p = spikeAt(i / 50); const sw = i > 21 ? Math.sin(t * 0.8) * 8 * ((i - 21) / 29) : 0; if (i) c.lineTo(p.x + sw, p.y); else c.moveTo(p.x, p.y); } c.stroke();
    budsT.forEach((bt, i) => {
      const p = spikeAt(bt), sw = Math.sin(t * 0.8) * 8 * Math.max(0, (bt - 0.42) / 0.58);
      c.strokeStyle = "#6f8a45"; c.lineWidth = 3.5; c.beginPath(); c.moveTo(p.x + sw, p.y); c.quadraticCurveTo(p.x + sw + 8, p.y + 18, p.x + sw, p.y + 34); c.stroke();
      stamp(c, S.bud, p.x + sw, p.y + 44, 1.1 - i * 0.05, Math.sin(t + i) * 0.05, 1);
    });
    leafLayer(true);
    for (const pth of aerial) {
      c.lineCap = "round";
      c.strokeStyle = "rgba(70,60,40,.45)"; c.lineWidth = 17; c.beginPath(); c.moveTo(pth[0][0], pth[0][1]); c.bezierCurveTo(pth[1][0], pth[1][1], pth[2][0], pth[2][1], pth[3][0], pth[3][1]); c.stroke();
      c.strokeStyle = css(rootCol); c.lineWidth = 13; c.beginPath(); c.moveTo(pth[0][0], pth[0][1]); c.bezierCurveTo(pth[1][0], pth[1][1], pth[2][0], pth[2][1], pth[3][0], pth[3][1]); c.stroke();
      c.fillStyle = "#9cc56a"; c.beginPath(); c.arc(pth[3][0], pth[3][1], 8, 0, 6.28); c.fill();
    }
    c.restore();
    if (st.cloud > 0.01) { const x = lerp(-W * 0.6, W * 1.6, st.cloud); const g = c.createRadialGradient(x, H * 0.45, 0, x, H * 0.45, W * 0.9); g.addColorStop(0, "rgba(60,70,110,.32)"); g.addColorStop(1, "rgba(60,70,110,0)"); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  };
  return { draw, FOCUS, POT };
}

/* -------------------------------------------------------------------------- */
export function createBarkWorld(lctx: CanvasRenderingContext2D, lay: HTMLCanvasElement) {
  const R = rng(606);
  const S: Record<string, Sprite> = {};
  for (let i = 0; i < 6; i++) S["c" + i] = sprite("bw-c" + i, 260, 1.4, [0.5, 0.5], (x, s) => barkChip(x, s * 0.9, i + 60));
  const chips = Array.from({ length: 90 }, (_, i) => ({ x: R() * W, y: R() * 3000 - 200, w: 120 + R() * 160, rot: R() * 6.28, v: i % 6, z: R() }));
  const roots = Array.from({ length: 4 }, (_, i) => {
    const pts: { x: number; y: number }[] = []; let x = W * (0.2 + i * 0.2), y = -150, a = Math.PI / 2 + (R() - 0.5) * 0.4;
    for (let k = 0; k < 110; k++) { a += (Math.PI / 2 - a) * 0.04 + (R() - 0.5) * 0.18; x += Math.cos(a) * 28; y += Math.sin(a) * 28; if (x < 80) a = 0.3; if (x > W - 80) a = Math.PI - 0.3; pts.push({ x, y }); }
    return pts;
  });
  const drops = Array.from({ length: 120 }, () => ({ x: R() * W, st: R() * 1.8, sp: 1500 + R() * 900 }));
  const microbes = Array.from({ length: 260 }, () => { const r = roots[(R() * roots.length) | 0], p = r[(R() * Math.floor(r.length * 0.75)) | 0], a = R() * 6.28, d = 30 + R() * 16; return { hx: p.x + Math.cos(a) * d, hy: p.y + Math.sin(a) * d, sx: R() * W, sy: p.y + (R() - 0.5) * 900, d0: R() * 1.2, s: 2.4 + R() * 2.6 }; });
  const nutr = Array.from({ length: 130 }, () => ({ r: roots[(R() * roots.length) | 0], off: R(), sp: 0.25 + R() * 0.3, fe: R() > 0.62 }));
  const rush = Array.from({ length: 160 }, () => ({ x: R() * W, y: R(), l: 60 + R() * 260, w: 1 + R() * 3, c: R() }));

  const draw = (c: CanvasRenderingContext2D, u: number, camY: number, speed: number) => {
    const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#4a3324"); bg.addColorStop(1, "#24170f");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    // uzak kabuklar (bulanık)
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); lctx.translate(0, -camY * 0.5);
    for (const ch of chips) if (ch.z < 0.45) stamp(lctx, S["c" + ch.v], ch.x, ch.y, ch.w / 260 * 0.8, ch.rot, 0.8);
    c.save(); c.filter = "blur(8px) brightness(.8)"; c.drawImage(lay, 0, 0); c.restore();
    c.save(); c.translate(0, -camY);
    // kökler: ıslanma cephesi yukarıdan aşağı; yeni yeşil uçlar
    const wetFront = sm(u, 0.2, 2.2), grow = sm(u, 3.3, 5.0), halo = sm(u, 2.0, 3.6);
    for (const r of roots) {
      const n = r.length, base = Math.floor(n * 0.75), vis = base + Math.floor((n - base) * grow);
      if (halo > 0.01) { c.strokeStyle = `rgba(80,140,255,${0.14 * halo})`; c.lineWidth = 110; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); for (let i = 0; i < vis; i++) (i ? c.lineTo(r[i].x, r[i].y) : c.moveTo(r[i].x, r[i].y)); c.stroke(); }
      // tek parça yollar: koyu kontur → gümüşi gövde → ıslak (yeşil) bölüm → yeni uç
      const path = (from: number, to: number) => { c.beginPath(); for (let i = from; i < to; i++) (i === from ? c.moveTo(r[i].x, r[i].y) : c.lineTo(r[i].x, r[i].y)); };
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "rgba(40,30,18,.6)"; c.lineWidth = 58; path(0, vis); c.stroke();
      c.strokeStyle = "#d6dbd0"; c.lineWidth = 52; path(0, Math.min(vis, base + 1)); c.stroke();
      const wetIdx = Math.floor(Math.min(1, wetFront * 1.25) * base);
      for (const [extra, al] of [[6, 0.35], [3, 0.6], [0, 1]] as const) {
        const to = Math.min(base + 1, wetIdx + extra);
        if (to > 1) { c.strokeStyle = `rgba(121,173,96,${al})`; c.lineWidth = 52; path(0, to); c.stroke(); }
      }
      if (vis > base) { c.strokeStyle = "#a6d36c"; c.lineWidth = 46; path(base - 1, vis); c.stroke(); c.strokeStyle = "rgba(200,235,140,.8)"; c.lineWidth = 30; path(Math.max(base, vis - 4), vis); c.stroke(); }
      // velamen dokusu: ince boyuna çizgiler
      c.strokeStyle = "rgba(255,255,255,.16)"; c.lineWidth = 3;
      for (const off of [-16, 8, 18]) { c.beginPath(); for (let i = 0; i < vis; i++) (i ? c.lineTo(r[i].x + off, r[i].y) : c.moveTo(r[i].x + off, r[i].y)); c.stroke(); }
      c.strokeStyle = "rgba(255,255,255,.38)"; c.lineWidth = 12; c.beginPath(); for (let i = 0; i < vis; i++) (i ? c.lineTo(r[i].x - 13, r[i].y) : c.moveTo(r[i].x - 13, r[i].y)); c.stroke();
    }
    // su damlaları
    const wd = 1 - sm(u, 2.2, 2.8);
    if (wd > 0.01) for (const d of drops) { const a = u - d.st; if (a < 0 || a > 1) continue; const y = camY - 100 + a * d.sp; c.fillStyle = `rgba(150,200,250,${0.85 * wd * (1 - a)})`; c.beginPath(); c.ellipse(d.x, y, 7, 13, 0, 0, 6.28); c.fill(); c.fillStyle = `rgba(255,255,255,${0.7 * wd * (1 - a)})`; c.beginPath(); c.arc(d.x - 2, y - 4, 2.5, 0, 6.28); c.fill(); }
    // bakteriler
    const mb = sm(u, 1.8, 2.3);
    if (mb > 0.01) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const m of microbes) {
        const st = outCubic((u - 1.8 - m.d0) / 1.5);
        const x = lerp(m.sx, m.hx, st), y = lerp(m.sy, m.hy, st);
        if (st < 1) { const px = lerp(m.sx, m.hx, Math.max(0, st - 0.12)), py = lerp(m.sy, m.hy, Math.max(0, st - 0.12)); c.strokeStyle = `rgba(90,150,255,${0.35 * mb})`; c.lineWidth = m.s * 0.9; c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke(); }
        c.fillStyle = `rgba(80,140,255,${0.18 * mb})`; c.beginPath(); c.arc(x, y, m.s * 2.4, 0, 6.28); c.fill();
        c.fillStyle = `rgba(150,195,255,${0.95 * mb})`; c.beginPath(); c.arc(x, y, m.s, 0, 6.28); c.fill();
      }
      c.restore();
    }
    // besin akışı
    const nu = sm(u, 4.9, 5.6);
    if (nu > 0.01) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const n of nutr) {
        const cyc = (u * n.sp + n.off) % 1, len = Math.floor(n.r.length * 0.75);
        const f2 = (1 - cyc) * (len - 1), i = Math.floor(f2), fr = f2 - i;
        const a = n.r[i], b = n.r[Math.min(len - 1, i + 1)];
        const x = a.x + (b.x - a.x) * fr, y = a.y + (b.y - a.y) * fr;
        const col = n.fe ? "255,140,70" : "255,205,80";
        c.strokeStyle = `rgba(${col},${0.5 * nu})`; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 30 + speed * 0.5); c.stroke();
        c.fillStyle = `rgba(${col},${0.95 * nu})`; c.beginPath(); c.arc(x, y, 6, 0, 6.28); c.fill();
      }
      c.restore();
    }
    c.restore();
    // yakın kabuklar (bulanık, hızlı paralaks)
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); lctx.translate(0, -camY * 1.5);
    for (const ch of chips) if (ch.z > 0.85) stamp(lctx, S["c" + ch.v], ch.x, ch.y, ch.w / 260 * 1.8, ch.rot, 1);
    c.save(); c.filter = "blur(14px)"; c.drawImage(lay, 0, 0); c.restore();
    if (speed > 2) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const s of rush) { const y = ((s.y * H + camY * 2.2) % (H + 400)) - 200; c.strokeStyle = s.c > 0.6 ? `rgba(255,205,90,${Math.min(0.6, speed / 60)})` : `rgba(255,235,210,${Math.min(0.35, speed / 90)})`; c.lineWidth = s.w; c.beginPath(); c.moveTo(s.x, y); c.lineTo(s.x, y + s.l * Math.min(3, speed / 14)); c.stroke(); }
      c.restore();
    }
  };
  return { draw };
}

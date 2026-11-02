/* Kaktüs & sukulent filmi dünyaları:
   (1) pencere önünde geniş toprak kasede sütun kaktüs, aloe, top kaktüs (tomurcuklu taç), eşeverya, haworthia;
   (2) çakıllı mineral harç: yağmur kökleri, mavi bakteriler, taştan çözülen mineraller. */
import { CTONE, aloe, cactusBody, cactusBud, cactusTube, colProf, crownRing, css, echeveria, haworthia, hex, mix, rng, sprite, stamp, type LeafTone, type Sprite } from "../flora";
import { W, H, lerp, sm, outCubic } from "./fx";

type Cam = { x: number; y: number; z: number; r: number };
const pale = (t: LeafTone, k = 0.62): LeafTone => ({ dark: mix(t.dark, CTONE.pale.dark, k), base: mix(t.base, CTONE.pale.base, k), light: mix(t.light, CTONE.pale.light, k) });

export function createKaktusWorld(lctx: CanvasRenderingContext2D, lay: HTMLCanvasElement) {
  const R = rng(4242);
  const BOWL = { x: 540, y: 1190, rx: 430, ry: 58, depth: 250, bot: 300 };
  const CER = { x: 360, y: 1196, w: 150, h: 760, ax: 150, ay: -300, aw: 112, ah: 330 };
  const MAM = { x: 592, y: 1238, w: 290, h: 272 };
  const ALO = { x: 770, y: 1182, s: 560 };
  const ECH = { x: 830, y: 1232, r: 190 };
  const HAW = { x: 214, y: 1248, s: 340 };
  const ring = crownRing(MAM.w, MAM.h, 12);
  const FOCUS = { x: MAM.x, y: MAM.y - MAM.h * 0.8 };
  const POT = { top: BOWL.y - 130 };

  // pencere arka planı (önceden bulanık, yeşil-beyaz oda)
  const win = document.createElement("canvas"); win.width = W; win.height = H;
  {
    const w = win.getContext("2d")!;
    const g = w.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#f3f7f1"); g.addColorStop(1, "#e7efe8");
    w.fillStyle = g; w.fillRect(0, 0, W, H);
    w.filter = "blur(14px)";
    const sky = w.createLinearGradient(0, 160, 0, 1250); sky.addColorStop(0, "#cfe6f6"); sky.addColorStop(1, "#fff4e0");
    w.fillStyle = sky; w.fillRect(110, 150, 860, 1120);
    const sun = w.createRadialGradient(800, 360, 0, 800, 360, 460); sun.addColorStop(0, "rgba(255,238,190,1)"); sun.addColorStop(1, "rgba(255,238,190,0)");
    w.fillStyle = sun; w.fillRect(110, 150, 860, 1120);
    w.fillStyle = "rgba(150,186,140,.5)"; for (let i = 0; i < 9; i++) { w.beginPath(); w.arc(150 + i * 100, 1190 - (i % 3) * 30, 90, 0, 6.28); w.fill(); }
    w.strokeStyle = "#f4f6f2"; w.lineWidth = 36; w.strokeRect(110, 150, 860, 1120);
    w.lineWidth = 22; w.beginPath(); w.moveTo(540, 150); w.lineTo(540, 1270); w.moveTo(110, 700); w.lineTo(970, 700); w.stroke();
    w.filter = "none";
    w.fillStyle = "#f8faf6"; w.fillRect(0, 1436, W, 70);
    w.fillStyle = "rgba(60,90,70,.12)"; w.fillRect(0, 1506, W, 12);
    const wall = w.createLinearGradient(0, 1518, 0, H); wall.addColorStop(0, "#e6eee7"); wall.addColorStop(1, "#dbe6dd"); w.fillStyle = wall; w.fillRect(0, 1518, W, H);
  }

  const S: Record<string, Sprite> = {};
  for (const v of ["f", "t"] as const) {
    const tired = v === "t";
    const ct = tired ? pale(CTONE.cactus) : CTONE.cactus;
    S["cer" + v] = sprite("kw-cer" + v, 1000, 1.6, [0.3, 0.88], (x) => {
      cactusTube(x, [CER.w * 0.2, CER.ay + CER.aw * 0.55, CER.ax, CER.ay + CER.aw * 0.62, CER.ax, CER.ay - CER.aw * 0.1], CER.aw * 0.96, ct);
      x.save(); x.translate(CER.ax, CER.ay); cactusBody(x, CER.aw, CER.ah, { prof: colProf(0.18), ribs: 8, seed: 7, rot: 0.3, tone: ct, spineLen: 12 }); x.restore();
      cactusBody(x, CER.w, CER.h, { prof: colProf(0.1), ribs: 9, seed: 5, tone: ct, spineLen: 14 });
    });
    S["mam" + v] = sprite("kw-mam" + v, 380, 4, [0.5, 0.84], (x) => cactusBody(x, MAM.w, MAM.h, { tuber: true, rows: 230, spine: "rgba(252,250,240,.92)", spineLen: MAM.w * 0.07, spineW: 0.45, tone: tired ? pale(CTONE.cactus, 0.5) : CTONE.cactus }));
    S["alo" + v] = sprite("kw-alo" + v, 760, 1.6, [0.5, 0.86], (x) => aloe(x, ALO.s, tired ? pale(CTONE.aloe, 0.55) : CTONE.aloe));
    S["haw" + v] = sprite("kw-haw" + v, 460, 1.6, [0.5, 0.86], (x) => haworthia(x, HAW.s));
    S["ech" + v] = sprite("kw-ech" + v, 440, 2, [0.5, 0.5], (x, s) => echeveria(x, s * 0.43, 6, tired ? { blush: 0.05, pale: 0.6, open: 0.55 } : { blush: 0.6 }));
  }
  S.bud = sprite("kw-bud", 60, 8, [0.5, 0.8], (x, s) => cactusBud(x, s * 0.62));
  S.bowl = sprite("kw-bowl", 1000, 1.4, [0.5, 0.3], (x) => {
    const { rx, ry, depth, bot } = BOWL;
    x.beginPath(); x.moveTo(-rx, 0); x.bezierCurveTo(-rx, depth * 0.55, -bot - 40, depth, -bot, depth); x.lineTo(bot, depth); x.bezierCurveTo(bot + 40, depth, rx, depth * 0.55, rx, 0); x.closePath();
    const g = x.createLinearGradient(-rx, 0, rx, 0);
    g.addColorStop(0, "#e7a77a"); g.addColorStop(0.3, "#d2804f"); g.addColorStop(0.72, "#b15c34"); g.addColorStop(1, "#7f3c22");
    x.fillStyle = g; x.fill(); x.strokeStyle = "rgba(58,22,46,.3)"; x.lineWidth = 2; x.stroke();
    const sh = x.createLinearGradient(0, 0, 0, depth); sh.addColorStop(0, "rgba(60,20,10,.22)"); sh.addColorStop(0.25, "rgba(60,20,10,0)"); sh.addColorStop(1, "rgba(60,20,10,.2)");
    x.fillStyle = sh; x.fill();
    const RR = rng(14);
    for (let i = 0; i < 700; i++) { const y = RR() * depth, t = y / depth, half = rx * (1 - t * t) + bot * t * t; x.fillStyle = RR() > 0.5 ? "rgba(255,230,210,.16)" : "rgba(90,30,10,.13)"; x.fillRect((RR() * 2 - 1) * half * 0.94, y + 10, 2.2, 2.2); }
    x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.28);
    const rg = x.createLinearGradient(-rx, 0, rx, 0); rg.addColorStop(0, "#f0b88d"); rg.addColorStop(0.4, "#dc8d5c"); rg.addColorStop(1, "#9b4a2a");
    x.fillStyle = rg; x.fill(); x.stroke();
    x.beginPath(); x.ellipse(0, 4, rx - 20, ry - 12, 0, 0, 6.28); x.fillStyle = "#5b3f2b"; x.fill();
    const cols = ["#efe9dc", "#d9d2c3", "#bdb5a6", "#f6f2ea", "#a8a091", "#e4d6bf", "#cfc3ae"];
    for (let i = 0; i < 520; i++) {
      const a = RR() * 6.28, dd = Math.sqrt(RR()), px = Math.cos(a) * dd * (rx - 30), py = 4 + Math.sin(a) * dd * (ry - 16), r = 5 + RR() * 8;
      x.fillStyle = cols[(RR() * cols.length) | 0]; x.strokeStyle = "rgba(58,22,46,.2)"; x.lineWidth = 1;
      x.beginPath(); x.ellipse(px, py, r, r * 0.68, RR() * 3, 0, 6.28); x.fill(); x.stroke();
    }
  });
  // kesit kökleri (S3)
  const cutRoots = Array.from({ length: 9 }, (_, i) => {
    const pts: [number, number][] = []; let x = MAM.x - 120 + i * 30, y = BOWL.y + 20, a = Math.PI / 2 + (i - 4) * 0.28;
    for (let k = 0; k < 14; k++) { a += (Math.PI / 2 - a) * 0.06 + (R() - 0.5) * 0.5; x += Math.cos(a) * 20; y += Math.sin(a) * 14; if (y > BOWL.y + BOWL.depth - 30) break; pts.push([x, y]); }
    return pts;
  });
  const cutGrit = Array.from({ length: 360 }, () => ({ x: (R() * 2 - 1), y: R(), r: 3 + R() * 7, k: R() }));

  const draw = (c: CanvasRenderingContext2D, t: number, cam: Cam, st: { vigor: number; leafBlur: number; cut: number; cloud: number }) => {
    c.save();
    c.save();
    c.translate(W / 2, H / 2); c.scale(1 + (cam.z - 1) * 0.25, 1 + (cam.z - 1) * 0.25); c.translate(-W / 2 - (cam.x - W / 2) * 0.25, -H / 2 - (cam.y - 1100) * 0.25);
    c.drawImage(win, 0, 0);
    c.restore();
    c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.rotate(cam.r); c.translate(-cam.x, -cam.y);
    const both = (cx: CanvasRenderingContext2D, key: string, x: number, y: number, sc = 1, fy = 1) => { stamp(cx, S[key + "t"], x, y, sc, 0, 1, fy); stamp(cx, S[key + "f"], x, y, sc, 0, st.vigor, fy); };
    const layer = (fn: () => void, blur: number) => {
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); lctx.setTransform(c.getTransform());
      fn();
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none"; c.drawImage(lay, 0, 0); c.restore();
    };
    // arka plan bitkileri (alan derinliği)
    layer(() => { both(lctx, "alo", ALO.x, ALO.y); both(lctx, "cer", CER.x, CER.y); }, st.leafBlur * 0.8);
    // kase
    stamp(c, S.bowl, BOWL.x, BOWL.y);
    if (st.cut > 0.01) {
      c.save(); c.globalAlpha = st.cut;
      const { x, y, rx, depth, bot } = BOWL;
      c.beginPath(); c.moveTo(x - rx + 24, y + 6); c.bezierCurveTo(x - rx + 24, y + depth * 0.55, x - bot - 16, y + depth - 18, x - bot + 10, y + depth - 18); c.lineTo(x + bot - 10, y + depth - 18); c.bezierCurveTo(x + bot + 16, y + depth - 18, x + rx - 24, y + depth * 0.55, x + rx - 24, y + 6); c.closePath(); c.clip();
      const sg = c.createLinearGradient(0, y, 0, y + depth); sg.addColorStop(0, "#a78463"); sg.addColorStop(1, "#6d4f37");
      c.fillStyle = sg; c.fillRect(x - rx, y, rx * 2, depth);
      for (const g of cutGrit) { c.fillStyle = g.k > 0.6 ? "#f2efe8" : g.k > 0.3 ? "#a39d92" : "#d6bf96"; c.beginPath(); c.ellipse(x + g.x * (rx - 30), y + 12 + g.y * (depth - 34), g.r, g.r * 0.7, g.k * 3, 0, 6.28); c.fill(); }
      c.lineCap = "round"; c.lineJoin = "round";
      for (const r of cutRoots) { c.strokeStyle = "rgba(60,44,26,.55)"; c.lineWidth = 9; c.beginPath(); r.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); c.strokeStyle = "#ecdcb6"; c.lineWidth = 6; c.beginPath(); r.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); }
      c.restore();
    }
    // odak: top kaktüs + tomurcuk tacı (keskin)
    const bud = (p: { x: number; y: number; i: number }) => stamp(c, S.bud, MAM.x + p.x, MAM.y + p.y + 6, 0.8 + (p.i % 3) * 0.1, p.x / MAM.w * 0.9 + Math.sin(t * 1.2 + p.i) * 0.04, 1);
    ring.filter((p) => p.front < 0).forEach(bud);
    both(c, "mam", MAM.x, MAM.y);
    ring.filter((p) => p.front >= 0).forEach(bud);
    // ön plan
    layer(() => { both(lctx, "haw", HAW.x, HAW.y); stamp(lctx, S.echt, ECH.x, ECH.y, 1.04, 0.2, 1, 0.56); stamp(lctx, S.echf, ECH.x, ECH.y, 1, 0.2, st.vigor, 0.56); }, st.leafBlur * 1.2);
    c.restore();
    if (st.cloud > 0.01) { const x = lerp(-W * 0.6, W * 1.6, st.cloud); const g = c.createRadialGradient(x, H * 0.45, 0, x, H * 0.45, W * 0.9); g.addColorStop(0, "rgba(50,80,70,.3)"); g.addColorStop(1, "rgba(50,80,70,0)"); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  };
  return { draw, FOCUS, POT, win };
}

/* -------------------------------------------------------------------------- */
export function createGritWorld(lctx: CanvasRenderingContext2D, lay: HTMLCanvasElement) {
  const R = rng(707);
  const S: Record<string, Sprite> = {};
  const stone = (x: CanvasRenderingContext2D, s: number, seed: number, kind: number) => {
    const RR = rng(seed), n = 7 + ((RR() * 3) | 0);
    x.beginPath(); for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 + RR() * 0.4, r = s * (0.36 + RR() * 0.12); const px = Math.cos(a) * r, py = Math.sin(a) * r * 0.78; if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.closePath();
    const base = kind === 0 ? ["#cfcac1", "#7d776e"] : kind === 1 ? ["#f7f5f0", "#cfcbc2"] : ["#e2c99f", "#a5845a"];
    const g = x.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, base[0]); g.addColorStop(1, base[1]);
    x.fillStyle = g; x.fill(); x.strokeStyle = "rgba(40,28,18,.4)"; x.lineWidth = s * 0.015; x.stroke();
    if (kind === 1) { x.fillStyle = "rgba(160,150,140,.35)"; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc((RR() - 0.5) * s * 0.5, (RR() - 0.5) * s * 0.4, s * 0.03, 0, 6.28); x.fill(); } }
  };
  for (let i = 0; i < 9; i++) S["s" + i] = sprite("gw-s" + i, 240, 1.4, [0.5, 0.5], (x, s) => stone(x, s * 0.95, i + 70, i % 3));
  const stones = Array.from({ length: 150 }, (_, i) => ({ x: R() * W, y: R() * 3200 - 250, w: 50 + R() * 150, rot: R() * 6.28, v: i % 9, z: R() }));
  const rocks = stones.filter((s) => s.z >= 0.45 && s.z <= 0.85 && s.w > 120 && s.v % 3 === 0);
  const sand = Array.from({ length: 900 }, () => ({ x: R() * W, y: R() * 3200 - 250, s: 1.5 + R() * 3.5, c: R() }));
  type Pt = { x: number; y: number };
  const roots: { pts: Pt[]; w0: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const pts: Pt[] = []; let x = W * (0.18 + i * 0.22), y = -180, a = Math.PI / 2 + (R() - 0.5) * 0.5;
    for (let k = 0; k < 115; k++) { a += (Math.PI / 2 - a) * 0.035 + (R() - 0.5) * 0.2; x += Math.cos(a) * 28; y += Math.sin(a) * 28; if (x < 80) a = 0.35; if (x > W - 80) a = Math.PI - 0.35; pts.push({ x, y }); }
    roots.push({ pts, w0: 50 });
    for (const fr of [0.18, 0.38, 0.6, 0.8]) {
      const p0 = pts[Math.floor(pts.length * fr)], side = R() > 0.5 ? 1 : -1, lp: Pt[] = [{ ...p0 }];
      let lx = p0.x, ly = p0.y, la = Math.PI / 2 - side * (0.9 + R() * 0.5);
      for (let k = 0; k < 18; k++) { la += (R() - 0.5) * 0.3 + side * 0.03; lx += Math.cos(la) * 22; ly += Math.sin(la) * 22; lp.push({ x: lx, y: ly }); }
      roots.push({ pts: lp, w0: 20 });
    }
  }
  const width = (r: { w0: number; pts: Pt[] }, i: number) => r.w0 * (1 - 0.55 * (i / r.pts.length));
  const hairs = roots.flatMap((r) => r.pts.flatMap((p, i) => {
    if (i < 2 || R() > 0.5) return [];
    const q = r.pts[Math.min(r.pts.length - 1, i + 1)], dx = q.x - p.x, dy = q.y - p.y, m = Math.hypot(dx, dy) || 1, s2 = R() > 0.5 ? 1 : -1;
    const a = Math.atan2((dx / m) * s2, (-dy / m) * s2) + (R() - 0.5) * 1.2;
    return [{ x: p.x, y: p.y, nx: Math.cos(a), ny: Math.sin(a), l: 30 + R() * 80, d: R(), bend: (R() - 0.5) * 1.1, w: width(r, i) }];
  }));
  const pickRoot = () => { const r = roots[(R() * roots.length) | 0]; return r.pts[(R() * r.pts.length) | 0]; };
  const microbes = Array.from({ length: 300 }, (_, i) => {
    let hx: number, hy: number;
    if (i % 4 === 0 && rocks.length) { const rk = rocks[(R() * rocks.length) | 0], a = R() * 6.28; hx = rk.x + Math.cos(a) * rk.w * 0.4; hy = rk.y + Math.sin(a) * rk.w * 0.32; }
    else { const p = pickRoot(), a = R() * 6.28, d = 30 + R() * 14; hx = p.x + Math.cos(a) * d; hy = p.y + Math.sin(a) * d; }
    return { hx, hy, sx: R() * W, sy: hy + (R() - 0.5) * 900, d0: R() * 1.2, s: 2.4 + R() * 2.6 };
  });
  const minerals = Array.from({ length: 170 }, () => {
    const rk = rocks[(R() * rocks.length) | 0] ?? stones[0];
    let best = roots[0].pts[0], bd = 1e9;
    for (const r of roots) for (const p of r.pts) { const d = Math.hypot(p.x - rk.x, p.y - rk.y); if (d < bd) { bd = d; best = p; } }
    return { rk, to: best, off: R(), sp: 0.3 + R() * 0.3, col: ["255,170,60", "190,120,255", "255,120,70", "120,220,140"][(R() * 4) | 0] };
  });
  const drops = Array.from({ length: 130 }, () => ({ x: R() * W, st: R() * 1.6, sp: 1500 + R() * 900 }));
  const nutr = Array.from({ length: 130 }, () => ({ r: roots[((R() * 4) | 0) * 5], off: R(), sp: 0.25 + R() * 0.3, col: R() > 0.6 ? "120,200,255" : R() > 0.5 ? "255,140,70" : "255,205,80" }));
  const rush = Array.from({ length: 160 }, () => ({ x: R() * W, y: R(), l: 60 + R() * 260, w: 1 + R() * 3, c: R() }));

  const draw = (c: CanvasRenderingContext2D, u: number, camY: number, speed: number) => {
    const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#8d6c4d"); bg.addColorStop(1, "#4b3524");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const wet = sm(u, 0.3, 2.0);
    // uzak taşlar + kum (bulanık)
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); lctx.translate(0, -camY * 0.5);
    for (const g of sand) { lctx.fillStyle = g.c > 0.7 ? "rgba(250,244,230,.5)" : g.c > 0.35 ? "rgba(70,48,30,.5)" : "rgba(200,170,120,.5)"; lctx.beginPath(); lctx.arc(g.x, g.y, g.s, 0, 6.28); lctx.fill(); }
    for (const s of stones) if (s.z < 0.45) stamp(lctx, S["s" + s.v], s.x, s.y, s.w / 240 * 0.7, s.rot, 0.85);
    c.save(); c.filter = "blur(7px) brightness(.9)"; c.drawImage(lay, 0, 0); c.restore();
    // ıslanma: yukarıdan aşağı koyulaşma
    if (wet > 0.01) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(40,26,14,${0.38 * wet})`); g.addColorStop(Math.min(0.99, wet), `rgba(40,26,14,${0.3 * wet})`); g.addColorStop(1, "rgba(40,26,14,0)"); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    c.save(); c.translate(0, -camY);
    // orta katman taşlar (keskin)
    for (const s of stones) if (s.z >= 0.45 && s.z <= 0.85) stamp(c, S["s" + s.v], s.x, s.y, s.w / 240, s.rot, 1);
    // bakteri halesi + kökler (tek geçişte kontur, sonra gövde: tırtıl görüntüsü yok)
    const halo = sm(u, 2.0, 3.4);
    c.lineCap = "round"; c.lineJoin = "round";
    const seg = (add: number, k: number, dx = 0, dy = 0) => { for (const r of roots) for (let i = 1; i < r.pts.length; i++) { c.lineWidth = width(r, i) * k + add; c.beginPath(); c.moveTo(r.pts[i - 1].x + dx, r.pts[i - 1].y + dy); c.lineTo(r.pts[i].x + dx, r.pts[i].y + dy); c.stroke(); } };
    if (halo > 0.01) { c.strokeStyle = `rgba(80,140,255,${0.13 * halo})`; seg(60, 1); }
    c.strokeStyle = "rgba(45,30,16,.65)"; seg(7, 1);
    c.strokeStyle = css(mix(hex("#e2d1aa"), hex("#c9ad80"), wet)); seg(0, 1);
    c.strokeStyle = "rgba(255,250,236,.4)"; seg(0, 0.22, -9, -4);
    // yağmur kökleri
    const rr = sm(u, 0.5, 2.4);
    if (rr > 0.01) for (const h of hairs) {
      const g = sm(rr, h.d * 0.55, h.d * 0.55 + 0.45); if (g <= 0.01) continue;
      const L = h.l * g, sx = h.x + h.nx * h.w * 0.45, sy = h.y + h.ny * h.w * 0.45;
      const ex = sx + h.nx * L + h.ny * h.bend * L * 0.5, ey = sy + h.ny * L - h.nx * h.bend * L * 0.5, mx = sx + h.nx * L * 0.55, my = sy + h.ny * L * 0.55;
      c.strokeStyle = "rgba(60,40,20,.35)"; c.lineWidth = 8; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
      c.strokeStyle = "#fcf9f0"; c.lineWidth = 4.5; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
      c.fillStyle = "#eaf8dc"; c.beginPath(); c.arc(ex, ey, 4, 0, 6.28); c.fill();
    }
    // su damlaları
    const wd = 1 - sm(u, 2.0, 2.6);
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
    // mineraller: taştan köke
    const mi = sm(u, 3.3, 3.9) * (1 - sm(u, 6.2, 6.8) * 0.6);
    if (mi > 0.01) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const m of minerals) {
        const q = (u * m.sp + m.off) % 1, a = mi * Math.min(1, q * 4) * Math.min(1, (1 - q) * 4);
        const x = lerp(m.rk.x, m.to.x, q), y = lerp(m.rk.y, m.to.y, q) + Math.sin(q * 6 + m.off * 9) * 10;
        c.fillStyle = `rgba(${m.col},${0.25 * a})`; c.beginPath(); c.arc(x, y, 16, 0, 6.28); c.fill();
        c.fillStyle = `rgba(${m.col},${0.95 * a})`; c.beginPath(); c.arc(x, y, 7, 0, 6.28); c.fill();
      }
      c.restore();
    }
    // besin ve su yukarı
    const nu = sm(u, 4.9, 5.6);
    if (nu > 0.01) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const n of nutr) {
        const cyc = (u * n.sp + n.off) % 1, len = n.r.pts.length;
        const f2 = (1 - cyc) * (len - 1), i = Math.floor(f2), fr = f2 - i;
        const a = n.r.pts[i], b = n.r.pts[Math.min(len - 1, i + 1)];
        const x = a.x + (b.x - a.x) * fr, y = a.y + (b.y - a.y) * fr;
        c.strokeStyle = `rgba(${n.col},${0.5 * nu})`; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 30 + speed * 0.5); c.stroke();
        c.fillStyle = `rgba(${n.col},${0.95 * nu})`; c.beginPath(); c.arc(x, y, 6, 0, 6.28); c.fill();
      }
      c.restore();
    }
    c.restore();
    // yakın taşlar (bulanık, hızlı paralaks)
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); lctx.translate(0, -camY * 1.5);
    for (const s of stones) if (s.z > 0.88) stamp(lctx, S["s" + s.v], s.x, s.y, s.w / 240 * 2, s.rot, 1);
    c.save(); c.filter = "blur(14px)"; c.drawImage(lay, 0, 0); c.restore();
    if (speed > 2) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const s of rush) { const y = ((s.y * H + camY * 2.2) % (H + 400)) - 200; c.strokeStyle = s.c > 0.6 ? `rgba(255,225,140,${Math.min(0.6, speed / 60)})` : `rgba(255,245,225,${Math.min(0.35, speed / 90)})`; c.lineWidth = s.w; c.beginPath(); c.moveTo(s.x, y); c.lineTo(s.x, y + s.l * Math.min(3, speed / 14)); c.stroke(); }
      c.restore();
    }
  };
  return { draw };
}

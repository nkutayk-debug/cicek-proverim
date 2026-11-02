/* "Çiçek neden açmaz?" hareketli infografik sahnesi.
   Tek saksı, 6 bölüm; her bölüm t (0..1) boyunca kendi sorununu canlandırır.
   0 ışık · 1 azot · 2 su · 3 kireç · 4 stres · 5 saksı/budama */
import { PAL, bud, css, geraniumFloret, geraniumLeaf, hex, mix, rng, sprite, stamp, type RGB, type Sprite } from "./flora";
import { growRoots, drawRoots, type Root } from "./roots";
import { sm } from "./rootlens";

const VW = 1000, VH = 760;
const POT = { x: 600, y: 512, w: 300, h: 206, wall: 13 };
const CROWN = { x: 600, y: 528 };
const FLOOR = 724;

type Leaf = { x: number; y: number; r: number; rot: number; v: number; top: boolean; extra: boolean; ph: number };
type Umb = { bx: number; by: number; x: number; y: number; r: number; ph: number };

export function createWhyScene(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const R = rng(77);
  const potSide = (y: number) => { const t = (y - POT.y) / POT.h; const half = (POT.w / 2) * (1 - t * 0.2); return { l: POT.x - half, r: POT.x + half }; };
  const inner = (y: number) => { const o = potSide(y); return { l: o.l + POT.wall, r: o.r - POT.wall }; };
  const soilTop = POT.y + 22, potBot = POT.y + POT.h;
  const roots: Root[] = growRoots(13, { x: POT.x, y: soilTop + 4 }, { left: (y) => inner(y).l, right: (y) => inner(y).r, bottom: potBot - POT.wall, top: soilTop }, { mains: 6, step: 11, maxSteps: 20, width: 5, spread: 1.6, branch: 0.18, stopAtBottom: true });

  const leaves: Leaf[] = [];
  const rows = [{ n: 4, y: 360, s: 95, r: 46 }, { n: 5, y: 410, s: 125, r: 54 }, { n: 5, y: 462, s: 140, r: 58 }, { n: 4, y: 505, s: 130, r: 56 }];
  rows.forEach((row, ri) => {
    for (let i = 0; i < row.n; i++) {
      const t = i / (row.n - 1) - 0.5;
      leaves.push({ x: CROWN.x + t * row.s * 2 + (R() - 0.5) * 20, y: row.y + Math.abs(t) * 40, r: row.r * (0.85 + R() * 0.3), rot: t * 1.2 + (R() - 0.5) * 0.4, v: (R() * 6) | 0, top: ri === 0, extra: false, ph: R() * 6 });
    }
  });
  // azot bölümünde patlayan ekstra yapraklar
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i / 6 - 0.5) * 2.4;
    leaves.push({ x: CROWN.x + Math.cos(a) * 170, y: 380 + Math.sin(a) * 120 + 70, r: 70 + R() * 18, rot: a + Math.PI / 2, v: (R() * 6) | 0, top: false, extra: true, ph: R() * 6 });
  }
  const umbs: Umb[] = [[505, 255, 50], [590, 205, 56], [682, 245, 52], [745, 320, 44]].map(([x, y, r]) => ({ bx: CROWN.x + (x - CROWN.x) * 0.4, by: 470, x, y, r, ph: R() * 6 }));

  let dpr = 1, k = 1, W = 0, H = 0, ox = 0, oy = 0;
  let spr: Record<string, Sprite> = {};
  let hand = "cursive";

  const resize = (w: number, h: number) => {
    W = w; H = h; dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    k = Math.min(w / VW, h / VH); ox = (w - VW * k) / 2; oy = (h - VH * k) / 2;
    const d = dpr * k;
    spr = {};
    for (let i = 0; i < 6; i++) {
      spr["l" + i] = sprite("wy-l" + i, 150, d, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, PAL.leaf, 0.55, 3 + i * 5));
      spr["t" + i] = sprite("wy-t" + i, 150, d, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, PAL.leafTired, 0.25, 3 + i * 5));
      spr["n" + i] = sprite("wy-n" + i, 150, d, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, { dark: hex("#123d20"), base: hex("#245f2e"), light: hex("#4f8f45") }, 0.8, 3 + i * 5));
    }
    spr.chl = sprite("wy-chl", 150, d, [0.5, 0.5], (x, s) => {
      geraniumLeaf(x, s * 0.45, { dark: hex("#a9a24a"), base: hex("#d8d27a"), light: hex("#f1ebb0") }, 0, 9);
      x.strokeStyle = css(PAL.leaf.base, 0.75); x.lineWidth = s * 0.02;
      for (let q = 0; q < 7; q++) { const tt = Math.PI + (q / 6 - 0.5) * Math.PI * 1.5; x.beginPath(); x.moveTo(0, s * 0.03); x.lineTo(Math.sin(tt) * s * 0.38, Math.cos(tt) * s * 0.36); x.stroke(); }
    });
    const G = PAL.geranium, Wt: RGB = [255, 255, 255], Dk: RGB = [92, 10, 48];
    const tones = [{ base: mix(G.base, Wt, 0.12), mid: mix(G.mid, Wt, 0.16), tip: mix(G.tip, Wt, 0.22) }, G, { base: mix(G.base, Dk, 0.28), mid: mix(G.mid, Dk, 0.24), tip: mix(G.tip, Dk, 0.16) }];
    for (let v = 0; v < 3; v++) spr["f" + v] = sprite("wy-f" + v, 50, d, [0.5, 0.5], (x, s) => geraniumFloret(x, s * 0.44, tones[v], 11 + v * 7));
    spr.fd = sprite("wy-fd", 50, d, [0.5, 0.5], (x, s) => geraniumFloret(x, s * 0.4, { base: hex("#6b4a3a"), mid: hex("#9a7563"), tip: hex("#bfa08c") }, 5));
    spr.bud = sprite("wy-bud", 40, d, [0.5, 0.86], (x, s) => bud(x, s * 0.21, PAL.geranium, 0));
    hand = getComputedStyle(document.documentElement).getPropertyValue("--font-hand").trim() || "cursive";
  };

  const note = (text: string, x: number, y: number, a: number, rot = -0.06) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot);
    ctx.font = `600 30px ${hand}`; ctx.fillStyle = "#8f1648"; ctx.textAlign = "center"; ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  const umbel = (u: Umb, o: number, sag: number, lean: number, faded = false, t = 0) => {
    const sway = Math.sin(t * 0.9 + u.ph) * 4;
    const x = u.x + lean * 200 + sway, y = u.y + sag;
    ctx.lineCap = "round";
    ctx.strokeStyle = css(PAL.leaf.dark); ctx.lineWidth = 4.6;
    ctx.beginPath(); ctx.moveTo(u.bx, u.by); ctx.quadraticCurveTo((u.bx + x) / 2 + lean * 60, (u.by + y) / 2 + 26, x, y); ctx.stroke();
    ctx.strokeStyle = css(PAL.leaf.light, 0.85); ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(u.bx - 0.8, u.by); ctx.quadraticCurveTo((u.bx + x) / 2 + lean * 60 - 0.8, (u.by + y) / 2 + 26, x - 0.8, y); ctx.stroke();
    if (o < 0.6) for (let b = 0; b < 8; b++) { const a = (b - 3.5) * 0.22; stamp(ctx, spr.bud, x + Math.sin(a) * 10, y + 2, 1.15, Math.PI + a * 1.5, 1 - sm(o, 0, 0.6)); }
    if (o > 0.01) {
      const N = 14;
      for (let i = N - 1; i >= 0; i--) {
        const a = i * 2.39996, d = Math.sqrt((i + 0.5) / N), q = sm(o, (1 - d) * 0.4, (1 - d) * 0.4 + 0.6);
        const lit = -Math.sin(a) * d * 0.7 - Math.cos(a) * d * 0.35;
        stamp(ctx, faded ? spr.fd : spr["f" + (lit > 0.2 ? 0 : lit < -0.2 ? 2 : 1)], x + Math.cos(a) * d * u.r * q, y - u.r * 0.2 + Math.sin(a) * d * u.r * 0.8 * q, q * (1.05 - d * 0.25) * (u.r / 52), a, Math.min(1, q * 2));
      }
    }
    return { x, y };
  };

  const draw = (ch: number, t: number, time: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);

    // durum
    const light = ch === 0 ? 1 - sm(t, 0.05, 0.5) * 0.85 : 1;
    const lean = ch === 0 ? -sm(t, 0.2, 0.8) * 0.22 : 0;
    const extra = ch === 1 ? sm(t, 0.2, 0.7) : 0;
    const water = ch === 2 ? sm(t, 0.05, 0.55) * 0.72 : 0;
    const rootDark = ch === 2 ? sm(t, 0.3, 0.8) : 0;
    const vigor = ch === 2 ? 1 - sm(t, 0.45, 0.95) * 0.85 : 1;
    const crust = ch === 3 ? sm(t, 0.15, 0.7) : 0;
    const chl = ch === 3 ? sm(t, 0.35, 0.85) : 0;
    const heat = ch === 4 ? sm(t, 0.05, 0.4) : 0;
    let o = 1;
    if (ch === 0) o = 1 - sm(t, 0.45, 0.9);
    if (ch === 1) o = 1 - sm(t, 0.35, 0.8);
    if (ch === 2) o = 1 - sm(t, 0.5, 0.95);
    if (ch === 3) o = 1 - sm(t, 0.6, 0.95) * 0.7;
    if (ch === 4) o = 1 - sm(t, 0.12, 0.35);

    // pencere
    const wx = 70, wy = 90, ww = 240, wh = 330;
    ctx.save();
    ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 8); ctx.clip();
    const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, css(mix(hex("#9fb2c4"), hex("#cfe6fb"), light))); sky.addColorStop(1, css(mix(hex("#d9dee5"), hex("#fff7ea"), light)));
    ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
    const sunY = wy + 110 + (1 - light) * 160;
    const sg = ctx.createRadialGradient(wx + 120, sunY, 0, wx + 120, sunY, 120);
    sg.addColorStop(0, `rgba(255,224,140,${0.85 * light})`); sg.addColorStop(1, "rgba(255,224,140,0)");
    ctx.fillStyle = sg; ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = `rgba(255,214,110,${0.95 * light + 0.05})`; ctx.beginPath(); ctx.arc(wx + 120, sunY, 34, 0, 6.28); ctx.fill();
    if (ch === 0) { // bulut
      const cx = wx + 300 - sm(t, 0.05, 0.5) * 190;
      ctx.fillStyle = "rgba(235,238,244,.96)";
      for (const [dx, dy, r] of [[0, 0, 38], [34, -14, 32], [64, 4, 30], [-30, 8, 26]]) { ctx.beginPath(); ctx.arc(cx + dx, sunY + 10 + dy, r, 0, 6.28); ctx.fill(); }
    }
    ctx.restore();
    ctx.strokeStyle = "#e8dfe6"; ctx.lineWidth = 12; ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 8); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    // ışık hüzmesi
    if (light > 0.2) {
      const bg = ctx.createLinearGradient(wx + ww, wy, POT.x, POT.y);
      bg.addColorStop(0, `rgba(255,236,170,${0.32 * light})`); bg.addColorStop(1, "rgba(255,236,170,0)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(wx + ww, wy + 20); ctx.lineTo(wx + ww, wy + wh - 20); ctx.lineTo(POT.x + 120, POT.y + 60); ctx.lineTo(POT.x - 60, 240); ctx.closePath(); ctx.fill();
    }

    // zemin gölgesi
    const fg = ctx.createRadialGradient(POT.x, FLOOR, 0, POT.x, FLOOR, 220);
    fg.addColorStop(0, "rgba(60,20,40,.18)"); fg.addColorStop(1, "rgba(60,20,40,0)");
    ctx.save(); ctx.translate(POT.x, FLOOR); ctx.scale(1, 0.12); ctx.translate(-POT.x, -FLOOR); ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(POT.x, FLOOR, 220, 0, 6.28); ctx.fill(); ctx.restore();

    // saksı kesiti
    const o0 = potSide(POT.y + 34), o1 = potSide(potBot);
    ctx.beginPath(); ctx.moveTo(o0.l, POT.y + 34); ctx.lineTo(o1.l, potBot); ctx.lineTo(o1.r, potBot); ctx.lineTo(o0.r, POT.y + 34); ctx.closePath();
    const pg = ctx.createLinearGradient(o0.l, 0, o0.r, 0);
    pg.addColorStop(0, "#df946a"); pg.addColorStop(0.5, "#c47248"); pg.addColorStop(1, "#8e4729");
    ctx.fillStyle = pg; ctx.fill(); ctx.strokeStyle = "rgba(58,22,46,.32)"; ctx.lineWidth = 2; ctx.stroke();
    const i0 = inner(POT.y + 34), i1 = inner(potBot - POT.wall);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(i0.l, soilTop); ctx.lineTo(i1.l, potBot - POT.wall); ctx.lineTo(i1.r, potBot - POT.wall); ctx.lineTo(i0.r, soilTop); ctx.closePath(); ctx.clip();
    const soil = ctx.createLinearGradient(0, soilTop, 0, potBot);
    soil.addColorStop(0, "#8a6447"); soil.addColorStop(1, "#553825");
    ctx.fillStyle = soil; ctx.fillRect(i1.l - 40, soilTop, 400, POT.h);
    const G2 = rng(5);
    for (let i = 0; i < 260; i++) { ctx.fillStyle = G2() > 0.88 ? "rgba(245,240,230,.7)" : "rgba(40,22,12,.32)"; ctx.beginPath(); ctx.arc(i1.l + G2() * (i0.r - i1.l), soilTop + G2() * POT.h, 1.2 + G2() * 1.6, 0, 6.28); ctx.fill(); }
    const rf = css(mix(hex("#f4ead7"), hex("#7d5a3c"), rootDark));
    drawRoots(ctx, roots, 1, { fill: rf, ink: "rgba(70,40,20,.55)", hair: 0.3 * (1 - rootDark) });
    if (water > 0.01) {
      const wl = potBot - POT.wall - (potBot - soilTop) * water;
      ctx.fillStyle = "rgba(86,150,215,.5)"; ctx.fillRect(i1.l - 40, wl, 400, POT.h);
      ctx.strokeStyle = "rgba(225,240,252,.8)"; ctx.lineWidth = 1.4;
      for (let i = 0; i < 16; i++) { const bx = i1.l + 14 + ((i * 53) % (i0.r - i1.l - 28)); const by = potBot - 20 - ((time * 40 + i * 37) % Math.max(10, potBot - wl - 20)); ctx.beginPath(); ctx.arc(bx, by, 2.5 + (i % 3), 0, 6.28); ctx.stroke(); }
    }
    ctx.restore();
    // ağız bandı
    const rimL = potSide(POT.y).l - 10, rimR = potSide(POT.y).r + 10;
    const rg = ctx.createLinearGradient(rimL, 0, rimR, 0);
    rg.addColorStop(0, "#eba97b"); rg.addColorStop(0.5, "#d17d4f"); rg.addColorStop(1, "#99502d");
    ctx.fillStyle = rg; ctx.strokeStyle = "rgba(58,22,46,.32)"; ctx.lineWidth = 2;
    for (const [x0, x1] of [[rimL, i0.l + 2], [i0.r - 2, rimR]]) { ctx.beginPath(); ctx.roundRect(x0, POT.y, x1 - x0, 36, 5); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = "#77553a"; ctx.fillRect(i0.l, soilTop - 3, i0.r - i0.l, 7);
    if (crust > 0.01) {
      const C2 = rng(8);
      for (let i = 0; i < 70 * crust; i++) { ctx.fillStyle = `rgba(250,250,246,${0.75})`; ctx.beginPath(); ctx.ellipse(i0.l + 6 + C2() * (i0.r - i0.l - 12), soilTop - 1 + C2() * 4, 2 + C2() * 5, 1.4 + C2() * 2, 0, 0, 6.28); ctx.fill(); }
    }

    // arka yapraklar
    const drawLeaf = (L: Leaf, front: boolean) => {
      if (L.extra && extra <= 0.01) return;
      const isFront = L.y > 470;
      if (isFront !== front) return;
      const sway = Math.sin(time * 0.8 + L.ph) * 2.5;
      const droop = (1 - vigor);
      const x = L.x + lean * (CROWN.y - L.y) * 0.8 + sway + Math.sign(L.x - CROWN.x) * droop * 20, y = L.y + droop * 30;
      ctx.strokeStyle = css(mix(PAL.leaf.base, PAL.leafTired.base, droop)); ctx.lineWidth = 2.2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(CROWN.x + (L.x - CROWN.x) * 0.2, CROWN.y - 4); ctx.quadraticCurveTo((CROWN.x + x) / 2, Math.min(CROWN.y, y) - 16, x, y + L.r * 0.35); ctx.stroke();
      const sc = (L.r / 67.5) * (L.extra ? sm(extra, 0, 1) * 1.15 : 1);
      const rot = L.rot + lean * 1.4 + droop * 0.4 * Math.sign(L.x - CROWN.x);
      if (L.extra) { stamp(ctx, spr["n" + L.v], x, y, sc, rot, 1, 0.85); return; }
      stamp(ctx, spr["l" + L.v], x, y, sc, rot, 1, 0.85);
      if (droop > 0.01) stamp(ctx, spr["t" + L.v], x, y, sc, rot, droop, 0.85);
      if (L.top && chl > 0.01) stamp(ctx, spr.chl, x, y, sc, rot, chl, 0.85);
      if (ch === 1 && extra > 0.01) stamp(ctx, spr["n" + L.v], x, y, sc, rot, extra * 0.8, 0.85);
    };
    leaves.forEach((L) => drawLeaf(L, false));

    // salkımlar
    umbs.forEach((u, i) => {
      if (ch === 5) {
        if (i === 1) {
          // solmuş salkım → kesilir → yeni tomurcuk açar
          const snip = sm(t, 0.3, 0.38);
          if (snip < 1) umbel(u, 1, 10, 0, true, time);
          else {
            const fall = sm(t, 0.38, 0.6);
            if (fall < 1) { ctx.save(); ctx.globalAlpha = 1 - fall; ctx.translate(0, fall * 260); umbel({ ...u, bx: u.x, by: u.y + 30 }, 1, 10, 0, true, time); ctx.restore(); }
          }
          const grow = sm(t, 0.55, 0.95);
          if (grow > 0.01) umbel({ ...u, x: u.x + 30, y: u.y + 40, r: u.r * 0.9 }, grow, (1 - grow) * 30, 0, false, time);
          return;
        }
        umbel(u, 1, 0, 0, false, time);
        return;
      }
      if (ch === 4) {
        const fall = sm(t, 0.42 + i * 0.08, 0.7 + i * 0.08);
        if (fall > 0.01) {
          // tomurcuk demeti düşer
          const sx = u.x, sy = u.y + 20;
          ctx.save(); ctx.globalAlpha = 1 - sm(fall, 0.85, 1);
          const fy = sy + fall * (soilTop - 20 - sy);
          for (let b = 0; b < 6; b++) stamp(ctx, spr.bud, sx + (b - 3) * 8 + fall * (b - 3) * 6, fy, 1.1, Math.PI + fall * 3 * (b % 2 ? 1 : -1), 1);
          ctx.restore();
          // çıplak sap
          ctx.strokeStyle = css(PAL.leaf.dark); ctx.lineWidth = 4.6;
          ctx.beginPath(); ctx.moveTo(u.bx, u.by); ctx.quadraticCurveTo((u.bx + u.x) / 2, (u.by + u.y) / 2 + 26, u.x, u.y + 20); ctx.stroke();
          return;
        }
      }
      umbel(u, ch === 1 ? o * (1 - extra * 0.3) : o, (1 - o) * 22 + (1 - vigor) * 30, lean, false, time);
    });

    leaves.forEach((L) => drawLeaf(L, true));

    // bölüme özel öğeler
    if (ch === 0) note("6 saatten az güneş", wx + ww / 2, wy + wh + 46, sm(t, 0.35, 0.55));
    if (ch === 1) {
      // azotlu besin taneleri
      const P = rng(3);
      for (let i = 0; i < 26; i++) {
        const st = 0.02 + P() * 0.35, q = (t - st) / 0.25;
        if (q < 0 || q > 1) continue;
        const x = CROWN.x - 120 + P() * 240, y = 120 + q * (soilTop - 120);
        ctx.fillStyle = "rgba(90,140,90,.85)"; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.28); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(x - 1.5, y - 1.5, 1.6, 0, 6.28); ctx.fill();
      }
      note("bol azot: yaprak çok, çiçek yok", CROWN.x, 110, sm(t, 0.45, 0.65));
    }
    if (ch === 2) note("dipte biriken su", POT.x + 250, potBot - 30, sm(t, 0.3, 0.5), 0.04);
    if (ch === 3) {
      // sulama kabı + damlalar
      const cx = 860, cy = 150;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.35);
      ctx.fillStyle = "#cfd8de"; ctx.strokeStyle = "rgba(40,50,60,.45)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-40, -34, 90, 70, 12); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-40, 10); ctx.lineTo(-110, -20); ctx.lineTo(-104, -30); ctx.lineTo(-38, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      const P = rng(4);
      for (let i = 0; i < 18; i++) {
        const st = P() * 0.55, q = (t - st) / 0.22;
        if (q < 0 || q > 1) continue;
        const x = 770 - q * 140 + (P() - 0.5) * 30, y = 128 + q * q * (soilTop - 130);
        ctx.fillStyle = "rgba(150,190,230,.85)"; ctx.beginPath(); ctx.ellipse(x, y, 3.2, 5, 0, 0, 6.28); ctx.fill();
      }
      note("kireç kabuğu, pH ↑", POT.x + 245, soilTop - 30, sm(t, 0.45, 0.65), 0.04);
      note("yeni yaprak sararır", 400, 330, sm(t, 0.6, 0.8), -0.04);
    }
    if (ch === 4) {
      const tx = 890, ty = 170, th = 280;
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "rgba(60,30,40,.45)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(tx - 14, ty, 28, th, 14); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(tx, ty + th + 16, 24, 0, 6.28); ctx.fillStyle = "#e0384e"; ctx.fill(); ctx.stroke();
      const lvl = 0.25 + heat * 0.68;
      ctx.fillStyle = "#e0384e"; ctx.fillRect(tx - 6, ty + th - th * lvl, 12, th * lvl + 6);
      ctx.strokeStyle = `rgba(230,120,60,${0.35 * heat})`; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); for (let y = 120; y < 470; y += 8) { const x = 380 + i * 110 + Math.sin(y * 0.05 + time * 4 + i) * 8; y === 120 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
      note(`${Math.round(22 + heat * 14)} °C`, tx, ty - 20, heat, 0);
      note("tomurcuklar dökülüyor", CROWN.x - 40, 150, sm(t, 0.5, 0.7));
    }
    if (ch === 5) {
      const u = umbs[1];
      const sc = sm(t, 0.08, 0.3), cut = sm(t, 0.3, 0.38);
      const x = u.x + 130 - sc * 120, y = u.y + 70 - sc * 40;
      if (t < 0.6) {
        ctx.save(); ctx.globalAlpha = 1 - sm(t, 0.45, 0.6); ctx.translate(x, y); ctx.rotate(-0.6);
        ctx.strokeStyle = "#5a5a66"; ctx.lineWidth = 6; ctx.lineCap = "round";
        const op = 0.35 * (1 - cut);
        for (const s of [1, -1]) { ctx.save(); ctx.rotate(s * op); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-70, 0); ctx.stroke(); ctx.restore(); }
        ctx.lineWidth = 4; ctx.strokeStyle = "#d4246c";
        for (const s of [1, -1]) { ctx.beginPath(); ctx.ellipse(22, s * 12, 14, 9, 0, 0, 6.28); ctx.stroke(); }
        ctx.restore();
      }
      note("solanı kopar, yenisi gelsin", CROWN.x, 140, sm(t, 0.35, 0.55));
    }
    // ışık azaldıkça oda gölgelenir
  };

  return { resize, draw, VW, VH };
}

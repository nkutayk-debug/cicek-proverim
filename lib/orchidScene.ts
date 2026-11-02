/* Orkide "neden açmaz" hareketli infografiği. 6 bölüm, her biri t (0..1):
   0-0.5 sorun, 0.5-1 çözüm. 0 ışık · 1 sıcaklık · 2 su · 3 harç · 4 tuz · 5 sap kesimi */
import { OPALS, barkChip, css, hex, mix, orchid, orchidBud, ovalLeaf, rng, sprite, stamp, type RGB, type Sprite } from "./flora";
import { sm } from "./rootlens";

const VW = 1000, VH = 760, FLOOR = 712;
const POT = { x: 600, top: 470, h: 232, wTop: 224, wBot: 182 };
const CROWN = { x: 600, y: 478 };
const PINK = OPALS.phalPink;

/* sap: dikey + kavis; s = 0..1 boy, n = boğum noktası */
const SP = { x0: 612, y0: 468, x1: 618, y1: 236, cx: 690, cy: 150, x2: 770, y2: 250 };
function spikeAt(t: number) {
  if (t < 0.45) { const q = t / 0.45; return { x: SP.x0 + (SP.x1 - SP.x0) * q, y: SP.y0 + (SP.y1 - SP.y0) * q }; }
  const q = (t - 0.45) / 0.55, a = 1 - q;
  return { x: a * a * SP.x1 + 2 * a * q * SP.cx + q * q * SP.x2, y: a * a * SP.y1 + 2 * a * q * SP.cy + q * q * SP.y2 };
}

export function createOrchidScene(c: HTMLCanvasElement, labels: { problem: string; fix: string }[]) {
  const ctx = c.getContext("2d")!;
  const R = rng(91);
  const chips = Array.from({ length: 34 }, (_, i) => ({ x: (R() - 0.5) * 0.84, y: R(), w: 24 + R() * 20, seed: i + 2, rot: R() * 3 }));
  const mush = Array.from({ length: 160 }, () => ({ x: (R() - 0.5) * 0.86, y: R(), r: 1.5 + R() * 3 }));
  const crust = Array.from({ length: 70 }, () => ({ x: (R() - 0.5) * 0.8, y: R() * 0.25, r: 1.2 + R() * 2.6 }));
  const roots = Array.from({ length: 5 }, (_, i) => {
    const pts: [number, number][] = []; let x = CROWN.x + (i - 2) * 16, y = CROWN.y + 12, a = Math.PI / 2 + (i - 2) * 0.3;
    for (let k = 0; k < 13; k++) {
      a += (Math.PI / 2 - a) * 0.12 + (R() - 0.5) * 0.5; x += Math.cos(a) * 16; y += Math.sin(a) * 16;
      const tt = (y - POT.top) / POT.h, half = (POT.wTop / 2) * (1 - tt) + (POT.wBot / 2) * tt - 14;
      x = Math.max(POT.x - half, Math.min(POT.x + half, x));
      if (y > POT.top + POT.h - 14) break;
      pts.push([x, y]);
    }
    return pts;
  });
  let dpr = 1, k = 1, ox = 0, oy = 0, hand = "cursive";
  let spr: Record<string, Sprite> = {};

  const resize = (w: number, h: number) => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    k = Math.min(w / VW, h / VH); ox = (w - VW * k) / 2; oy = (h - VH * k) / 2;
    const d = dpr * k;
    const lush = { dark: hex("#16452a"), base: hex("#2f6e3a"), light: hex("#6da35a") };
    const tired = { dark: hex("#5f6b3a"), base: hex("#8e9a55"), light: hex("#c3c182") };
    spr = {};
    for (let i = 0; i < 4; i++) {
      spr["l" + i] = sprite("os-l" + i, 340, d, [0.5, 0.94], (x, s) => ovalLeaf(x, s * 0.9, s * 0.22, lush, { gloss: 1.4, tip: 1.5 }));
      spr["t" + i] = sprite("os-t" + i, 340, d, [0.5, 0.94], (x, s) => ovalLeaf(x, s * 0.9, s * 0.22, tired, { gloss: 0.3, tip: 1.5 }));
    }
    for (let v = 0; v < 2; v++) spr["f" + v] = sprite("os-f" + v, 120, d, [0.5, 0.5], (x, s) => orchid(x, s * 0.44, v ? OPALS.phalWhite : PINK));
    spr.bud = sprite("os-bud", 36, d, [0.5, 0.5], (x, s) => orchidBud(x, s * 0.3, PINK));
    for (let i = 0; i < 6; i++) {
      spr["c" + i] = sprite("os-c" + i, 56, d, [0.5, 0.5], (x, s) => barkChip(x, s * 0.8, i + 4));
      spr["r" + i] = sprite("os-r" + i, 56, d, [0.5, 0.5], (x, s) => barkChip(x, s * 0.5, i + 9, 0.85));
    }
    hand = getComputedStyle(document.documentElement).getPropertyValue("--font-hand").trim() || "cursive";
  };

  const note = (text: string, x: number, y: number, a: number, good: boolean) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(-0.05);
    ctx.font = `600 30px ${hand}`; ctx.textAlign = "center";
    if (good) {
      const w = ctx.measureText(text).width + 34;
      ctx.fillStyle = "rgba(122,63,209,.12)"; ctx.beginPath(); ctx.roundRect(-w / 2, -26, w, 38, 19); ctx.fill();
      ctx.fillStyle = "#4a2581";
    } else ctx.fillStyle = "#8f1648";
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  const draw = (ch: number, t: number, time: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
    const fixP = sm(t, 0.5, 0.62);

    // ---- durumlar
    let light = 1, temp = 22, water = 0, rootRot = 0, rootDry = 0, rotten = 0, salt = 0, vigor = 1, pour = 0;
    let spikeLen = 0, flowerO = [0, 0, 0, 0], buds = 0, spikeCut = 0, sideSpike = 0, petalFall = 0;
    if (ch === 0) { light = 0.25 + 0.75 * fixP; spikeLen = sm(t, 0.58, 0.82); buds = sm(t, 0.7, 0.85); flowerO = [sm(t, 0.82, 0.95), sm(t, 0.88, 1), 0, 0]; }
    if (ch === 1) { temp = 30 - 10 * fixP; spikeLen = sm(t, 0.6, 0.84); buds = sm(t, 0.72, 0.86); flowerO = [sm(t, 0.84, 0.97), sm(t, 0.9, 1), 0, 0]; }
    if (ch === 2) { water = sm(t, 0.02, 0.3) * 0.62 * (1 - sm(t, 0.52, 0.72)); rootRot = sm(t, 0.15, 0.45) * (1 - sm(t, 0.62, 0.8)); rootDry = sm(t, 0.62, 0.8) * (1 - sm(t, 0.86, 0.98)); vigor = 1 - sm(t, 0.2, 0.45) * 0.8 + sm(t, 0.65, 0.9) * 0.8; spikeLen = 1; buds = 1; }
    if (ch === 3) { rotten = sm(t, 0.05, 0.35) * (1 - sm(t, 0.52, 0.7)); rootRot = sm(t, 0.2, 0.45) * (1 - sm(t, 0.6, 0.8)); vigor = 1 - sm(t, 0.25, 0.45) * 0.7 + sm(t, 0.65, 0.9) * 0.7; spikeLen = 1; buds = 1; }
    if (ch === 4) { salt = sm(t, 0.05, 0.35) * (1 - sm(t, 0.62, 0.85)); pour = sm(t, 0.52, 0.58) * (1 - sm(t, 0.86, 0.92)); rootRot = salt * 0.5; spikeLen = 1; buds = 1; }
    if (ch === 5) { spikeLen = 1; flowerO = [1, 1, 1, 1]; petalFall = sm(t, 0.04, 0.3); spikeCut = sm(t, 0.34, 0.42); sideSpike = sm(t, 0.5, 0.78); buds = 1; }

    // ---- pencere
    const wx = 60, wy = 80, ww = 230, wh = 320;
    ctx.save(); ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 8); ctx.clip();
    const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, css(mix(hex("#9fb2c4"), hex("#cfe6fb"), light))); sky.addColorStop(1, css(mix(hex("#d9dee5"), hex("#fff7ea"), light)));
    ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
    const night = ch === 1 && fixP > 0;
    if (night) { ctx.fillStyle = `rgba(40,50,90,${0.55 * fixP})`; ctx.fillRect(wx, wy, ww, wh); }
    const sunY = wy + 105 + (1 - light) * 120;
    if (!night || fixP < 1) {
      const sg = ctx.createRadialGradient(wx + 115, sunY, 0, wx + 115, sunY, 110);
      sg.addColorStop(0, `rgba(255,224,140,${0.85 * light * (1 - (night ? fixP : 0))})`); sg.addColorStop(1, "rgba(255,224,140,0)");
      ctx.fillStyle = sg; ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = `rgba(255,214,110,${(0.95 * light + 0.05) * (1 - (night ? fixP : 0))})`; ctx.beginPath(); ctx.arc(wx + 115, sunY, 32, 0, 6.28); ctx.fill();
    }
    if (night) { ctx.fillStyle = `rgba(245,240,220,${fixP})`; ctx.beginPath(); ctx.arc(wx + 150, wy + 90, 26, 0, 6.28); ctx.fill(); ctx.fillStyle = `rgba(40,50,90,${fixP})`; ctx.beginPath(); ctx.arc(wx + 162, wy + 82, 24, 0, 6.28); ctx.fill(); }
    if (ch === 0 && light < 1) {
      const cx = wx + 115 + (1 - light) * 10;
      ctx.fillStyle = `rgba(232,236,242,${(1 - light) * 1.3})`;
      for (const [dx, dy, r] of [[0, 0, 40], [36, -14, 32], [66, 6, 30], [-32, 8, 28]]) { ctx.beginPath(); ctx.arc(cx + dx - 10, sunY + 10 + dy, r, 0, 6.28); ctx.fill(); }
    }
    ctx.restore();
    ctx.strokeStyle = "#e7dff0"; ctx.lineWidth = 12; ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 8); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    if (light > 0.3 && !night) {
      const bg = ctx.createLinearGradient(wx + ww, wy, POT.x, POT.top);
      bg.addColorStop(0, `rgba(255,236,170,${0.3 * light})`); bg.addColorStop(1, "rgba(255,236,170,0)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(wx + ww, wy + 20); ctx.lineTo(wx + ww, wy + wh - 20); ctx.lineTo(POT.x + 110, POT.top + 60); ctx.lineTo(POT.x - 60, 220); ctx.closePath(); ctx.fill();
    }

    // ---- zemin gölgesi
    const fg = ctx.createRadialGradient(POT.x, FLOOR, 0, POT.x, FLOOR, 200);
    fg.addColorStop(0, "rgba(60,20,70,.18)"); fg.addColorStop(1, "rgba(60,20,70,0)");
    ctx.save(); ctx.translate(POT.x, FLOOR); ctx.scale(1, 0.12); ctx.translate(-POT.x, -FLOOR); ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(POT.x, FLOOR, 200, 0, 6.28); ctx.fill(); ctx.restore();

    // ---- şeffaf saksı içi
    const potPath = () => {
      ctx.beginPath(); ctx.moveTo(POT.x - POT.wTop / 2, POT.top); ctx.lineTo(POT.x - POT.wBot / 2, POT.top + POT.h);
      ctx.quadraticCurveTo(POT.x, POT.top + POT.h + 8, POT.x + POT.wBot / 2, POT.top + POT.h); ctx.lineTo(POT.x + POT.wTop / 2, POT.top); ctx.closePath();
    };
    ctx.save(); potPath(); ctx.clip();
    ctx.fillStyle = css(mix(hex("#a07b5a"), hex("#2e2018"), rotten), 0.45 + rotten * 0.5); ctx.fillRect(POT.x - 130, POT.top + 14, 260, POT.h);
    const fresh = ch === 3 ? sm(t, 0.55, 0.75) : 1;
    chips.forEach((cp, i) => {
      const x = POT.x + cp.x * POT.wTop, y = POT.top + 18 + cp.y * (POT.h - 26);
      if (ch === 3 && rotten > 0.05) stamp(ctx, spr["r" + (i % 6)], x, y, cp.w / 56, cp.rot, rotten);
      stamp(ctx, spr["c" + (i % 6)], x, y, (cp.w / 46) * (ch === 3 ? 0.4 + 0.6 * fresh : 1), cp.rot, ch === 3 ? Math.max(1 - rotten, fresh) * (1 - rotten * 0.9) + fresh * rotten : 1);
    });
    if (rotten > 0.01) { ctx.fillStyle = `rgba(40,28,18,${rotten * 0.8})`; for (const m of mush) { ctx.beginPath(); ctx.arc(POT.x + m.x * POT.wTop, POT.top + 30 + m.y * (POT.h - 40), m.r, 0, 6.28); ctx.fill(); } }
    const rootCol: RGB = mix(mix(hex("#6fa35a"), hex("#d4d9cc"), rootDry), hex("#6e4e30"), rootRot);
    for (const r of roots) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(70,60,40,.5)"; ctx.lineWidth = 11; ctx.beginPath(); r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      ctx.strokeStyle = css(rootCol); ctx.lineWidth = 8.5; ctx.beginPath(); r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      if (salt > 0.01) { const [x, y] = r[r.length - 1]; ctx.fillStyle = `rgba(90,50,20,${salt})`; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.28); ctx.fill(); }
    }
    if (water > 0.01) {
      const wl = POT.top + POT.h - POT.h * water;
      ctx.fillStyle = "rgba(86,150,215,.42)"; ctx.fillRect(POT.x - 130, wl, 260, POT.h);
      ctx.strokeStyle = "rgba(225,240,252,.8)"; ctx.lineWidth = 1.4;
      for (let i = 0; i < 12; i++) { const bx = POT.x - 80 + ((i * 47) % 160), by = POT.top + POT.h - 12 - ((time * 36 + i * 31) % Math.max(10, POT.top + POT.h - wl - 12)); ctx.beginPath(); ctx.arc(bx, by, 2.5 + (i % 3), 0, 6.28); ctx.stroke(); }
    }
    if (salt > 0.01) for (const s of crust) { ctx.fillStyle = `rgba(250,250,246,${0.85 * salt})`; ctx.beginPath(); ctx.arc(POT.x + s.x * POT.wTop, POT.top + 18 + s.y * POT.h * 0.5, s.r, 0, 6.28); ctx.fill(); }
    if (pour > 0.01) { ctx.fillStyle = `rgba(130,185,235,${0.35 * pour})`; ctx.fillRect(POT.x - 100, POT.top, 200, POT.h); }
    ctx.restore();
    potPath(); ctx.fillStyle = "rgba(225,235,242,.26)"; ctx.fill(); ctx.strokeStyle = "rgba(120,140,160,.55)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(POT.x - POT.wTop / 2 + 16, POT.top + 26); ctx.lineTo(POT.x - POT.wBot / 2 + 16, POT.top + POT.h - 24); ctx.stroke();
    ctx.fillStyle = "rgba(235,242,248,.75)"; ctx.strokeStyle = "rgba(120,140,160,.55)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(POT.x - POT.wTop / 2 - 8, POT.top - 6, POT.wTop + 16, 15, 5); ctx.fill(); ctx.stroke();
    // dipten süzülen su (su ve tuz bölümleri)
    const drip = ch === 2 ? sm(t, 0.52, 0.6) * (1 - sm(t, 0.74, 0.8)) : ch === 4 ? pour : 0;
    if (drip > 0.01) for (let i = 0; i < 4; i++) { const q = ((time * 1.4 + i * 0.25) % 1); ctx.fillStyle = `rgba(110,170,230,${drip * (1 - q)})`; ctx.beginPath(); ctx.ellipse(POT.x - 40 + i * 26, POT.top + POT.h + 6 + q * 40, 3.5, 5.5, 0, 0, 6.28); ctx.fill(); }

    // ---- yapraklar (arka)
    const leaf = (i: number, rot: number, sc: number, ph: number) => {
      const droop = (1 - vigor) * 0.3 * Math.sign(rot);
      const r = rot + droop + Math.sin(time * 0.8 + ph) * 0.01;
      stamp(ctx, spr["l" + i], CROWN.x, CROWN.y, sc, r, 1, 0.8);
      if (vigor < 1) stamp(ctx, spr["t" + i], CROWN.x, CROWN.y, sc, r, 1 - vigor, 0.8);
    };
    leaf(2, -1.02, 0.56, 1); leaf(3, 1.08, 0.53, 2);

    // ---- sap + çiçekler
    const node = 0.3; // kesim boğumu (sapın %30'u)
    const visibleTo = spikeCut > 0 ? node + (1 - node) * (1 - spikeCut) : spikeLen;
    if (spikeLen > 0.01 || ch === 5) {
      ctx.strokeStyle = "#5d7a3a"; ctx.lineWidth = 4.6; ctx.lineCap = "round";
      ctx.beginPath();
      const N = 40;
      for (let i = 0; i <= N; i++) { const tt = (i / N) * Math.max(0.0001, visibleTo); const p = spikeAt(tt); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
      ctx.stroke();
      // boğum çizgileri
      for (const nt of [0.18, node]) { if (nt > visibleTo) continue; const p = spikeAt(nt); ctx.strokeStyle = "rgba(60,80,40,.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x - 6, p.y); ctx.lineTo(p.x + 6, p.y); ctx.stroke(); }
      const ts = [0.62, 0.73, 0.83, 0.92, 1];
      if (spikeCut < 0.99) ts.forEach((ft, i) => {
        if (ft > spikeLen + 0.001 && ch !== 5) return;
        const p = spikeAt(ft);
        const fx = p.x, fy = p.y + 22;
        const o = flowerO[i] ?? 0;
        const fall = ch === 5 ? petalFall : 0;
        if (o > 0.01 && fall < 1) stamp(ctx, spr["f" + (i % 2)], fx, fy + fall * 220, (0.62 + 0.06 * (4 - i)) * Math.max(0.2, o), i * 0.3 + fall * 2, (1 - fall) * Math.min(1, o * 2));
        else if (buds > 0.01 && ch !== 5) stamp(ctx, spr.bud, fx, fy - 6, 0.8 + i * 0.03, 0, buds * (1 - Math.min(1, o * 2)));
      });
      if (ch === 5 && sideSpike > 0.01) {
        const n0 = spikeAt(node);
        const ex = n0.x + 120 * sideSpike, ey = n0.y - 70 * sideSpike;
        ctx.strokeStyle = "#5d7a3a"; ctx.lineWidth = 3.6;
        ctx.beginPath(); ctx.moveTo(n0.x, n0.y); ctx.quadraticCurveTo(n0.x + 40 * sideSpike, n0.y - 70 * sideSpike, ex, ey); ctx.stroke();
        const ob = sm(t, 0.78, 0.95);
        stamp(ctx, spr.bud, ex, ey + 14, 0.9, 0, 1 - ob);
        if (ob > 0.01) stamp(ctx, spr.f0, ex, ey + 22, 0.62 * ob, 0.2, ob);
        stamp(ctx, spr.bud, n0.x + 70 * sideSpike, n0.y - 52 * sideSpike + 12, 0.75, 0, sideSpike);
      }
    }
    // ---- ön yapraklar
    leaf(0, -1.6, 0.66, 3); leaf(1, 1.55, 0.62, 4);

    // ---- bölüme özel araçlar
    if (ch === 1) {
      const tx = 890, ty = 160, th = 260;
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "rgba(60,30,60,.45)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(tx - 14, ty, 28, th, 14); ctx.fill(); ctx.stroke();
      const hot = (temp - 20) / 10;
      const col = css(mix(hex("#5b8de0"), hex("#e0384e"), hot));
      ctx.beginPath(); ctx.arc(tx, ty + th + 16, 24, 0, 6.28); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
      const lvl = 0.3 + hot * 0.6; ctx.fillStyle = col; ctx.fillRect(tx - 6, ty + th - th * lvl, 12, th * lvl + 6);
      ctx.save(); ctx.font = `600 30px ${hand}`; ctx.fillStyle = "#4a2581"; ctx.textAlign = "center"; ctx.fillText(`${Math.round(temp)} °C`, tx, ty - 18); ctx.restore();
      if (hot > 0.3) { ctx.strokeStyle = `rgba(230,120,60,${0.3 * hot})`; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let y = 120; y < 440; y += 8) { const x = 430 + i * 120 + Math.sin(y * 0.05 + time * 4 + i) * 8; if (y === 120) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); } }
    }
    if (ch === 4 && pour > 0.01) {
      ctx.save(); ctx.translate(800, 150); ctx.rotate(-0.4);
      ctx.fillStyle = "#cfd8de"; ctx.strokeStyle = "rgba(40,50,60,.45)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-40, -34, 90, 70, 12); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-40, 10); ctx.lineTo(-110, -20); ctx.lineTo(-104, -30); ctx.lineTo(-38, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = `rgba(120,180,235,${0.8 * pour})`; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(706, 128); ctx.quadraticCurveTo(660, 260, POT.x + 30, POT.top + 10); ctx.stroke();
    }
    if (ch === 5 && t > 0.2 && t < 0.55) {
      const n0 = spikeAt(node);
      const sc = sm(t, 0.2, 0.34), cut = sm(t, 0.34, 0.42);
      ctx.save(); ctx.globalAlpha = 1 - sm(t, 0.45, 0.55); ctx.translate(n0.x + 90 - sc * 84, n0.y - 26 + sc * 18); ctx.rotate(-0.4);
      ctx.strokeStyle = "#5a5a66"; ctx.lineWidth = 6; ctx.lineCap = "round";
      const op = 0.35 * (1 - cut);
      for (const s of [1, -1]) { ctx.save(); ctx.rotate(s * op); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-64, 0); ctx.stroke(); ctx.restore(); }
      ctx.lineWidth = 4; ctx.strokeStyle = "#7a3fd1";
      for (const s of [1, -1]) { ctx.beginPath(); ctx.ellipse(20, s * 12, 13, 8, 0, 0, 6.28); ctx.stroke(); }
      ctx.restore();
    }
    const L = labels[ch];
    if (L) {
      note(L.problem, ch === 1 ? 470 : POT.x + 10, 110, sm(t, 0.08, 0.2) * (1 - sm(t, 0.44, 0.52)), false);
      note("çözüm: " + L.fix, POT.x - 40, 110, sm(t, 0.56, 0.66), true);
    }
  };
  return { resize, draw };
}

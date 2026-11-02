/* Kaktüs & sukulent "neden formunu kaybeder / neden açmaz" hareketli infografiği. 6 bölüm, her biri t (0..1):
   0-0.5 sorun, 0.5-1 çözüm. 0 ışık (uzama) · 1 fazla su · 2 toprak/drenaj · 3 kış dinlenmesi · 4 güneş yanığı · 5 yılbaşı kaktüsü */
import { CPAL, CTONE, cactusBloom, cactusBody, colProf, crownRing, css, echeveria, hex, mix, pot, rng, schlumbergera, sprite, stamp, type LeafTone, type RGB, type Sprite } from "./flora";
import { sm } from "./rootlens";

const VW = 1000, VH = 760, FLOOR = 712;
const POT = { x: 590, top: 470, h: 236, wTop: 252, wBot: 196, wall: 13 };
const CAC = { x: 590, y: 488, w: 176, h: 166 };
const EP = { x: 858, top: 616, w: 118, h: 96 };
const pale = (t: LeafTone, k: number): LeafTone => ({ dark: mix(t.dark, CTONE.pale.dark, k), base: mix(t.base, CTONE.pale.base, k), light: mix(t.light, CTONE.pale.light, k) });

export function createKaktusScene(c: HTMLCanvasElement, labels: { problem: string; fix: string }[]) {
  const ctx = c.getContext("2d")!;
  const R = rng(57);
  const half = (y: number) => { const tt = (y - POT.top) / POT.h; return (POT.wTop / 2) * (1 - tt) + (POT.wBot / 2) * tt - POT.wall; };
  const roots = Array.from({ length: 7 }, (_, i) => {
    const pts: [number, number][] = []; let x = CAC.x + (i - 3) * 20, y = CAC.y + 4, a = Math.PI / 2 + (i - 3) * 0.32;
    for (let k = 0; k < 13; k++) {
      a += (Math.PI / 2 - a) * 0.08 + (R() - 0.5) * 0.55; x += Math.cos(a) * 15; y += Math.sin(a) * 12;
      const hw = half(y) - 6; x = Math.max(POT.x - hw, Math.min(POT.x + hw, x));
      if (y > POT.top + POT.h - 30) break;
      pts.push([x, y]);
    }
    return pts;
  });
  const fine = roots.flatMap((r) => r.filter((_, i) => i > 2 && i % 3 === 0).map(([x, y]) => ({ x, y, a: R() * 6.28, l: 10 + R() * 14 })));
  const grains = Array.from({ length: 150 }, () => ({ x: R() * 2 - 1, y: R(), r: 2 + R() * 4.5, kind: R() }));
  const gravel = Array.from({ length: 34 }, () => ({ x: R() * 2 - 1, y: R(), r: 7 + R() * 6, c: R() }));
  const scorch = Array.from({ length: 7 }, () => ({ x: -0.7 + R() * 0.55, y: 0.35 + R() * 0.5, r: 10 + R() * 14, rot: R() * 3 }));
  const snow = Array.from({ length: 40 }, () => ({ x: R(), y: R(), s: 1.5 + R() * 2.5, sp: 0.1 + R() * 0.12 }));
  const ring = crownRing(CAC.w, CAC.h, 10);
  let dpr = 1, k = 1, ox = 0, oy = 0, hand = "cursive";
  let spr: Record<string, Sprite> = {};

  const resize = (w: number, h: number) => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    k = Math.min(w / VW, h / VH); ox = (w - VW * k) / 2; oy = (h - VH * k) / 2;
    const d = dpr * k;
    spr = {};
    spr.cac = sprite("ks-cac", 260, d, [0.5, 0.8], (x) => cactusBody(x, CAC.w, CAC.h, { tuber: true, rows: 170, spineLen: CAC.w * 0.075 }));
    spr.cacP = sprite("ks-cacP", 260, d, [0.5, 0.8], (x) => cactusBody(x, CAC.w, CAC.h, { tuber: true, rows: 170, spineLen: CAC.w * 0.075, tone: pale(CTONE.cactus, 0.65) }));
    spr.neck = sprite("ks-neck", 200, d, [0.5, 0.94], (x) => cactusBody(x, 64, 150, { prof: colProf(0.22), ribs: 9, tone: pale(CTONE.cactus, 0.75), seed: 4, spineLen: 5 }));
    spr.cap = sprite("ks-cap", 200, d, [0.5, 0.8], (x) => cactusBody(x, 118, 92, { tuber: true, rows: 90, spineLen: 8 }));
    spr.fl = sprite("ks-fl", 80, d, [0.5, 0.5], (x, s) => cactusBloom(x, s * 0.44, CPAL.pink, 5));
    spr.echF = sprite("ks-echF", 180, d, [0.5, 0.5], (x, s) => echeveria(x, s * 0.42, 6, { blush: 1.1 }));
    spr.echP = sprite("ks-echP", 180, d, [0.5, 0.5], (x, s) => echeveria(x, s * 0.42, 6, { blush: 0, pale: 0.7, open: 0.6 }));
    spr.ePot = sprite("ks-epot", 170, d, [0.5, 0.15], (x) => pot(x, EP.w, EP.h, 3));
    spr.schA = sprite("ks-schA", 480, d, [0.5, 0.5], (x, s) => schlumbergera(x, s * 0.84, 0, 0));
    spr.schB = sprite("ks-schB", 480, d, [0.5, 0.5], (x, s) => schlumbergera(x, s * 0.84, 0, 1));
    spr.schC = sprite("ks-schC", 480, d, [0.5, 0.5], (x, s) => schlumbergera(x, s * 0.84, 1, 1));
    hand = getComputedStyle(document.documentElement).getPropertyValue("--font-hand").trim() || "cursive";
  };

  const note = (text: string, x: number, y: number, a: number, good: boolean) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(-0.05);
    ctx.font = `600 30px ${hand}`; ctx.textAlign = "center";
    if (good) {
      const w = ctx.measureText(text).width + 34;
      ctx.fillStyle = "rgba(47,154,85,.13)"; ctx.beginPath(); ctx.roundRect(-w / 2, -26, w, 38, 19); ctx.fill();
      ctx.fillStyle = "#1d5e35";
    } else ctx.fillStyle = "#8f3a16";
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  const can = (x: number, y: number, a: number, k2: number) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(-0.42 * k2);
    ctx.fillStyle = "#9fc3a8"; ctx.strokeStyle = "rgba(30,60,40,.45)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-44, -36, 92, 72, 12); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-44, 12); ctx.lineTo(-116, -22); ctx.lineTo(-110, -32); ctx.lineTo(-42, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(10, -36, 26, Math.PI, 0); ctx.stroke();
    ctx.restore();
  };

  const draw = (ch: number, t: number, time: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
    const fixP = sm(t, 0.5, 0.62);

    // ---- durumlar
    let light = 1, etiol = 0, cap = 0, echStem = 0, echPale = 0, wetSoil = 0, waterLvl = 0, rootRot = 0, slump = 0, dense = 0, grit = 0, gravelK = 0, hole = 1, drip = 0, pour = 0;
    let temp = 0, heat = 0, snowK = 0, spring = 0, crown = 0, blaze = 0, burn = 0, curtain = 0, night = 0, lamp = 0, sch = 0, schBuds = 0, schBloom = 0, cacPale = 0;
    if (ch === 0) {
      light = 0.25 + 0.75 * fixP; etiol = sm(t, 0.08, 0.42); cap = sm(t, 0.62, 0.9); echStem = sm(t, 0.08, 0.42); echPale = sm(t, 0.08, 0.42) * (1 - sm(t, 0.6, 0.85)); cacPale = echPale;
    }
    if (ch === 1) {
      pour = sm(t, 0.04, 0.1) * (1 - sm(t, 0.36, 0.42)); wetSoil = sm(t, 0.08, 0.3) * (1 - sm(t, 0.62, 0.86)); waterLvl = sm(t, 0.1, 0.36) * 0.55 * (1 - sm(t, 0.52, 0.7));
      rootRot = sm(t, 0.2, 0.46) * (1 - sm(t, 0.66, 0.86)); slump = rootRot; drip = sm(t, 0.52, 0.58) * (1 - sm(t, 0.72, 0.78));
    }
    if (ch === 2) {
      hole = sm(t, 0.52, 0.6); gravelK = 1 - sm(t, 0.5, 0.6); dense = 1 - sm(t, 0.52, 0.66); grit = sm(t, 0.54, 0.7);
      pour = sm(t, 0.04, 0.1) * (1 - sm(t, 0.3, 0.36)) + sm(t, 0.66, 0.7) * (1 - sm(t, 0.8, 0.84));
      wetSoil = sm(t, 0.08, 0.3) * (1 - sm(t, 0.5, 0.6)) + sm(t, 0.68, 0.74) * (1 - sm(t, 0.84, 0.96)) * 0.6;
      waterLvl = sm(t, 0.12, 0.34) * 0.32 * (1 - sm(t, 0.5, 0.58)); rootRot = sm(t, 0.24, 0.46) * 0.6 * (1 - sm(t, 0.6, 0.8));
      drip = sm(t, 0.7, 0.75) * (1 - sm(t, 0.86, 0.92));
    }
    if (ch === 3) {
      heat = 1 - sm(t, 0.5, 0.62); temp = 24 - 14 * sm(t, 0.5, 0.66) + 10 * sm(t, 0.82, 0.9) * 0.4; snowK = sm(t, 0.52, 0.6) * (1 - sm(t, 0.78, 0.84));
      pour = sm(t, 0.08, 0.14) * (1 - sm(t, 0.3, 0.36)); wetSoil = sm(t, 0.1, 0.3) * (1 - sm(t, 0.56, 0.72)) * 0.7;
      cacPale = sm(t, 0.1, 0.4) * 0.5 * (1 - sm(t, 0.6, 0.8)); spring = sm(t, 0.8, 0.86); crown = sm(t, 0.84, 0.98); light = 0.6 + 0.4 * (1 - snowK);
    }
    if (ch === 4) {
      blaze = sm(t, 0.04, 0.16) * (1 - sm(t, 0.54, 0.68) * 0.7); burn = sm(t, 0.14, 0.42) * (1 - sm(t, 0.6, 0.8) * 0.55); curtain = sm(t, 0.52, 0.66);
    }
    if (ch === 5) {
      sch = 1; night = 1; lamp = 1 - sm(t, 0.5, 0.56); temp = 22 - 10 * sm(t, 0.52, 0.68); schBuds = sm(t, 0.66, 0.78); schBloom = sm(t, 0.8, 0.96);
    }

    // ---- pencere
    const wx = 60, wy = 80, ww = 230, wh = 320;
    ctx.save(); ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 8); ctx.clip();
    const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, css(mix(hex("#9fb2c4"), hex("#cfe6fb"), light))); sky.addColorStop(1, css(mix(hex("#d9dee5"), hex("#fff7ea"), light)));
    ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
    if (blaze > 0.01) { ctx.fillStyle = `rgba(255,236,170,${0.6 * blaze})`; ctx.fillRect(wx, wy, ww, wh); }
    if (snowK > 0.01) { ctx.fillStyle = `rgba(214,226,240,${0.6 * snowK})`; ctx.fillRect(wx, wy, ww, wh); }
    if (night) { ctx.fillStyle = "rgba(30,40,80,.86)"; ctx.fillRect(wx, wy, ww, wh); ctx.fillStyle = "rgba(245,240,220,.95)"; ctx.beginPath(); ctx.arc(wx + 150, wy + 90, 26, 0, 6.28); ctx.fill(); ctx.fillStyle = "rgba(30,40,80,1)"; ctx.beginPath(); ctx.arc(wx + 162, wy + 82, 24, 0, 6.28); ctx.fill(); for (let i = 0; i < 14; i++) { ctx.fillStyle = "rgba(255,255,240,.8)"; ctx.fillRect(wx + ((i * 67) % ww), wy + ((i * 41) % (wh * 0.6)), 2, 2); } }
    else {
      const sunY = wy + 105 + (1 - light) * 120, sunR = 32 + blaze * 26;
      const sg = ctx.createRadialGradient(wx + 115, sunY, 0, wx + 115, sunY, 110 + blaze * 90);
      sg.addColorStop(0, `rgba(255,${224 - blaze * 30},${140 - blaze * 60},${0.85 * light})`); sg.addColorStop(1, "rgba(255,224,140,0)");
      ctx.fillStyle = sg; ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = `rgba(255,${214 - blaze * 40},${110 - blaze * 50},${0.95 * light + 0.05})`; ctx.beginPath(); ctx.arc(wx + 115, sunY, sunR, 0, 6.28); ctx.fill();
      if (light < 1 && ch === 0) {
        ctx.fillStyle = `rgba(232,236,242,${(1 - light) * 1.3})`;
        for (const [dx, dy, r] of [[0, 0, 40], [36, -14, 32], [66, 6, 30], [-32, 8, 28]]) { ctx.beginPath(); ctx.arc(wx + 105 + dx, sunY + 10 + dy, r, 0, 6.28); ctx.fill(); }
      }
    }
    if (snowK > 0.01) for (const s of snow) { ctx.fillStyle = `rgba(255,255,255,${0.95 * snowK})`; ctx.beginPath(); ctx.arc(wx + s.x * ww, wy + ((s.y + time * s.sp) % 1) * wh, s.s, 0, 6.28); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = "#e3ece5"; ctx.lineWidth = 12; ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 8); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    // tül perde
    if (curtain > 0.01) {
      ctx.save(); ctx.globalAlpha = 0.82;
      const cw = (ww + 24) * curtain;
      const g = ctx.createLinearGradient(wx - 12, 0, wx - 12 + cw, 0);
      for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? "rgba(255,255,255,.92)" : "rgba(236,242,238,.85)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(wx - 12, wy - 16); ctx.lineTo(wx - 12 + cw, wy - 16);
      ctx.quadraticCurveTo(wx - 12 + cw + 10, wy + wh / 2, wx - 12 + cw, wy + wh + 20); ctx.lineTo(wx - 12, wy + wh + 20); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "#c9d6cc"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx - 24, wy - 18); ctx.lineTo(wx + ww + 24, wy - 18); ctx.stroke();
    }
    // ışık huzmesi
    const beam = night ? 0 : (light > 0.3 ? 0.3 * light : 0) * (1 - curtain * 0.5) + blaze * 0.35;
    if (beam > 0.01) {
      const bg = ctx.createLinearGradient(wx + ww, wy, POT.x, POT.top);
      bg.addColorStop(0, `rgba(255,236,170,${beam})`); bg.addColorStop(1, "rgba(255,236,170,0)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(wx + ww, wy + 20); ctx.lineTo(wx + ww, wy + wh - 20); ctx.lineTo(POT.x + 110, POT.top + 60); ctx.lineTo(POT.x - 60, 240); ctx.closePath(); ctx.fill();
    }
    // kalorifer
    if (ch === 3 && heat > 0.01) {
      ctx.save(); ctx.globalAlpha = heat;
      ctx.fillStyle = "#eef1f3"; ctx.strokeStyle = "rgba(60,70,80,.35)"; ctx.lineWidth = 2;
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.roundRect(wx + 8 + i * 31, 470, 24, 150, 8); ctx.fill(); ctx.stroke(); }
      ctx.strokeStyle = "rgba(230,120,60,.35)"; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); for (let y = 290; y < 460; y += 8) { const x = wx + 40 + i * 55 + Math.sin(y * 0.05 + time * 4 + i) * 8; if (y === 290) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.restore();
    }
    // gece karartması
    if (night) { ctx.fillStyle = `rgba(20,28,60,${0.04 + 0.1 * (1 - lamp)})`; ctx.fillRect(0, 0, VW, VH); }
    // lamba
    if (ch === 5) {
      const lx = 380;
      ctx.strokeStyle = "#8a8f96"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lx, FLOOR); ctx.lineTo(lx, 250); ctx.lineTo(lx + 60, 230); ctx.stroke();
      ctx.fillStyle = "#e9e3d4"; ctx.strokeStyle = "rgba(60,50,40,.4)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx + 30, 200); ctx.lineTo(lx + 110, 200); ctx.lineTo(lx + 130, 260); ctx.lineTo(lx + 10, 260); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (lamp > 0.01) {
        const lg = ctx.createLinearGradient(0, 260, 0, 560);
        lg.addColorStop(0, `rgba(255,214,120,${0.55 * lamp})`); lg.addColorStop(1, "rgba(255,214,120,0)");
        ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(lx + 10, 260); ctx.lineTo(lx + 130, 260); ctx.lineTo(POT.x + 160, 600); ctx.lineTo(lx - 40, 600); ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(255,236,170,${lamp})`; ctx.beginPath(); ctx.ellipse(lx + 70, 262, 50, 7, 0, 0, 6.28); ctx.fill();
      }
      ctx.fillStyle = "#8a8f96"; ctx.beginPath(); ctx.ellipse(lx, FLOOR, 34, 7, 0, 0, 6.28); ctx.fill();
    }

    // ---- zemin gölgesi
    const fg = ctx.createRadialGradient(POT.x, FLOOR, 0, POT.x, FLOOR, 220);
    fg.addColorStop(0, "rgba(20,60,35,.18)"); fg.addColorStop(1, "rgba(20,60,35,0)");
    ctx.save(); ctx.translate(POT.x, FLOOR); ctx.scale(1, 0.12); ctx.translate(-POT.x, -FLOOR); ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(POT.x, FLOOR, 220, 0, 6.28); ctx.fill(); ctx.restore();

    // ---- küçük eşeverya saksısı
    if (!sch) {
      stamp(ctx, spr.ePot, EP.x, EP.top);
      const stem = echStem * 74;
      if (stem > 1) {
        ctx.strokeStyle = css(mix(hex("#a3b07a"), hex("#c8c79a"), echPale)); ctx.lineWidth = 12; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(EP.x, EP.top + 6); ctx.quadraticCurveTo(EP.x - stem * 0.1, EP.top - stem * 0.5, EP.x - stem * 0.32, EP.top - stem); ctx.stroke();
        ctx.strokeStyle = "rgba(120,140,90,.6)"; ctx.lineWidth = 2;
        for (let i = 1; i < 5; i++) { const q = i / 5; ctx.beginPath(); ctx.ellipse(EP.x - stem * 0.32 * q * q, EP.top - stem * q, 7, 2.5, 0, 0, 6.28); ctx.stroke(); }
      }
      const ex = EP.x - stem * 0.32, ey = EP.top - stem - 2;
      stamp(ctx, spr.echP, ex, ey, 0.82 + echPale * 0.1, 0.3, 1, 0.55 + echPale * 0.15);
      stamp(ctx, spr.echF, ex, ey, 0.82, 0.3, 1 - echPale, 0.55);
    }

    // ---- saksı kesiti: iç
    const inner = () => {
      ctx.beginPath(); ctx.moveTo(POT.x - POT.wTop / 2 + POT.wall, POT.top + 10); ctx.lineTo(POT.x - POT.wBot / 2 + POT.wall, POT.top + POT.h - POT.wall);
      ctx.lineTo(POT.x + POT.wBot / 2 - POT.wall, POT.top + POT.h - POT.wall); ctx.lineTo(POT.x + POT.wTop / 2 - POT.wall, POT.top + 10); ctx.closePath();
    };
    ctx.save(); inner(); ctx.clip();
    const soil: RGB = mix(mix(hex("#a07a58"), hex("#4a3324"), dense * 0.7 + wetSoil * 0.5), hex("#2e2018"), wetSoil * 0.35 * (1 + dense));
    ctx.fillStyle = css(soil); ctx.fillRect(POT.x - 140, POT.top, 280, POT.h);
    // yoğun torf dokusu / mineral taneler
    for (const g of grains) {
      const y = POT.top + 16 + g.y * (POT.h - 34), x = POT.x + g.x * half(y);
      if (dense > 0.01) { ctx.fillStyle = `rgba(30,20,12,${0.35 * dense})`; ctx.beginPath(); ctx.arc(x, y, g.r * 0.5, 0, 6.28); ctx.fill(); }
      const gk = ch === 2 ? grit : 1;
      if (gk > 0.01) {
        ctx.fillStyle = g.kind > 0.55 ? `rgba(248,248,244,${0.9 * gk})` : g.kind > 0.25 ? `rgba(176,170,160,${0.9 * gk})` : `rgba(214,190,150,${0.85 * gk})`;
        ctx.beginPath(); ctx.ellipse(x, y, g.r * (g.kind > 0.55 ? 0.7 : 1), g.r * 0.7, g.kind * 3, 0, 6.28); ctx.fill();
      }
    }
    if (gravelK > 0.01) for (const g of gravel) {
      const y = POT.top + POT.h - 26 - g.y * 34, x = POT.x + g.x * (half(y) - 6);
      ctx.fillStyle = `rgba(${150 + g.c * 50},${145 + g.c * 45},${135 + g.c * 40},${gravelK})`; ctx.strokeStyle = `rgba(60,50,40,${0.4 * gravelK})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(x, y, g.r, g.r * 0.72, g.c * 3, 0, 6.28); ctx.fill(); ctx.stroke();
    }
    // kökler
    const rootCol: RGB = mix(hex("#efe6cf"), hex("#6e4e30"), rootRot);
    for (const r of roots) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(60,45,30,.45)"; ctx.lineWidth = 7; ctx.beginPath(); r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      ctx.strokeStyle = css(rootCol); ctx.lineWidth = 4.6; ctx.beginPath(); r.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    }
    ctx.strokeStyle = css(rootCol, 0.85); ctx.lineWidth = 1.6;
    for (const f of fine) { ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(f.a) * f.l, f.y + Math.abs(Math.sin(f.a)) * f.l); ctx.stroke(); }
    if (waterLvl > 0.01) {
      const wl = POT.top + POT.h - POT.wall - (POT.h - 24) * waterLvl;
      ctx.fillStyle = "rgba(86,150,215,.42)"; ctx.fillRect(POT.x - 140, wl, 280, POT.h);
      ctx.strokeStyle = "rgba(225,240,252,.8)"; ctx.lineWidth = 1.4;
      for (let i = 0; i < 10; i++) { const bx = POT.x - 80 + ((i * 47) % 160), by = POT.top + POT.h - 20 - ((time * 30 + i * 31) % Math.max(10, POT.top + POT.h - wl - 20)); ctx.beginPath(); ctx.arc(bx, by, 2.5 + (i % 3), 0, 6.28); ctx.stroke(); }
    }
    if (wetSoil > 0.01) { ctx.fillStyle = `rgba(70,120,190,${0.16 * wetSoil})`; ctx.fillRect(POT.x - 140, POT.top, 280, POT.h); }
    if (pour > 0.01) { ctx.fillStyle = `rgba(130,185,235,${0.3 * pour})`; ctx.fillRect(POT.x - 110, POT.top, 220, POT.h); }
    ctx.restore();
    // ---- saksı duvarları (kesit)
    const wallG = ctx.createLinearGradient(POT.x - POT.wTop / 2, 0, POT.x + POT.wTop / 2, 0);
    wallG.addColorStop(0, "#e09a6c"); wallG.addColorStop(0.5, "#c8743f"); wallG.addColorStop(1, "#8f4527");
    ctx.fillStyle = wallG; ctx.strokeStyle = "rgba(58,22,46,.35)"; ctx.lineWidth = 1.5;
    const wallL = () => { ctx.beginPath(); ctx.moveTo(POT.x - POT.wTop / 2, POT.top); ctx.lineTo(POT.x - POT.wBot / 2, POT.top + POT.h); ctx.lineTo(POT.x - POT.wBot / 2 + POT.wall, POT.top + POT.h); ctx.lineTo(POT.x - POT.wTop / 2 + POT.wall, POT.top); ctx.closePath(); };
    const wallR = () => { ctx.beginPath(); ctx.moveTo(POT.x + POT.wTop / 2, POT.top); ctx.lineTo(POT.x + POT.wBot / 2, POT.top + POT.h); ctx.lineTo(POT.x + POT.wBot / 2 - POT.wall, POT.top + POT.h); ctx.lineTo(POT.x + POT.wTop / 2 - POT.wall, POT.top); ctx.closePath(); };
    wallL(); ctx.fill(); ctx.stroke(); wallR(); ctx.fill(); ctx.stroke();
    const holeW = 30 * hole, by = POT.top + POT.h - POT.wall;
    ctx.beginPath(); ctx.rect(POT.x - POT.wBot / 2, by, POT.wBot / 2 - holeW / 2, POT.wall); ctx.rect(POT.x + holeW / 2, by, POT.wBot / 2 - holeW / 2, POT.wall); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e9a679"; ctx.beginPath(); ctx.roundRect(POT.x - POT.wTop / 2 - 10, POT.top - 8, POT.wTop + 20, 24, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,236,214,.5)"; ctx.fillRect(POT.x - POT.wTop / 2 - 4, POT.top - 5, POT.wTop + 8, 3);
    if (drip > 0.01 && hole > 0.5) for (let i = 0; i < 3; i++) { const q = (time * 1.4 + i * 0.33) % 1; ctx.fillStyle = `rgba(110,170,230,${drip * (1 - q)})`; ctx.beginPath(); ctx.ellipse(POT.x - 6 + i * 6, POT.top + POT.h + 4 + q * 36, 3.5, 5.5, 0, 0, 6.28); ctx.fill(); }

    // ---- bitki
    if (sch) {
      stamp(ctx, spr.schA, CAC.x, CAC.y - 6, 1, 0, 1);
      stamp(ctx, spr.schB, CAC.x, CAC.y - 6, 1, 0, schBuds);
      stamp(ctx, spr.schC, CAC.x, CAC.y - 6, 1, 0, schBloom);
    } else {
      const sy = 1 - slump * 0.05;
      const flower = (p: { x: number; y: number; i: number }) => { if (crown > 0.01) stamp(ctx, spr.fl, CAC.x + p.x, CAC.y + p.y * sy, 0.6 * sm(crown, p.i * 0.05, p.i * 0.05 + 0.5), p.i, 1, 0.72); };
      ring.filter((p) => p.front < 0).forEach(flower);
      stamp(ctx, spr.cac, CAC.x, CAC.y, 1, 0, 1, sy);
      if (cacPale > 0.01) stamp(ctx, spr.cacP, CAC.x, CAC.y, 1, 0, cacPale, sy);
      // çürüme: dipte sararma
      if (slump > 0.01) {
        const g = ctx.createRadialGradient(CAC.x, CAC.y - 6, 0, CAC.x, CAC.y - 6, CAC.w * 0.55);
        g.addColorStop(0, `rgba(140,110,40,${0.55 * slump})`); g.addColorStop(1, "rgba(140,110,40,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(CAC.x, CAC.y - 10, CAC.w * 0.5, CAC.h * 0.32, 0, 0, 6.28); ctx.fill();
      }
      // güneş yanığı lekeleri
      if (burn > 0.01) for (const s of scorch) {
        const x = CAC.x + s.x * CAC.w * 0.5, y = CAC.y - s.y * CAC.h;
        const g = ctx.createRadialGradient(x, y, 0, x, y, s.r);
        g.addColorStop(0, `rgba(238,226,196,${0.92 * burn})`); g.addColorStop(0.6, `rgba(196,160,104,${0.7 * burn})`); g.addColorStop(1, "rgba(150,110,60,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, s.r, s.r * 0.75, s.rot, 0, 6.28); ctx.fill();
      }
      ring.filter((p) => p.front >= 0).forEach(flower);
      // uzama: ışığa doğru ince boyun, sonra geniş yeni tepe
      if (etiol > 0.01) {
        const nx = CAC.x - 6, ny = CAC.y - CAC.h * 0.9;
        stamp(ctx, spr.neck, nx, ny + 18, 1, -0.24 * etiol, 1, 0.15 + 0.85 * etiol);
        if (cap > 0.01) { const tx = nx + Math.sin(-0.24) * 128 * etiol, ty = ny + 18 - Math.cos(-0.24) * 128 * etiol; stamp(ctx, spr.cap, tx + 4, ty + 14, 0.4 + 0.6 * cap, -0.1, cap); }
      }
    }

    // ---- araçlar
    if (pour > 0.01) {
      can(790, 300, pour, 1);
      ctx.strokeStyle = `rgba(120,180,235,${0.8 * pour})`; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(694, 278); ctx.quadraticCurveTo(650, 380, POT.x + 40, POT.top + 6); ctx.stroke();
    }
    if (ch === 3 || ch === 5) {
      const tx = 912, ty = 150, th = 240;
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "rgba(30,60,40,.45)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(tx - 14, ty, 28, th, 14); ctx.fill(); ctx.stroke();
      const hot = Math.max(0, Math.min(1, (temp - 8) / 16));
      const col = css(mix(hex("#5b8de0"), hex("#e0384e"), hot));
      ctx.beginPath(); ctx.arc(tx, ty + th + 16, 24, 0, 6.28); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
      const lvl = 0.25 + hot * 0.65; ctx.fillStyle = col; ctx.fillRect(tx - 6, ty + th - th * lvl, 12, th * lvl + 6);
      ctx.save(); ctx.font = `600 30px ${hand}`; ctx.fillStyle = "#1d5e35"; ctx.textAlign = "center"; ctx.fillText(`${Math.round(temp)} °C`, tx, ty - 18); ctx.restore();
    }
    const L = labels[ch];
    if (L) {
      const px = ch === 3 || ch === 5 ? 560 : POT.x + 10;
      note(L.problem, px, 110, sm(t, 0.08, 0.2) * (1 - sm(t, 0.44, 0.52)), false);
      note("çözüm: " + L.fix, px - 30, 110, sm(t, 0.56, 0.66), true);
    }
  };
  return { resize, draw };
}

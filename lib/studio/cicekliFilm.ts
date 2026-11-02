/* ============================================================================
   ÇİÇEK COŞTURAN · ÇİÇEKLİ BİTKİLER · DİKEY FİLM (1080×1920, 36 sn)
   Tek kesintisiz kamera:
   S1 0-3.6   makro: sarkık tomurcuklar, alan derinliği, güneş huzmesi + "Yaprak var. / Çiçek yok."
   S2 3.6-7.4 geri çekilme: pencere önünde yorgun sardunya, bulut gölgesi, sebepler hızla kayar
   S3 7.4-9.6 "Çoğu zaman sorun kökte." kamera saksı kesitinden toprağa dalar
   S4 9.6-16.4 yeraltı: katmanlı kökler, altın salgı, izli mavi bakteriler, kök tüyleri
   S5 16.4-19.6 altın besinle yukarı → ışık patlaması → şişe kameraya sıkar, sis ekranı doldurur
   S6 19.6-25.6 sisin içinden derinlikli çiçek patlaması, dönen taç yapraklar
   S7 25.6-29.6 boşlukta süzülen gerçek fotoğraflar
   S8 29.6-36 final: parlak zeminde şişe, ışık süpürmesi, logo, fiyat
   ========================================================================== */
import { CTONE, PAL, bud, css, drawHead, fleshLeaf, geraniumFloret, geraniumLeaf, hex, mix, ovalLeaf, pot, rng, soilTop, sprite, stamp, type FlowerKind, type RGB, type Sprite } from "../flora";
import { growRoots, drawRoots, type Root } from "../roots";
import { createOrchidWorld, createBarkWorld } from "./orchidWorlds";
import { createKaktusWorld, createGritWorld } from "./kaktusWorlds";
import { W, H, clamp01, lerp, seg, sm, inOut, outCubic, outBack, outExpo, kinetic, scriptWipe, whipWord, makeBokeh, drawBokeh, makeMotes, drawMotes, grain, vignette, lightLeak, bloom, flash, type Fonts } from "./fx";

export const DURATION = 36;
export type Assets = { bottle: HTMLImageElement; bottleRatio: number; nozzle: [number, number]; photos: HTMLImageElement[] };
export type FilmCopy = {
  hook: [string, string]; causes: string[]; root: [string, string]; captions: string[];
  bloom: [string, string, string]; photos: string; product: string; price: { sell: number; now: number }; url: string;
};

const INK = "#1d1427", PINK = "#d4246c", PLUM = "#4a2581";

export function createCicekliFilm(canvas: HTMLCanvasElement, F: Fonts, A: Assets, T: FilmCopy, theme: "cicekli" | "orkide" | "kaktus" = "cicekli") {
  const ORK = theme === "orkide", KAK = theme === "kaktus";
  const ACC = ORK ? "#7a3fd1" : KAK ? "#2f9a55" : PINK, ACC2 = ORK ? "#3a1d68" : KAK ? "#1d5e35" : PLUM, DEEP = ORK ? "#4a2581" : KAK ? "#1d5e35" : "#8f1648";
  const VIG = KAK ? "20,50,30" : "60,20,50", COOL = KAK ? "200,240,214" : "230,170,255";
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const buf = document.createElement("canvas"); buf.width = W; buf.height = H;
  const bctx = buf.getContext("2d")!;
  const lay = document.createElement("canvas"); lay.width = W; lay.height = H;
  const lctx = lay.getContext("2d")!;
  const R = rng(2027);

  /* ---------------- sprite'lar (yüksek yoğunluk: makro yakınlaştırmada keskin) ---------------- */
  const D = 3.2;
  const S: Record<string, Sprite> = {};
  const G = PAL.geranium, Wt: RGB = [255, 255, 255], Dk: RGB = [92, 10, 48];
  const tones = [{ base: mix(G.base, Wt, 0.12), mid: mix(G.mid, Wt, 0.16), tip: mix(G.tip, Wt, 0.22) }, G, { base: mix(G.base, Dk, 0.28), mid: mix(G.mid, Dk, 0.24), tip: mix(G.tip, Dk, 0.16) }];
  for (let v = 0; v < 3; v++) S["f" + v] = sprite("st-f" + v, 80, D, [0.5, 0.5], (x, s) => geraniumFloret(x, s * 0.44, tones[v], 11 + v * 7));
  S.bud = sprite("st-bud", 60, 8, [0.5, 0.86], (x, s) => bud(x, s * 0.21, PAL.geranium, 0));
  for (let i = 0; i < 6; i++) {
    S["l" + i] = sprite("st-l" + i, 220, 1.6, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, PAL.leaf, 0.55, 3 + i * 5));
    S["t" + i] = sprite("st-t" + i, 220, 1.6, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, PAL.leafTired, 0.25, 3 + i * 5));
  }
  S.pot = sprite("st-pot", 560, 1.4, [0.5, 0.1], (x) => { pot(x, 440, 420); x.translate(0, 30); soilTop(x, 418, 0); });
  const heads: FlowerKind[] = KAK ? ["cactusflower", "echeveria", "mammillaria", "cactusflower", "aloe", "echeveria", "haworthia"] : ORK ? ["orchid", "orchidW", "catt", "dendro", "onci", "orchid", "orchidW"] : ["geranium", "petunia", "rose", "begonia", "petunia2", "violet", "lily"];
  for (const k of heads) S["h" + k] = sprite("st-h" + k, 360, 1.6, [0.5, 0.5], (x, s) => drawHead(x, k, s));
  S.leafA = sprite("st-la", 300, 1.4, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, PAL.leaf, 0.5, 13));
  S.leafB = sprite("st-lb", 300, 1.4, [0.5, 0.95], (x, s) => ovalLeaf(x, s * 0.85, s * 0.3, PAL.leaf, { gloss: 1 }));
  S.leafK = sprite("st-lk", 300, 1.4, [0.5, 0.95], (x, s) => fleshLeaf(x, s * 0.9, s * 0.11, 0.06, CTONE.aloe, { teeth: true, spots: 9, seed: 5 }));
  S.petal = sprite("st-petal", 60, 2, [0.5, 0.5], (x, s) => {
    x.beginPath(); x.ellipse(0, 0, s * 0.22, s * 0.36, 0, 0, 6.28);
    const g = x.createLinearGradient(0, -s * 0.36, 0, s * 0.36); g.addColorStop(0, ORK ? "#eadcfb" : KAK ? "#ffd5e7" : "#fbc2d8"); g.addColorStop(1, ORK ? "#9b5ad6" : KAK ? "#e3478c" : "#d4246c");
    x.fillStyle = g; x.fill();
    x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = s * 0.03; x.beginPath(); x.moveTo(0, -s * 0.3); x.lineTo(0, s * 0.3); x.stroke();
  });
  S.mist = sprite("st-mist", 120, 1.4, [0.5, 0.5], (x, s) => {
    const g = x.createRadialGradient(0, 0, 0, 0, 0, s / 2);
    const m1 = ORK ? "222,206,248" : KAK ? "214,240,222" : "246,200,222", m2 = ORK ? "196,170,240" : KAK ? "172,220,188" : "236,170,204";
    g.addColorStop(0, "rgba(255,246,250,.55)"); g.addColorStop(0.35, `rgba(${m1},.34)`); g.addColorStop(0.75, `rgba(${m2},.1)`); g.addColorStop(1, `rgba(${m2},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
  });

  /* ---------------- bitki dünyası (S1-S3) ---------------- */
  const POT = { x: 540, y: 1110 };
  const sc = 440 / 300, tf = (x: number, y: number) => ({ x: POT.x + (x - 405) * sc, y: POT.y + (y - 642) * sc });
  type Leaf = { x: number; y: number; r: number; rot: number; z: number; v: number; droop: number; fy: number; bx: number; by: number };
  const leaves: Leaf[] = [];
  [{ n: 6, y: 470, sp: 150, r: 52, z: 0 }, { n: 7, y: 535, sp: 185, r: 60, z: 1 }, { n: 7, y: 600, sp: 205, r: 66, z: 2 }, { n: 5, y: 655, sp: 190, r: 64, z: 3 }].forEach((row) => {
    for (let i = 0; i < row.n; i++) {
      const t = i / (row.n - 1) - 0.5;
      const p = tf(405 + t * row.sp * 2 + (R() - 0.5) * 30, row.y + Math.abs(t) * 60 + (R() - 0.5) * 22);
      const b = tf(405 + t * 70, 668);
      leaves.push({ x: p.x, y: p.y, r: row.r * (0.72 + R() * 0.5) * sc, rot: t * 1.3 + (R() - 0.5) * 0.5, z: row.z + R() * 0.5, v: i % 6, droop: t * 0.9, fy: 0.68 + R() * 0.32, bx: b.x, by: b.y });
    }
  });
  leaves.sort((a, b) => a.z - b.z);
  const umbels = [[292, 372, 60], [368, 290, 68], [458, 248, 74], [548, 296, 66], [612, 378, 58], [418, 352, 62], [508, 382, 56]].map(([x, y, r]) => {
    const p = tf(x, y), b = tf(405 + (x - 405) * 0.45 + (R() - 0.5) * 30, 570 + R() * 30);
    const N = 14 + ((R() * 4) | 0);
    const florets = Array.from({ length: N }, (_, k) => {
      const a = k * 2.39996 + R() * 0.3, d = Math.sqrt((k + 0.6) / N);
      const lit = -Math.sin(a) * d * 0.7 - Math.cos(a) * d * 0.35 + (R() - 0.5) * 0.5;
      return { dx: Math.cos(a) * d * r * sc, dy: Math.sin(a) * d * r * 0.78 * sc - r * 0.12 * sc, k: 1.02 - d * 0.26 + R() * 0.08, d, rot: R() * 6.28, v: lit > 0.25 ? 0 : lit < -0.25 ? 2 : 1 };
    }).sort((a, b) => b.d - a.d);
    return { x: p.x, y: p.y, r: r * sc, bx: b.x, by: b.y, ph: R() * 6, florets };
  });
  const FOCUS = { x: umbels[2].x + 4, y: umbels[2].y + 72 };
  // pencere katmanı (önceden bulanık)
  const win = document.createElement("canvas"); win.width = W; win.height = H;
  {
    const w = win.getContext("2d")!;
    const g = w.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#f7ede8"); g.addColorStop(1, "#efe1e6");
    w.fillStyle = g; w.fillRect(0, 0, W, H);
    w.filter = "blur(14px)";
    const sky = w.createLinearGradient(0, 160, 0, 1250); sky.addColorStop(0, "#cfe3f7"); sky.addColorStop(1, "#fff4e4");
    w.fillStyle = sky; w.fillRect(110, 150, 860, 1120);
    const sun = w.createRadialGradient(780, 380, 0, 780, 380, 420); sun.addColorStop(0, "rgba(255,236,190,1)"); sun.addColorStop(1, "rgba(255,236,190,0)");
    w.fillStyle = sun; w.fillRect(110, 150, 860, 1120);
    w.fillStyle = "rgba(160,190,140,.55)"; for (let i = 0; i < 9; i++) { w.beginPath(); w.arc(150 + i * 100, 1180 - (i % 3) * 30, 90, 0, 6.28); w.fill(); }
    w.strokeStyle = "#f4eef0"; w.lineWidth = 36; w.strokeRect(110, 150, 860, 1120);
    w.lineWidth = 22; w.beginPath(); w.moveTo(540, 150); w.lineTo(540, 1270); w.moveTo(110, 700); w.lineTo(970, 700); w.stroke();
    w.filter = "none";
    w.fillStyle = "#fbf6f4"; w.fillRect(0, 1500, W, 70);
    w.fillStyle = "rgba(120,80,90,.12)"; w.fillRect(0, 1570, W, 12);
    const wall = w.createLinearGradient(0, 1580, 0, H); wall.addColorStop(0, "#efe2e6"); wall.addColorStop(1, "#e6d6dd"); w.fillStyle = wall; w.fillRect(0, 1582, W, H);
  }
  const OW = ORK ? createOrchidWorld(win, lctx, lay) : KAK ? createKaktusWorld(lctx, lay) : null;
  // saksı kesiti kökleri (S3)
  const potRoots: Root[] = growRoots(9, { x: POT.x, y: POT.y + 50 }, { left: (y) => POT.x - 190 + (y - POT.y) * 0.12, right: (y) => POT.x + 190 - (y - POT.y) * 0.12, bottom: POT.y + 400, top: POT.y + 40 }, { mains: 7, step: 16, maxSteps: 22, width: 7, spread: 1.6, branch: 0.18, stopAtBottom: true });

  const drawPlantWorld = (c: CanvasRenderingContext2D, t: number, cam: { x: number; y: number; z: number; r: number }, st: { vigor: number; leafBlur: number; cut: number; cloud: number }) => {
    c.save();
    // pencere (kamera ile hafif paralaks)
    c.save();
    c.translate(W / 2, H / 2); c.scale(1 + (cam.z - 1) * 0.25, 1 + (cam.z - 1) * 0.25); c.translate(-W / 2 - (cam.x - W / 2) * 0.25, -H / 2 - (cam.y - 1100) * 0.25);
    c.drawImage(win, 0, 0);
    c.restore();
    c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.rotate(cam.r); c.translate(-cam.x, -cam.y);
    // saksı
    stamp(c, S.pot, POT.x, POT.y);
    // saksı kesiti
    if (st.cut > 0.01) {
      c.save(); c.globalAlpha = st.cut;
      c.beginPath(); c.moveTo(POT.x - 205, POT.y + 70); c.lineTo(POT.x - 160, POT.y + 410); c.lineTo(POT.x + 160, POT.y + 410); c.lineTo(POT.x + 205, POT.y + 70); c.closePath(); c.clip();
      const sg = c.createLinearGradient(0, POT.y, 0, POT.y + 420); sg.addColorStop(0, "#8a6447"); sg.addColorStop(1, "#4f3524");
      c.fillStyle = sg; c.fillRect(POT.x - 220, POT.y, 440, 440);
      const GR = rng(3); for (let i = 0; i < 500; i++) { c.fillStyle = GR() > 0.88 ? "rgba(245,240,230,.7)" : "rgba(40,22,12,.32)"; c.beginPath(); c.arc(POT.x - 200 + GR() * 400, POT.y + 60 + GR() * 350, 1.2 + GR() * 2.2, 0, 6.28); c.fill(); }
      drawRoots(c, potRoots, 1, { fill: "#f6ecda", ink: "rgba(70,40,20,.55)", hair: 0.4 });
      c.restore();
    }
    // yapraklar + saplar (alan derinliği: ayrı katman + bulanıklık)
    const leafPass = (front: boolean) => {
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
      lctx.setTransform(c.getTransform());
      for (const L of leaves) {
        if ((L.z >= 2) !== front) continue;
        const sw = Math.sin(t * 0.9 + L.v) * 4;
        const droop = (1 - st.vigor) * (0.35 + Math.abs(L.droop) * 0.6) * Math.sign(L.droop || 1);
        const lx = L.x + sw + droop * 38, ly = L.y + (1 - st.vigor) * 50;
        lctx.strokeStyle = css(mix(PAL.leaf.base, PAL.leafTired.base, 1 - st.vigor)); lctx.lineWidth = 3.4; lctx.lineCap = "round";
        lctx.beginPath(); lctx.moveTo(L.bx, L.by); lctx.quadraticCurveTo((L.bx + lx) / 2, Math.min(L.by, ly) - 26, lx, ly + L.r * 0.35); lctx.stroke();
        const s2 = L.r / 99, rot = L.rot + droop * 0.5;
        stamp(lctx, S["t" + L.v], lx, ly, s2, rot, 1, L.fy);
        stamp(lctx, S["l" + L.v], lx, ly, s2, rot, st.vigor, L.fy);
      }
      if (!front) for (const u of umbels) {
        const sw = Math.sin(t * 0.9 + u.ph) * 9;
        lctx.strokeStyle = css(mix(PAL.leaf.dark, PAL.leafTired.dark, 1 - st.vigor)); lctx.lineWidth = 6;
        lctx.beginPath(); lctx.moveTo(u.bx, u.by); lctx.quadraticCurveTo((u.bx + u.x) / 2 + (u.x - u.bx) * 0.25, (u.by + u.y) / 2 + 40, u.x + sw, u.y + (1 - st.vigor) * 60); lctx.stroke();
      }
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      c.filter = st.leafBlur > 0.3 ? `blur(${st.leafBlur.toFixed(1)}px)` : "none";
      c.drawImage(lay, 0, 0);
      c.restore();
    };
    leafPass(false);
    // tomurcuk demetleri (keskin)
    for (const u of umbels) {
      const sw = Math.sin(t * 0.9 + u.ph) * 9, ux = u.x + sw, uy = u.y + (1 - st.vigor) * 60;
      for (let b = 0; b < 9; b++) {
        const a = (b - 4) * 0.2;
        stamp(c, S.bud, ux + Math.sin(a) * 19, uy + 3 + Math.abs(b - 4) * 1.8, 1.25 + ((b * 7) % 3) * 0.15, Math.PI + a * 1.6 + Math.sin(t * 1.3 + b) * 0.04, 1);
      }
    }
    leafPass(true);
    c.restore();
    // bulut gölgesi
    if (st.cloud > 0.01) {
      const x = lerp(-W * 0.6, W * 1.6, st.cloud);
      const g = c.createRadialGradient(x, H * 0.45, 0, x, H * 0.45, W * 0.9);
      g.addColorStop(0, "rgba(60,70,110,.32)"); g.addColorStop(1, "rgba(60,70,110,0)");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
  };

  /* ---------------- yeraltı dünyası (S4-S5) ---------------- */
  const BW = ORK ? createBarkWorld(lctx, lay) : KAK ? createGritWorld(lctx, lay) : null;
  const UG = { w: 1400, h: 3000 };
  const ugRoots = growRoots(41, { x: W / 2, y: -100 }, { left: () => -150, right: () => W + 150, bottom: UG.h, top: -200 }, { mains: 5, step: 30, maxSteps: 62, width: 26, spread: 2.0, branch: 0.12 });
  const farRoots = growRoots(77, { x: W / 2 + 80, y: -100 }, { left: () => -200, right: () => W + 200, bottom: UG.h, top: -200 }, { mains: 7, step: 24, maxSteps: 70, width: 9, spread: 2.6, branch: 0.14 });
  const pick = () => { const r = ugRoots[(R() * ugRoots.length) | 0]; return r.pts[(R() * r.pts.length) | 0]; };
  const exud = Array.from({ length: 220 }, () => { const p = pick(); return { x: p.x, y: p.y, a: R() * 6.28, ph: R(), sp: 0.3 + R() * 0.5, s: 2.5 + R() * 3.5 }; });
  const microbes = Array.from({ length: 230 }, () => { const p = pick(); const a = R() * 6.28, d = p.w * 0.5 + 6 + R() * 14; return { hx: p.x + Math.cos(a) * d, hy: p.y + Math.sin(a) * d, sx: R() * W, sy: p.y + (R() - 0.5) * 900, d0: R() * 1.2, s: 2.2 + R() * 2.4 }; });
  const nutr = Array.from({ length: 160 }, () => ({ r: ugRoots[(R() * ugRoots.length) | 0], off: R(), sp: 0.25 + R() * 0.3, fe: R() > 0.62 }));
  const grains = Array.from({ length: 700 }, () => ({ x: R() * W, y: R() * UG.h, s: 1 + R() * 3.4, c: R(), z: R() }));
  const rush = Array.from({ length: 160 }, () => ({ x: R() * W, y: R(), l: 60 + R() * 260, w: 1 + R() * 3, c: R() }));

  const drawUnderground = (c: CanvasRenderingContext2D, u: number, camY: number, speed: number) => {
    const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#5e3f2c"); bg.addColorStop(1, "#2e1f15");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    // hacimsel ışık lekeleri
    c.save(); c.globalCompositeOperation = "screen";
    for (let i = 0; i < 5; i++) { const x = W * (0.2 + 0.15 * i) + Math.sin(u * 0.4 + i) * 60, y = H * (0.25 + 0.12 * i); const g = c.createRadialGradient(x, y, 0, x, y, 420); g.addColorStop(0, "rgba(255,190,130,.12)"); g.addColorStop(1, "rgba(255,190,130,0)"); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    c.restore();
    // uzak taneler + kökler (bulanık)
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
    lctx.translate(0, -camY * 0.55);
    for (const g of grains) if (g.z < 0.5) { lctx.fillStyle = g.c > 0.85 ? "rgba(255,240,220,.35)" : "rgba(20,10,5,.4)"; lctx.beginPath(); lctx.arc(g.x, g.y, g.s, 0, 6.28); lctx.fill(); }
    drawRoots(lctx, farRoots, 1, { fill: "rgba(220,200,170,.55)", ink: "rgba(40,25,15,.3)" });
    c.save(); c.filter = "blur(7px)"; c.globalAlpha = 0.75; c.drawImage(lay, 0, 0); c.restore();
    // ana kökler
    c.save(); c.translate(0, -camY);
    const halo = sm(u, 2.6, 4.2), hair = sm(u, 3.6, 5.0);
    drawRoots(c, ugRoots, 1, { fill: "#f8eedd", ink: "rgba(60,35,20,.65)", hair: hair * 1.1, halo: halo * 0.9 });
    // salgılar
    const ex = sm(u, 0.1, 0.8) * (1 - sm(u, 2.8, 3.6) * 0.7);
    if (ex > 0.01) { c.save(); c.globalCompositeOperation = "lighter"; for (const e of exud) { const cyc = (u * e.sp + e.ph) % 1, d = cyc * 40; c.fillStyle = `rgba(255,190,60,${Math.sin(cyc * Math.PI) * 0.75 * ex})`; c.beginPath(); c.arc(e.x + Math.cos(e.a) * d, e.y + Math.sin(e.a) * d, e.s, 0, 6.28); c.fill(); } c.restore(); }
    // bakteriler (izli)
    const mb = sm(u, 1.4, 1.9);
    if (mb > 0.01) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const m of microbes) {
        const st = outCubic((u - 1.4 - m.d0) / 1.5);
        const x = lerp(m.sx, m.hx, st) + Math.sin(u * 2 + m.d0 * 20) * (1 - st) * 6, y = lerp(m.sy, m.hy, st);
        if (st < 1) { const px = lerp(m.sx, m.hx, Math.max(0, st - 0.12)), py = lerp(m.sy, m.hy, Math.max(0, st - 0.12)); c.strokeStyle = `rgba(90,150,255,${0.35 * mb})`; c.lineWidth = m.s * 0.9; c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke(); }
        c.fillStyle = `rgba(80,140,255,${0.16 * mb})`; c.beginPath(); c.arc(x, y, m.s * 2.4, 0, 6.28); c.fill();
        c.fillStyle = `rgba(150,195,255,${0.95 * mb})`; c.beginPath(); c.arc(x, y, m.s, 0, 6.28); c.fill();
      }
      c.restore();
    }
    // besin akışı
    const nu = sm(u, 4.9, 5.6);
    if (nu > 0.01) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const n of nutr) {
        const cyc = (u * n.sp + n.off) % 1, len = n.r.pts.length;
        const f = (1 - cyc) * (len - 1), i = Math.floor(f), fr = f - i;
        const a = n.r.pts[i], b = n.r.pts[Math.min(len - 1, i + 1)];
        const x = a.x + (b.x - a.x) * fr, y = a.y + (b.y - a.y) * fr;
        const col = n.fe ? "255,140,70" : "255,205,80";
        c.strokeStyle = `rgba(${col},${0.5 * nu})`; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x - (b.x - a.x) * 2, y - (b.y - a.y) * 2 + 18 + speed * 0.4); c.stroke();
        c.fillStyle = `rgba(${col},${0.95 * nu})`; c.beginPath(); c.arc(x, y, 4.5, 0, 6.28); c.fill();
      }
      c.restore();
    }
    c.restore();
    // yakın taneler + hız çizgileri
    c.save(); c.translate(0, -camY * 1.6);
    for (const g of grains) if (g.z >= 0.82) { c.fillStyle = g.c > 0.85 ? "rgba(255,240,220,.6)" : "rgba(15,8,4,.6)"; c.beginPath(); c.arc(g.x, g.y, g.s * 2.4, 0, 6.28); c.fill(); }
    c.restore();
    if (speed > 2) {
      c.save(); c.globalCompositeOperation = "lighter";
      for (const s of rush) { const y = ((s.y * H + camY * 2.2) % (H + 400)) - 200; c.strokeStyle = s.c > 0.6 ? `rgba(255,205,90,${Math.min(0.6, speed / 60)})` : `rgba(255,235,210,${Math.min(0.35, speed / 90)})`; c.lineWidth = s.w; c.beginPath(); c.moveTo(s.x, y); c.lineTo(s.x, y + s.l * Math.min(3, speed / 14)); c.stroke(); }
      c.restore();
    }
  };

  /* ---------------- sprey sahnesi (S5) ---------------- */
  const BOT = { h: 1250, x: W / 2 + 60, base: 1720 };
  const mist = Array.from({ length: 1300 }, () => ({ b: 1.75 + R() * 1.25, a: Math.PI + (R() - 0.5) * 1.6, sp: 300 + R() * 700, r0: 6 + R() * 18, ph: R() }));
  const rays = Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * 6.28, w: 0.08 + R() * 0.1, l: 0.5 + R() * 0.5 }));
  const drawBottle = (c: CanvasRenderingContext2D, x: number, base: number, h: number, rot = 0) => {
    const w = h * A.bottleRatio;
    c.save(); c.translate(x, base); c.rotate(rot); c.drawImage(A.bottle, -w / 2, -h, w, h); c.restore();
    return { nx: x - w / 2 + A.nozzle[0] * w, ny: base - h + A.nozzle[1] * h, w };
  };

  /* ---------------- çiçek patlaması (S6-S7) ---------------- */
  type Fl = { x: number; y: number; s: number; k: FlowerKind; d: number; rot: number; layer: 0 | 1 | 2; leaf: number };
  const fls: Fl[] = [];
  const addRing = (n: number, layer: 0 | 1 | 2, rx: number, ry: number, smin: number, smax: number, d0: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + R() * 0.4, ring = 0.85 + R() * 0.35;
      fls.push({ x: W / 2 + Math.cos(a) * rx * ring, y: H * 0.48 + Math.sin(a) * ry * ring, s: smin + R() * (smax - smin), k: heads[(R() * heads.length) | 0], d: d0 + R() * 1.4, rot: R() * 6.28, layer, leaf: (R() * 2) | 0 });
    }
  };
  addRing(16, 0, 470, 800, 140, 210, 0.3);
  addRing(16, 1, 520, 760, 260, 380, 0.15);
  addRing(7, 2, 640, 980, 520, 720, 0.5);
  const petals = Array.from({ length: 90 }, () => ({ a: R() * 6.28, r: 120 + R() * 520, y: (R() - 0.5) * 1800, sp: 0.4 + R() * 0.6, rot: R() * 6.28, vr: (R() - 0.5) * 4, s: 0.8 + R() * 1.4 }));
  const drawBloom = (c: CanvasRenderingContext2D, w: number, rot: number, zoom: number) => {
    const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, ORK ? "#f9f3ff" : KAK ? "#f4fbf6" : "#fff1f6"); bg.addColorStop(1, KAK ? "#e5f3e9" : "#f2eaff");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    drawBokeh(c, bokehB, w + 20, 0.9);
    for (const layer of [0, 1, 2] as const) {
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
      const z = layer === 2 ? zoom * 1.12 : layer === 0 ? 1 + (zoom - 1) * 0.5 : zoom;
      lctx.translate(W / 2, H * 0.48); lctx.scale(z, z); lctx.rotate(rot * (layer === 2 ? 1.6 : layer === 0 ? 0.6 : 1)); lctx.translate(-W / 2, -H * 0.48);
      for (const f of fls) {
        if (f.layer !== layer) continue;
        const q = (w - f.d) / 0.9;
        if (q <= 0) continue;
        const s = f.s / 360;
        const lq = outCubic((w - f.d + 0.2) / 0.7);
        stamp(lctx, KAK ? S.leafK : f.leaf && !ORK ? S.leafA : S.leafB, f.x + Math.cos(f.rot) * f.s * 0.42, f.y + Math.sin(f.rot) * f.s * 0.42, s * (KAK ? 0.95 : 1.5) * lq, f.rot + 1.57, lq);
        stamp(lctx, S["h" + f.k], f.x, f.y, s * outBack(q), f.rot * 0.2 + (1 - outCubic(q)) * -0.9 + Math.sin(w * 0.8 + f.rot) * 0.04, clamp01(q * 3));
      }
      c.save();
      c.filter = layer === 0 ? "blur(5px) saturate(.9)" : layer === 2 ? "blur(16px)" : "none";
      c.globalAlpha = layer === 0 ? 0.75 : 1;
      c.drawImage(lay, 0, 0);
      c.restore();
    }
    // dönen taç yapraklar (perspektif)
    for (const p of petals) {
      const ang = p.a + w * p.sp, zz = 1.6 + Math.sin(ang) * 1.0;
      const x = W / 2 + Math.cos(ang) * p.r * (1.6 / zz), y = H * 0.48 + (p.y - w * 120 * p.sp) % 1900 / zz;
      const s2 = p.s * (1.8 / zz);
      if (zz < 0.9) { c.save(); c.filter = "blur(6px)"; stamp(c, S.petal, x, y, s2, p.rot + w * p.vr, 0.9, 0.6 + 0.4 * Math.abs(Math.sin(w * 2 + p.rot))); c.restore(); }
      else stamp(c, S.petal, x, y, s2, p.rot + w * p.vr, 0.85, 0.6 + 0.4 * Math.abs(Math.sin(w * 2 + p.rot)));
    }
  };

  const bokehA = makeBokeh(11, 18, KAK ? ["214,242,222", "255,236,214", "255,220,234"] : ["255,214,226", "255,236,214", "232,220,255"]);
  const bokehB = makeBokeh(12, 22, KAK ? ["200,236,212", "255,224,236", "236,248,222"] : ["253,200,222", "236,214,255", "255,230,240"]);
  const motes = makeMotes(13, 140);
  const fallPetals = Array.from({ length: 40 }, () => ({ x: R() * W, y: R() * H, sp: 60 + R() * 90, rot: R() * 6, vr: (R() - 0.5) * 3, s: 0.8 + R() * 1.2, sw: R() * 6 }));

  /* ======================================================================== */
  const render = (t: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none"; ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    let vig = 0.22, leak = 0, grainK = 0.06, bloomK = 0, vigCol = VIG;

    if (t < 9.8) {
      /* ---------------- S1-S3: bitki dünyası ---------------- */
      const pull = inOut(seg(t, 3.6, 5.2));
      const dive1 = inOut(seg(t, 7.4, 8.7)), dive2 = Math.pow(seg(t, 8.6, 9.7), 2.2);
      const cam = {
        x: lerp(lerp((OW ? OW.FOCUS : FOCUS).x, 540, pull), 540, dive1),
        y: lerp(lerp((OW ? OW.FOCUS : FOCUS).y + 10, 1060, pull), OW ? OW.POT.top + 230 : POT.y + 250, dive1),
        z: lerp(lerp(7.4 - t * 0.18, 1.0 + seg(t, 5.2, 7.4) * 0.06, Math.pow(pull, 0.55)), 1.55, dive1) * (1 + dive2 * (KAK ? 9 : 6)),
        r: Math.sin(t * 0.3) * 0.01,
      };
      const st = { vigor: 0.08, leafBlur: lerp(34, 0, Math.pow(pull, 0.6)) + dive2 * 10, cut: sm(t, 8.1, 8.7), cloud: seg(t, 5.0, 7.2) };
      if (OW) OW.draw(ctx, t, cam, st); else drawPlantWorld(ctx, t, cam, st);
      // güneş huzmesi + toz
      const beam = (1 - pull * 0.5) * (1 - st.cloud * 0.8 * Math.sin(st.cloud * Math.PI));
      ctx.save(); ctx.globalCompositeOperation = "screen";
      const bg = ctx.createLinearGradient(W, 0, 0, H);
      bg.addColorStop(0, `rgba(255,232,190,${0.42 * beam})`); bg.addColorStop(0.6, "rgba(255,232,190,0)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W, 420); ctx.lineTo(0, H); ctx.lineTo(0, 1100); ctx.lineTo(560, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      drawMotes(ctx, motes, t, 0.9 * beam);
      // ön plan bulanık yaprak (makro derinliği)
      if (pull < 1) { ctx.save(); ctx.filter = "blur(22px)"; ctx.globalAlpha = 0.9 * (1 - pull); if (KAK) { stamp(ctx, S.leafK, 110 + t * 14, 1940 - t * 10, 3.6, -0.7, 1, 0.8); stamp(ctx, S.leafK, 1050 - t * 10, 90 + t * 8, 3.0, 2.7, 1, 0.8); } else if (ORK) { stamp(ctx, S.leafB, 120 + t * 14, 1900 - t * 10, 3.4, -0.9, 1, 0.8); stamp(ctx, S.leafB, 1040 - t * 10, 120 + t * 8, 2.8, 2.6, 1, 0.8); } else { stamp(ctx, S.l2, 150 + t * 14, 1620 - t * 10, 4.2, -0.6, 1, 0.8); stamp(ctx, S.l4, 1000 - t * 10, 260 + t * 8, 3.4, 2.4, 1, 0.8); } ctx.restore(); }
      leak = 0.7 - pull * 0.3; vig = 0.2;
      // yazılar (arkada yumuşak ışık plakası: okunurluk)
      const plate = (y: number, a: number) => { if (a <= 0) return; const g = ctx.createRadialGradient(W / 2, y, 0, W / 2, y, 560); g.addColorStop(0, `rgba(255,250,252,${0.82 * a})`); g.addColorStop(0.55, `rgba(255,250,252,${0.45 * a})`); g.addColorStop(1, "rgba(255,250,252,0)"); ctx.save(); ctx.translate(W / 2, y); ctx.scale(1, 0.55); ctx.translate(-W / 2, -y); ctx.fillStyle = g; ctx.fillRect(0, y - 600, W, 1200); ctx.restore(); };
      plate(640, sm(t, 0.2, 0.8) * (1 - seg(t, 3.5, 4.1)));
      plate(540, sm(t, 4.4, 4.6) * (1 - seg(t, 7.3, 7.5)) * 0.8);
      plate(560, sm(t, 7.35, 7.6) * (1 - seg(t, 9.1, 9.5)));
      const hookOut = seg(t, 3.5, 3.9);
      kinetic(ctx, T.hook[0], W / 2, 560, { size: 138, family: F.display, color: INK, el: t - 0.35, out: 3.25, shadow: "rgba(255,255,255,.9)" });
      if (t < 4.1) scriptWipe(ctx, T.hook[1], W / 2, 760, { size: 190, family: F.script, color: ACC, p: seg(t, 1.3, 2.4), alpha: 1 - hookOut, glow: "rgba(255,255,255,.95)" });
      // sebepler: hızla kayan kelimeler
      T.causes.forEach((word, i) => {
        const s0 = 4.5 + i * 0.72, e = t - s0;
        if (e < 0 || e > 0.72) return;
        const inP = outExpo(e / 0.18), outP = seg(e, 0.56, 0.72);
        const x = lerp(W + 520, W / 2, inP) - outP * outP * (W + 300);
        const v = e < 0.18 ? -(1 - inP) * 140 : outP > 0 ? -outP * 160 : 0;
        ctx.save(); ctx.shadowColor = "rgba(255,255,255,.95)"; ctx.shadowBlur = 40;
        whipWord(ctx, word, x, 520, { size: 132, family: F.display, color: INK, v, alpha: 1 });
        ctx.restore();
      });
      // "Çoğu zaman / sorun kökte."
      kinetic(ctx, T.root[0], W / 2, 470, { size: 120, family: F.display, color: INK, el: t - 7.45, out: 1.85, shadow: "rgba(255,255,255,.95)" });
      scriptWipe(ctx, T.root[1], W / 2, 650, { size: 176, family: F.script, color: ACC, p: seg(t, 7.8, 8.6), alpha: 1 - seg(t, 9.15, 9.45), glow: "rgba(255,255,255,.95)" });
      // toprağa dalış: taneler hızla yukarı akar
      if (dive2 > 0.05) {
        ctx.save();
        for (const s of rush) { const y = ((s.y * H - (t - 8.6) * 2600 * s.c) % H + H) % H; ctx.fillStyle = s.c > 0.7 ? `rgba(255,236,210,${0.5 * dive2})` : `rgba(40,22,12,${0.7 * dive2})`; ctx.fillRect(s.x, y, s.w * 2, s.l * dive2); }
        ctx.restore();
        ctx.fillStyle = `rgba(60,40,28,${sm(t, 9.2, 9.8)})`; ctx.fillRect(0, 0, W, H);
      }
    } else if (t < 18.0) {
      /* ---------------- S4-S5a: yeraltı ---------------- */
      const u = t - 9.6;
      const riseP = seg(t, 16.0, 17.6);
      const camY = 900 - u * 55 - Math.pow(riseP, 2.2) * 2200;
      const speed = riseP * 70;
      if (BW) BW.draw(ctx, u, camY, speed); else drawUnderground(ctx, u, camY, speed);
      // toprak yüzeyi ve yukarıdan gelen ışık
      if (riseP > 0.3) {
        const k = sm(riseP, 0.3, 1);
        const g = ctx.createLinearGradient(0, 0, 0, H * 0.7); g.addColorStop(0, `rgba(255,248,236,${k})`); g.addColorStop(1, "rgba(255,248,236,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      ctx.fillStyle = `rgba(60,40,28,${1 - sm(t, 9.6, 10.2)})`; ctx.fillRect(0, 0, W, H);
      // altyazılar
      T.captions.forEach((cap, i) => {
        const s0 = 10.2 + i * 1.55;
        kinetic(ctx, cap, W / 2, 1480, { size: Math.min(66, Math.floor(1800 / cap.length)), family: F.display, color: "#fff6ea", el: t - s0, out: 1.3, outDur: 0.25, shadow: "rgba(30,15,8,.9)", stagger: 0.02 });
      });
      vig = 0.5; vigCol = "20,8,4"; bloomK = 0.55; grainK = 0.08;
      flash(ctx, sm(t, 17.5, 17.85));
    } else if (t < 20.6) {
      /* ---------------- S5b: ışık + şişe + kameraya sis ---------------- */
      const v = t - 16.4;
      const bg = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, H * 0.8);
      bg.addColorStop(0, KAK ? "#fbfefb" : "#fff9fb"); bg.addColorStop(0.5, ORK ? "#f1e7fd" : KAK ? "#e6f5ea" : "#fde8f1"); bg.addColorStop(1, KAK ? "#d9eee0" : "#ecdcf8");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // dönen ışık hüzmeleri
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.translate(W / 2, H * 0.4); ctx.rotate(v * 0.12);
      for (const r of rays) { ctx.fillStyle = `rgba(255,236,246,${0.5 * r.l})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, H, r.a, r.a + r.w); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      drawBokeh(ctx, bokehA, v, 0.8);
      const settle = outBack(seg(v, 1.2, 1.9));
      const dip = Math.sin(seg(v, 1.68, 1.86) * Math.PI) * 18;
      const bh = BOT.h * (1.08 - 0.08 * settle);
      const b = drawBottle(ctx, BOT.x, BOT.base + dip + (1 - settle) * 220, bh, -0.05 + Math.sin(v * 0.8) * 0.01);
      // kameraya doğru sis
      for (const m of mist) {
        const a = v - m.b;
        if (a < 0 || a > 1.6) continue;
        const z = Math.max(0.1, 1 - a * 0.85);
        const x = b.nx + Math.cos(m.a) * m.sp * a / z * 0.55, y = b.ny + Math.sin(m.a) * m.sp * a / z * 0.55 + a * a * 80;
        const s = (m.r0 / z) / 60;
        const al = Math.min(1, a * 6) * (1 - seg(a, 1.1, 1.6)) * 0.8;
        if (z < 0.5) { ctx.save(); ctx.filter = "blur(14px)"; stamp(ctx, S.mist, x, y, s * 1.3, 0, al); ctx.restore(); } else stamp(ctx, S.mist, x, y, s, 0, al);
      }
      // parıltılar
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (const m of mist) { const a = v - m.b; if (a < 0.05 || a > 1.2 || m.ph < 0.6) continue; const z = Math.max(0.12, 1 - a * 0.85); const x = b.nx + Math.cos(m.a) * m.sp * a / z * 0.55, y = b.ny + Math.sin(m.a) * m.sp * a / z * 0.55 + a * a * 80; ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - a / 1.2)})`; ctx.beginPath(); ctx.arc(x, y, 2.5 / z, 0, 6.28); ctx.fill(); }
      ctx.restore();
      flash(ctx, sm(v, 2.85, 3.2) * 0.94, "255,244,250");
      flash(ctx, 1 - sm(v, 1.2, 1.55));
      leak = 0.6; vig = 0.12; bloomK = 0.35;
    } else if (t < 29.6) {
      /* ---------------- S6-S7: çiçek patlaması + fotoğraflar ---------------- */
      const w = t - 19.6;
      const rot = Math.sin(w * 0.35) * 0.035 - 0.02;
      const zoom = 1 + seg(w, 0, 6) * 0.14 + seg(t, 25.6, 29.6) * 0.05;
      drawBloom(ctx, w, rot, zoom);
      const photo = seg(t, 25.4, 26.2);
      if (photo > 0) {
        // fotoğraf sahnesi: arka plan rüya gibi bulanık
        ctx.save(); ctx.globalCompositeOperation = "source-over";
        bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.clearRect(0, 0, W, H); bctx.drawImage(canvas, 0, 0);
        ctx.filter = `blur(${(photo * 16).toFixed(1)}px)`; ctx.drawImage(buf, 0, 0); ctx.filter = "none";
        ctx.fillStyle = `rgba(255,248,252,${0.35 * photo})`; ctx.fillRect(0, 0, W, H);
        ctx.restore();
        const q = t - 25.6;
        const pos = [{ x: 300, y: 930, r: -0.13 }, { x: 790, y: 960, r: 0.12 }, { x: 545, y: 880, r: -0.01 }];
        [0, 1, 2].forEach((i) => {
          const img = A.photos[i];
          const e = outCubic((q - i * 0.28) / 0.9);
          if (e <= 0) return;
          const out = Math.pow(seg(q, 3.45, 4.0), 2);
          const p = pos[i];
          const ph = 700, pw = ph * (img.naturalWidth / img.naturalHeight || 2 / 3);
          const s = lerp(0.25, 1, e) * (1 + out * 2.6);
          ctx.save();
          ctx.translate(p.x + (p.x - W / 2) * out * 2, p.y + Math.sin(q * 1.2 + i) * 10 - (1 - e) * 300);
          ctx.rotate(p.r * e + (1 - e) * (i - 1) * 0.6);
          ctx.scale(s, s);
          ctx.globalAlpha = e * (1 - out);
          ctx.shadowColor = "rgba(90,20,60,.35)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30;
          ctx.fillStyle = "#fff"; ctx.fillRect(-pw / 2 - 20, -ph / 2 - 20, pw + 40, ph + 90);
          ctx.shadowColor = "transparent";
          ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph);
          ctx.restore();
        });
        kinetic(ctx, T.photos, W / 2, 1460, { size: 84, family: F.display, color: INK, el: q - 0.9, out: 3.3, shadow: "rgba(255,255,255,.95)" });
        flash(ctx, sm(t, 29.3, 29.6));
      } else {
        // açılış: sis dağılır
        flash(ctx, 0.94 * (1 - sm(w, 0, 1.2)), "255,244,250");
        kinetic(ctx, T.bloom[0], W / 2, 860, { size: 104, family: F.display, color: INK, el: w - 1.3, out: 4.1, shadow: "rgba(255,255,255,1)" });
        kinetic(ctx, T.bloom[1], W / 2, 975, { size: 104, family: F.display, color: INK, el: w - 1.55, out: 3.9, shadow: "rgba(255,255,255,1)" });
        kinetic(ctx, T.bloom[2], W / 2, 1065, { size: 44, family: F.sans, weight: 700, color: DEEP, el: w - 2.3, out: 3.2, shadow: "rgba(255,255,255,1)", stagger: 0.012 });
      }
      leak = 0.5; vig = 0.14; bloomK = 0.28;
    } else {
      /* ---------------- S8: final ---------------- */
      const f = t - 29.6;
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, KAK ? "#f6fbf7" : "#fff3f8"); bg.addColorStop(0.62, KAK ? "#eef8f1" : "#fbeef6"); bg.addColorStop(1, KAK ? "#e2f1e7" : "#f1e6fb");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      drawBokeh(ctx, bokehB, f + 30, 0.75);
      // parlak zemin
      const fl = ctx.createRadialGradient(W / 2, 1330, 0, W / 2, 1330, 620);
      fl.addColorStop(0, "rgba(255,255,255,.95)"); fl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save(); ctx.translate(W / 2, 1330); ctx.scale(1, 0.16); ctx.translate(-W / 2, -1330); ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(W / 2, 1330, 620, 0, 6.28); ctx.fill(); ctx.restore();
      const rise = outBack(seg(f, 0.15, 1.05));
      const bh = 860, baseY = 1330 + (1 - rise) * 700;
      const bw = bh * A.bottleRatio;
      const zoom = 1 + seg(f, 1, 6.4) * 0.04;
      ctx.save(); ctx.translate(W / 2, 900); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -900);
      // yansıma
      ctx.save(); ctx.globalAlpha = 0.16 * rise; ctx.translate(W / 2, baseY); ctx.scale(1, -0.55); ctx.drawImage(A.bottle, -bw / 2, -bh, bw, bh); ctx.restore();
      const rg = ctx.createLinearGradient(0, baseY, 0, baseY + 420); const rc = KAK ? "238,248,241" : "251,238,246"; rg.addColorStop(0, `rgba(${rc},0)`); rg.addColorStop(1, `rgba(${rc},1)`);
      ctx.fillStyle = rg; ctx.fillRect(0, baseY, W, 420);
      // şişe + ışık süpürmesi (şişe maskesiyle)
      bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.clearRect(0, 0, W, H); bctx.globalCompositeOperation = "source-over";
      bctx.drawImage(A.bottle, W / 2 - bw / 2, baseY - bh, bw, bh);
      const sw = seg(f, 1.1, 2.0);
      if (sw > 0 && sw < 1) {
        bctx.globalCompositeOperation = "source-atop";
        const sx = lerp(-300, W + 300, sw);
        const g = bctx.createLinearGradient(sx - 160, 0, sx + 160, 0);
        g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,.75)"); g.addColorStop(1, "rgba(255,255,255,0)");
        bctx.save(); bctx.translate(0, 0); bctx.transform(1, 0, -0.35, 1, 0, 0); bctx.fillStyle = g; bctx.fillRect(-400, 0, W + 800, H); bctx.restore();
        bctx.globalCompositeOperation = "source-over";
      }
      ctx.shadowColor = "rgba(90,20,60,.28)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26;
      ctx.drawImage(buf, 0, 0);
      ctx.shadowColor = "transparent";
      ctx.restore();
      // köşelerde çiçekler
      const corner: [FlowerKind, number, number, number, number][] = KAK ? [["cactusflower", 150, 1400, 330, 0.4], ["echeveria", 950, 1380, 330, 0.55], ["mammillaria", 60, 1170, 260, 0.7], ["cactusflower", 1030, 1150, 240, 0.85], ["echeveria", 250, 1560, 230, 0.95], ["cactusflower", 840, 1560, 220, 1.05]] : ORK ? [["orchid", 150, 1400, 330, 0.4], ["catt", 950, 1380, 320, 0.55], ["orchidW", 60, 1170, 250, 0.7], ["dendro", 1030, 1150, 240, 0.85], ["onci", 250, 1560, 230, 0.95], ["orchidW", 840, 1560, 220, 1.05]] : [["rose", 150, 1410, 330, 0.4], ["geranium", 950, 1380, 300, 0.55], ["petunia", 60, 1180, 240, 0.7], ["begonia", 1030, 1150, 230, 0.85], ["petunia2", 250, 1560, 220, 0.95], ["violet", 840, 1560, 200, 1.05]];
      for (const [k, x, y, s, d] of corner) { const q = (f - d) / 0.8; if (q <= 0) continue; stamp(ctx, S["h" + k], x, y + Math.sin(f + x) * 6, (s / 360) * outBack(q), Math.sin(f * 0.6 + x) * 0.05, clamp01(q * 3)); }
      // düşen taç yapraklar
      for (const p of fallPetals) { const y = ((p.y + f * p.sp) % (H + 100)) - 50, x = p.x + Math.sin(f * 1.2 + p.sw) * 30; stamp(ctx, S.petal, x, y, p.s, p.rot + f * p.vr, 0.75, 0.6 + 0.4 * Math.abs(Math.sin(f * 2 + p.sw))); }
      // logo
      kinetic(ctx, "Çiçek", W / 2, 300, { size: 156, family: F.display, color: ACC, el: f - 0.7, tracking: -0.05 });
      scriptWipe(ctx, "Coşturan", W / 2 + 10, 455, { size: 170, family: F.script, color: ACC2, p: seg(f, 1.0, 2.0) });
      kinetic(ctx, T.product, W / 2, 1500, { size: 58, family: F.display, color: INK, el: f - 2.1, stagger: 0.018 });
      // fiyat
      const pr = seg(f, 2.6, 3.0);
      if (pr > 0) {
        ctx.save(); ctx.globalAlpha = pr; ctx.font = `700 54px ${F.sans}`; ctx.fillStyle = "#8b8096"; ctx.textAlign = "right";
        const s1 = `${T.price.sell} TL`; ctx.fillText(s1, W / 2 - 40, 1612);
        const tw = ctx.measureText(s1).width; ctx.strokeStyle = "#8b8096"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(W / 2 - 40 - tw - 6, 1594); ctx.lineTo(W / 2 - 40 - tw - 6 + (tw + 12) * seg(f, 2.85, 3.15), 1594); ctx.stroke();
        ctx.restore();
      }
      const pp = outBack(seg(f, 3.1, 3.6));
      if (pp > 0) { ctx.save(); ctx.translate(W / 2 + 40, 1614); ctx.scale(pp, pp); ctx.font = `800 104px ${F.display}`; ctx.fillStyle = ACC; ctx.textAlign = "left"; ctx.fillText(`${T.price.now} TL`, 0, 0); ctx.restore(); }
      const up = outBack(seg(f, 3.7, 4.2));
      if (up > 0) {
        ctx.save(); ctx.translate(W / 2, 1712); ctx.scale(up, up);
        ctx.font = `800 50px ${F.display}`; const uw = ctx.measureText(T.url).width + 90;
        ctx.fillStyle = ACC; ctx.beginPath(); ctx.roundRect(-uw / 2, -46, uw, 92, 46); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(T.url, 0, 17); ctx.restore();
      }
      flash(ctx, 1 - sm(f, 0, 0.35));
      leak = 0.45; vig = 0.1; bloomK = 0.18;
    }

    /* ---------------- son işlem ---------------- */
    if (bloomK > 0) { bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.globalCompositeOperation = "source-over"; bctx.clearRect(0, 0, W, H); bctx.drawImage(canvas, 0, 0); bloom(ctx, buf, bloomK); }
    lightLeak(ctx, t, leak, "255,190,150", COOL);
    vignette(ctx, vig, vigCol);
    grain(ctx, t, grainK);
  };

  return { render, duration: DURATION };
}

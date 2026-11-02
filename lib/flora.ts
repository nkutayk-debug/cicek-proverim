/* ============================================================================
   FLORA: kodla çizilen botanik illüstrasyon motoru (Canvas 2D).
   Dil: gradyan dolgu + ince mürekkep kontur + damar çizgisi + soldan ışık.
   Her şey önce "sprite" olarak ekran dışı tuvale çizilir, sahnede drawImage
   ile döndürülüp ölçeklenir (60 fps için).
   ========================================================================== */

export type RGB = [number, number, number];

export const hex = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const WHITE: RGB = [255, 255, 255];
const INK: RGB = hex("#3a162e");
export const INK_RGB = INK;

/* Tohumlu rastgele sayı: aynı çizim her açılışta aynı görünsün. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

/* ---------------------------------------------------------------- yapraklar (taç) */

type PetalOpt = { notch?: number; wave?: number; tip?: number; waist?: number };

/** Taban (0,0), uç -y yönünde. wid = yarım genişlik. */
function petalPath(ctx: CanvasRenderingContext2D, len: number, wid: number, o: PetalOpt = {}) {
  const notch = o.notch ?? 0;
  const tip = o.tip ?? 1; // 1 = yuvarlak, <1 sivri
  const waist = o.waist ?? 0.55;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(wid * waist, -len * 0.06, wid * 1.04, -len * 0.42, wid * 0.94, -len * 0.7);
  if (o.wave) {
    // fırfırlı uç: küçük dalgalar
    const n = 3;
    for (let i = 0; i < n; i++) {
      const a0 = 0.7 + (i / n) * 0.3, a1 = 0.7 + ((i + 1) / n) * 0.3;
      const x0 = wid * 0.94 * (1 - (a0 - 0.7) / 0.3), x1 = wid * 0.94 * (1 - (a1 - 0.7) / 0.3);
      const y1 = -len * (a1 + (1 - a1) * 0.2 + (i === n - 1 ? 0.28 : 0.2));
      ctx.quadraticCurveTo((x0 + x1) / 2 + wid * 0.12, -len * (0.98 + o.wave * (i % 2 ? 0.04 : -0.02)), x1, Math.min(y1, -len * 0.82));
    }
    ctx.lineTo(0, -len * (1 - notch));
  } else {
    ctx.bezierCurveTo(wid * 0.86 * tip, -len * 0.96, wid * 0.32 * tip, -len * 1.03, notch ? wid * 0.07 : 0, -len * (1 - notch));
    if (notch) ctx.lineTo(0, -len * (1 - notch * 1.4));
  }
  // ayna: sol taraf
  if (notch) ctx.lineTo(-wid * 0.07, -len * (1 - notch));
  ctx.bezierCurveTo(-wid * 0.32 * tip, -len * 1.03, -wid * 0.86 * tip, -len * 0.96, -wid * 0.94, -len * 0.7);
  ctx.bezierCurveTo(-wid * 1.04, -len * 0.42, -wid * waist, -len * 0.06, 0, 0);
  ctx.closePath();
}

type PetalPaint = {
  base: RGB; mid: RGB; tip: RGB;
  vein?: RGB; veins?: number; veinAlpha?: number;
  ink?: number; // kontur opaklığı
  spots?: { color: RGB; n: number; seed: number };
};

function paintPetal(ctx: CanvasRenderingContext2D, len: number, wid: number, p: PetalPaint, o: PetalOpt = {}) {
  petalPath(ctx, len, wid, o);
  const g = ctx.createLinearGradient(0, 0, 0, -len);
  g.addColorStop(0, css(p.base));
  g.addColorStop(0.45, css(p.mid));
  g.addColorStop(1, css(p.tip));
  ctx.fillStyle = g;
  ctx.fill();
  // hacim: soldan ışık, sağ kenarda gölge
  ctx.save();
  ctx.clip();
  const s = ctx.createLinearGradient(-wid, 0, wid, 0);
  s.addColorStop(0, "rgba(255,255,255,.22)");
  s.addColorStop(0.45, "rgba(255,255,255,0)");
  s.addColorStop(1, "rgba(40,0,30,.14)");
  ctx.fillStyle = s;
  ctx.fillRect(-wid * 1.2, -len * 1.1, wid * 2.4, len * 1.2);
  // damarlar
  if (p.veins) {
    ctx.strokeStyle = css(p.vein ?? mix(p.mid, INK, 0.35), p.veinAlpha ?? 0.28);
    ctx.lineWidth = Math.max(0.5, len * 0.012);
    for (let i = 0; i < p.veins; i++) {
      const t = p.veins === 1 ? 0 : i / (p.veins - 1) - 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -len * 0.02);
      ctx.quadraticCurveTo(t * wid * 0.9, -len * 0.45, t * wid * 1.25, -len * 0.84);
      ctx.stroke();
    }
  }
  if (p.spots) {
    const r = rng(p.spots.seed);
    ctx.fillStyle = css(p.spots.color, 0.75);
    for (let i = 0; i < p.spots.n; i++) {
      const y = -len * (0.12 + r() * 0.42), x = (r() - 0.5) * wid * 0.9 * (0.4 + (-y / len));
      ctx.beginPath();
      ctx.ellipse(x, y, len * 0.016 + r() * len * 0.012, len * 0.022 + r() * len * 0.016, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.strokeStyle = css(INK, p.ink ?? 0.34);
  ctx.lineWidth = Math.max(0.6, len * 0.014);
  petalPath(ctx, len, wid, o);
  ctx.stroke();
}

function at(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, fn: () => void) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  fn();
  ctx.restore();
}

/* ---------------------------------------------------------------- paletler */

export const PAL = {
  geranium: { base: hex("#c81e5b"), mid: hex("#e23d78"), tip: hex("#f27aa3") },
  geraniumRed: { base: hex("#b3122f"), mid: hex("#d92a44"), tip: hex("#f0606b") },
  petunia: { base: hex("#5b1251"), mid: hex("#b0207f"), tip: hex("#d9529f") },
  petuniaViolet: { base: hex("#2f1460"), mid: hex("#6a35b0"), tip: hex("#9466d6") },
  violet: { base: hex("#3f1d7a"), mid: hex("#6e45b8"), tip: hex("#9a78db") },
  begonia: { base: hex("#e85a88"), mid: hex("#f48fb1"), tip: hex("#fcd3e1") },
  rose: { base: hex("#7a0d2a"), mid: hex("#c21d4b"), tip: hex("#e8557a") },
  marigold: { base: hex("#d9620b"), mid: hex("#f39a1d"), tip: hex("#ffc94a") },
  lily: { base: hex("#d2386f"), mid: hex("#f28ab0"), tip: hex("#fde3ec") },
  tulip: { base: hex("#a3122e"), mid: hex("#de3149"), tip: hex("#f77b6e") },
  anthurium: { base: hex("#9c0d24"), mid: hex("#d01d36"), tip: hex("#e8434f") },
  leaf: { dark: hex("#21502c"), base: hex("#3e7d3b"), light: hex("#86b95c") },
  leafTired: { dark: hex("#5c6436"), base: hex("#8e9650"), light: hex("#c7bf7b") },
};

/* ---------------------------------------------------------------- çiçekler */

/** Sardunya çiçekçiği (5 taç yaprak). r = yarıçap. */
export function geraniumFloret(ctx: CanvasRenderingContext2D, r: number, pal = PAL.geranium, seed = 1) {
  const R = rng(seed);
  const rot = R() * 1.2;
  for (let i = 0; i < 5; i++) {
    const a = rot + (i / 5) * Math.PI * 2;
    const k = 0.9 + R() * 0.14;
    at(ctx, 0, 0, a, () =>
      paintPetal(ctx, r * k, r * 0.5 * k, { base: mix(pal.base, INK, 0.12), mid: pal.mid, tip: pal.tip, veins: i < 2 ? 5 : 3, veinAlpha: i < 2 ? 0.38 : 0.2 }, { waist: 0.35 }),
    );
  }
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.3);
  g.addColorStop(0, "rgba(255,248,250,.95)");
  g.addColorStop(1, "rgba(255,240,245,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = css(mix(pal.base, WHITE, 0.5));
  for (let i = 0; i < 5; i++) {
    const a = rot + (i / 5) * Math.PI * 2 + 0.6;
    ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.12, Math.sin(a) * r * 0.12, r * 0.035, 0, Math.PI * 2); ctx.fill();
  }
}

/** Kapalı tomurcuk (damla). Yeşil kın + uçta renk. */
export function bud(ctx: CanvasRenderingContext2D, r: number, pal = PAL.geranium, open = 0) {
  const len = r * 2.1, wid = r * 0.62;
  ctx.save();
  // renkli taç
  paintPetal(ctx, len * (0.86 + open * 0.16), wid * (0.78 + open * 0.42), { base: pal.base, mid: pal.mid, tip: pal.tip, veins: 2, veinAlpha: 0.2 }, { tip: 0.7 });
  // çanak yapraklar (sepal)
  const sep = PAL.leaf;
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.rotate(s * (0.18 + open * 0.3));
    paintPetal(ctx, len * (0.72 - open * 0.15), wid * 0.42, { base: sep.dark, mid: sep.base, tip: sep.light, ink: 0.3 }, { tip: 0.45 });
    ctx.restore();
  }
  ctx.restore();
}

/** Petunya: kaynaşık 5 loblu huni, önden. */
export function petunia(ctx: CanvasRenderingContext2D, r: number, pal = PAL.petunia, seed = 2) {
  const R = rng(seed);
  const rot = R() * Math.PI;
  const path = () => {
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * Math.PI * 2;
      const lobe = Math.cos(5 * (t - rot));
      const rr = r * (0.86 + 0.12 * lobe + 0.025 * Math.sin(17 * t + seed));
      const x = Math.cos(t) * rr, y = Math.sin(t) * rr * 0.94;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  };
  path();
  const g = ctx.createRadialGradient(-r * 0.12, -r * 0.14, r * 0.04, 0, 0, r);
  g.addColorStop(0, css(mix(pal.base, INK, 0.35)));
  g.addColorStop(0.32, css(pal.base));
  g.addColorStop(0.62, css(pal.mid));
  g.addColorStop(1, css(pal.tip));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // lob kıvrımları: lob arasında gölge oluğu
  for (let i = 0; i < 5; i++) {
    const a = rot + (i + 0.5) * ((Math.PI * 2) / 5);
    ctx.strokeStyle = css(mix(pal.base, INK, 0.3), 0.25);
    ctx.lineWidth = r * 0.07;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
  }
  // yıldız damarlar
  ctx.strokeStyle = css(mix(pal.base, INK, 0.45), 0.55);
  ctx.lineWidth = r * 0.018;
  for (let i = 0; i < 5; i++) {
    const a = rot + i * ((Math.PI * 2) / 5);
    for (let k = -2; k <= 2; k++) {
      const b = a + k * 0.11;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(b) * r * 0.4, Math.sin(b) * r * 0.4, Math.cos(b + k * 0.04) * r * (0.62 - Math.abs(k) * 0.08), Math.sin(b + k * 0.04) * r * (0.62 - Math.abs(k) * 0.08));
      ctx.stroke();
    }
  }
  const s = ctx.createLinearGradient(-r, -r, r, r);
  s.addColorStop(0, "rgba(255,255,255,.2)"); s.addColorStop(0.5, "rgba(255,255,255,0)"); s.addColorStop(1, "rgba(30,0,30,.18)");
  ctx.fillStyle = s; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = css(INK, 0.32); ctx.lineWidth = Math.max(0.6, r * 0.014);
  path(); ctx.stroke();
  // boğaz
  const t = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.16);
  t.addColorStop(0, "rgba(250,240,190,.95)"); t.addColorStop(1, "rgba(250,240,190,0)");
  ctx.fillStyle = t; ctx.beginPath(); ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2); ctx.fill();
}

/** Afrika menekşesi: 2 küçük üst + 3 büyük alt yaprak, sarı başçıklar. */
export function violet(ctx: CanvasRenderingContext2D, r: number, pal = PAL.violet) {
  const parts: [number, number][] = [[-0.62, 0.8], [0.62, 0.8], [Math.PI - 1.15, 1], [Math.PI, 1.02], [Math.PI + 1.15, 1]];
  for (const [a, k] of parts) at(ctx, 0, 0, a, () => paintPetal(ctx, r * k, r * 0.58 * k, { base: mix(pal.base, INK, 0.1), mid: pal.mid, tip: pal.tip, veins: 5, veinAlpha: 0.22 }, { waist: 0.4 }));
  ctx.fillStyle = "#ffd23a";
  ctx.strokeStyle = css(INK, 0.35); ctx.lineWidth = r * 0.02;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s * r * 0.08, -r * 0.02, r * 0.09, r * 0.13, s * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
}

/** Begonya (mum begonya): 2 büyük yuvarlak + 2 küçük tepal, sarı organ topluluğu. */
export function begonia(ctx: CanvasRenderingContext2D, r: number, pal = PAL.begonia) {
  for (const a of [0, Math.PI]) at(ctx, 0, 0, a, () => paintPetal(ctx, r * 0.6, r * 0.5, { base: pal.base, mid: pal.mid, tip: pal.tip, veins: 3, veinAlpha: 0.16 }));
  for (const a of [Math.PI / 2, -Math.PI / 2]) at(ctx, 0, 0, a, () => paintPetal(ctx, r * 0.9, r * 1.02, { base: pal.base, mid: pal.mid, tip: pal.tip, veins: 5, veinAlpha: 0.16 }, { waist: 0.7 }));
  const g = ctx.createRadialGradient(-r * 0.04, -r * 0.05, 0, 0, 0, r * 0.24);
  g.addColorStop(0, "#fff3a6"); g.addColorStop(0.7, "#f2c21b"); g.addColorStop(1, "#c9930a");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(150,95,0,.45)";
  const R = rng(9);
  for (let i = 0; i < 26; i++) { const a = R() * 6.28, d = Math.sqrt(R()) * r * 0.19; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.022, 0, 6.28); ctx.fill(); }
}

/** Gül, önden: halka halka kâse yapraklar + spiral göbek. */
export function rose(ctx: CanvasRenderingContext2D, r: number, pal = PAL.rose, seed = 4) {
  const R = rng(seed);
  const rings = [
    { n: 5, len: 1, wid: 0.78, d: 0 },
    { n: 5, len: 0.8, wid: 0.66, d: 0.3 },
    { n: 5, len: 0.6, wid: 0.56, d: 0.55 },
    { n: 4, len: 0.42, wid: 0.5, d: 0.75 },
  ];
  rings.forEach((g, gi) => {
    const off = R() * 6.28;
    for (let i = 0; i < g.n; i++) {
      const a = off + (i / g.n) * 6.28;
      at(ctx, 0, 0, a, () => {
        const base = mix(pal.base, INK, 0.25 + g.d * 0.2), mid = mix(pal.mid, pal.base, g.d * 0.5), tip = mix(pal.tip, pal.mid, g.d * 0.4);
        paintPetal(ctx, r * g.len, r * g.wid * 0.62, { base, mid, tip, veins: 0, ink: 0.3 }, { waist: 0.75, tip: 1.1 });
        // kıvrık kenar ışığı
        ctx.strokeStyle = `rgba(255,220,230,${0.4 - gi * 0.07})`;
        ctx.lineWidth = r * 0.025;
        ctx.beginPath();
        ctx.ellipse(0, -r * g.len * 0.86, r * g.wid * 0.4, r * g.len * 0.1, 0, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      });
    }
  });
  // göbek spirali
  ctx.strokeStyle = css(mix(pal.base, INK, 0.5), 0.7);
  ctx.lineWidth = r * 0.03;
  ctx.beginPath();
  for (let t = 0; t < 14; t += 0.1) {
    const rr = r * 0.015 * t, a = t * 0.9;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    t ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
}

/** Kadife çiçeği: halka halka fırfırlı ponpon. */
export function marigold(ctx: CanvasRenderingContext2D, r: number, pal = PAL.marigold, seed = 7) {
  const R = rng(seed);
  const rings = [[22, 1], [19, 0.84], [16, 0.68], [13, 0.52], [10, 0.37], [7, 0.23]];
  rings.forEach(([n, k], gi) => {
    const off = R() * 6.28;
    for (let i = 0; i < n; i++) {
      const a = off + (i / n) * 6.28 + R() * 0.1;
      at(ctx, Math.cos(a) * r * k * 0.18, Math.sin(a) * r * k * 0.18, a + Math.PI / 2, () =>
        paintPetal(ctx, r * k * 0.8, r * (0.2 - gi * 0.012), {
          base: mix(pal.base, INK, 0.12), mid: mix(pal.mid, pal.base, gi * 0.08), tip: mix(pal.tip, pal.mid, gi * 0.12), veins: 3, veinAlpha: 0.18, ink: 0.22,
        }, { notch: 0.1, waist: 0.75, tip: 1.15 }),
      );
    }
  });
}

/** Zambak: 6 uzun tepal, benekli, uzun erkek organlar. */
export function lily(ctx: CanvasRenderingContext2D, r: number, pal = PAL.lily) {
  for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * 6.28 + layer * (Math.PI / 3) - Math.PI / 2;
      at(ctx, 0, 0, a + Math.PI / 2, () =>
        paintPetal(ctx, r * (layer ? 0.96 : 1), r * (layer ? 0.32 : 0.25), {
          base: pal.base, mid: pal.mid, tip: pal.tip, veins: 1, veinAlpha: 0.4, vein: mix(pal.base, INK, 0.2),
          spots: { color: mix(pal.base, INK, 0.5), n: 9, seed: 30 + i + layer * 3 },
        }, { tip: 0.45, waist: 0.6 }),
      );
    }
  }
  ctx.strokeStyle = "rgba(205,225,170,.95)"; ctx.lineWidth = r * 0.018;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.28 + 0.3;
    const x = Math.cos(a) * r * 0.55, y = Math.sin(a) * r * 0.55;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(x * 0.5, y * 0.5 - r * 0.05, x, y); ctx.stroke();
    ctx.fillStyle = "#8a3d16";
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.03, r * 0.075, a, 0, 6.28); ctx.fill();
  }
}

/** Lale, yandan: üç yaprak kâse. Taban (0,0), yukarı doğru. */
export function tulip(ctx: CanvasRenderingContext2D, r: number, pal = PAL.tulip) {
  const cup = (dx: number, w: number, h: number, shade: number) => {
    ctx.save(); ctx.translate(dx, 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(w * 0.9, -h * 0.05, w * 1.05, -h * 0.55, w * 0.62, -h * 0.92);
    ctx.quadraticCurveTo(w * 0.15, -h * 1.08, 0, -h);
    ctx.quadraticCurveTo(-w * 0.15, -h * 1.08, -w * 0.62, -h * 0.92);
    ctx.bezierCurveTo(-w * 1.05, -h * 0.55, -w * 0.9, -h * 0.05, 0, 0);
    ctx.closePath();
    const g = ctx.createLinearGradient(-w, 0, w, -h);
    g.addColorStop(0, css(mix(pal.base, INK, 0.2 + shade)));
    g.addColorStop(0.5, css(mix(pal.mid, INK, shade)));
    g.addColorStop(1, css(mix(pal.tip, INK, shade)));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = css(INK, 0.32); ctx.lineWidth = r * 0.016; ctx.stroke();
    ctx.strokeStyle = "rgba(255,230,230,.35)"; ctx.lineWidth = r * 0.02;
    ctx.beginPath(); ctx.moveTo(-w * 0.1, -h * 0.15); ctx.quadraticCurveTo(-w * 0.35, -h * 0.55, -w * 0.15, -h * 0.9); ctx.stroke();
    ctx.restore();
  };
  cup(-r * 0.32, r * 0.48, r * 1.25, 0.18);
  cup(r * 0.32, r * 0.48, r * 1.22, 0.22);
  cup(0, r * 0.56, r * 1.32, 0);
}

/** Antoryum: kalp biçimli parlak kın + başak. Taban (0,0). */
export function anthurium(ctx: CanvasRenderingContext2D, r: number, pal = PAL.anthurium) {
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.05);
    ctx.bezierCurveTo(r * 0.35, -r * 0.42, r * 1.05, -r * 0.3, r * 0.9, r * 0.25);
    ctx.bezierCurveTo(r * 0.8, r * 0.62, r * 0.28, r * 0.9, 0, r * 1.15);
    ctx.bezierCurveTo(-r * 0.28, r * 0.9, -r * 0.8, r * 0.62, -r * 0.9, r * 0.25);
    ctx.bezierCurveTo(-r * 1.05, -r * 0.3, -r * 0.35, -r * 0.42, 0, -r * 0.05);
    ctx.closePath();
  };
  path();
  const g = ctx.createRadialGradient(-r * 0.3, 0, r * 0.05, 0, r * 0.3, r * 1.1);
  g.addColorStop(0, css(pal.tip)); g.addColorStop(0.5, css(pal.mid)); g.addColorStop(1, css(pal.base));
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = css(mix(pal.base, INK, 0.3), 0.35); ctx.lineWidth = r * 0.02;
  for (const k of [-0.7, -0.4, 0, 0.4, 0.7]) {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(k * r * 0.9, r * 0.1, k * r * 0.7, r * 0.6, 0, r * 1.12); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = r * 0.05;
  ctx.beginPath(); ctx.moveTo(-r * 0.62, -r * 0.05); ctx.quadraticCurveTo(-r * 0.75, r * 0.3, -r * 0.45, r * 0.55); ctx.stroke();
  ctx.lineWidth = r * 0.025;
  ctx.beginPath(); ctx.moveTo(r * 0.5, -r * 0.12); ctx.quadraticCurveTo(r * 0.72, -r * 0.02, r * 0.75, r * 0.15); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = css(INK, 0.32); ctx.lineWidth = r * 0.016; path(); ctx.stroke();
  spadix(ctx, r * 0.75, r * 0.09, -0.35, "#f6e7a8", "#e2c25a");
}

function spadix(ctx: CanvasRenderingContext2D, len: number, w: number, bend: number, c0: string, c1: string) {
  ctx.save();
  ctx.lineCap = "round";
  const pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([Math.sin(t * 1.4) * bend * len * 0.6, -t * len]); }
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass ? c0 : c1;
    for (let i = 1; i < pts.length; i++) {
      const t = i / pts.length;
      ctx.lineWidth = w * (1.25 - t * 0.6) * (pass ? 0.6 : 1);
      ctx.beginPath(); ctx.moveTo(pts[i - 1][0] - (pass ? w * 0.15 : 0), pts[i - 1][1]); ctx.lineTo(pts[i][0] - (pass ? w * 0.15 : 0), pts[i][1]); ctx.stroke();
    }
  }
  ctx.fillStyle = "rgba(160,120,20,.35)";
  for (let i = 1; i < pts.length; i++) for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.arc(pts[i][0] + k * w * 0.3, pts[i][1], w * 0.08, 0, 6.28); ctx.fill(); }
  ctx.restore();
}

/** Barış çiçeği: beyaz sivri kın + krem başak. Taban (0,0). */
export function peaceLily(ctx: CanvasRenderingContext2D, r: number) {
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(r * 0.62, -r * 0.18, r * 0.6, -r * 1.15, 0.05 * r, -r * 1.6);
    ctx.bezierCurveTo(-r * 0.55, -r * 1.12, -r * 0.6, -r * 0.18, 0, 0);
    ctx.closePath();
  };
  path();
  const g = ctx.createLinearGradient(-r * 0.6, 0, r * 0.6, -r);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.55, "#f3f6ee"); g.addColorStop(1, "#d8e3cd");
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = "rgba(120,160,90,.55)"; ctx.lineWidth = r * 0.025;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r * 0.06, -r * 0.8, 0.05 * r, -r * 1.6); ctx.stroke();
  ctx.strokeStyle = "rgba(150,170,130,.25)"; ctx.lineWidth = r * 0.012;
  for (const k of [-0.3, -0.16, 0.16, 0.3]) { ctx.beginPath(); ctx.moveTo(0, -r * 0.05); ctx.quadraticCurveTo(k * r * 1.4, -r * 0.7, 0.05 * r, -r * 1.55); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = "rgba(60,80,50,.35)"; ctx.lineWidth = r * 0.016; path(); ctx.stroke();
  ctx.save(); ctx.translate(r * 0.04, -r * 0.08); spadix(ctx, r * 0.62, r * 0.13, 0.25, "#f8f2d0", "#e4d79a"); ctx.restore();
}

/* ---------------------------------------------------------------- yapraklar (yeşil) */

export type LeafTone = { dark: RGB; base: RGB; light: RGB };

/** Sardunya yaprağı: yuvarlak, dalgalı kenar, koyu kuşak. Merkez (0,0); sap aşağıdan bağlanır. */
export function geraniumLeaf(ctx: CanvasRenderingContext2D, R: number, tone: LeafTone = PAL.leaf, zone = 1, seed = 3) {
  const r = rng(seed);
  const ph = r() * 6;
  const path = () => {
    ctx.beginPath();
    const notch = 0.2;
    ctx.moveTo(0, R * 0.06);
    for (let i = 0; i <= 160; i++) {
      const t = notch + (i / 160) * (Math.PI * 2 - notch * 2); // 0 = aşağı (sap)
      const scal = 0.9 + 0.1 * Math.abs(Math.cos(t * 6.5 + ph));
      const rr = R * scal * (0.94 + 0.06 * Math.sin(t * 2 + ph)) * (1 - 0.18 * Math.exp(-Math.pow((t - notch) * 3, 2)) - 0.18 * Math.exp(-Math.pow((Math.PI * 2 - notch - t) * 3, 2)));
      ctx.lineTo(Math.sin(t) * rr, Math.cos(t) * rr * 0.92);
    }
    ctx.closePath();
  };
  path();
  const g = ctx.createRadialGradient(-R * 0.25, -R * 0.3, R * 0.05, 0, 0, R * 1.05);
  g.addColorStop(0, css(tone.light)); g.addColorStop(0.55, css(tone.base)); g.addColorStop(1, css(tone.dark));
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  if (zone > 0) {
    ctx.strokeStyle = `rgba(70,40,20,${0.22 * zone})`;
    for (let k = 0; k < 3; k++) {
      ctx.lineWidth = R * (0.18 - k * 0.05);
      ctx.beginPath(); ctx.arc(0, R * 0.02, R * 0.56, 0, Math.PI * 2); ctx.stroke();
    }
  }
  // avuç damarları (açık renk)
  ctx.strokeStyle = css(tone.light, 0.55); ctx.lineWidth = R * 0.022;
  for (let i = 0; i < 9; i++) {
    const t = Math.PI + (i / 8 - 0.5) * Math.PI * 1.55;
    ctx.beginPath(); ctx.moveTo(0, R * 0.06);
    ctx.quadraticCurveTo(Math.sin(t) * R * 0.45, Math.cos(t) * R * 0.4, Math.sin(t) * R * 0.92, Math.cos(t) * R * 0.86);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = css(INK, 0.32); ctx.lineWidth = Math.max(0.7, R * 0.016); path(); ctx.stroke();
}

/** Mızrak / oval yaprak. Taban (0,0), uç -y. serr: kenar dişi, gloss: parlaklık. */
export function ovalLeaf(ctx: CanvasRenderingContext2D, len: number, wid: number, tone: LeafTone = PAL.leaf, o: { serr?: number; gloss?: number; tip?: number; heart?: boolean } = {}) {
  const tip = o.tip ?? 0.5;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (o.heart) {
      ctx.bezierCurveTo(wid * 0.6, len * 0.12, wid * 1.15, -len * 0.18, wid * 0.95, -len * 0.5);
    } else {
      ctx.bezierCurveTo(wid * 0.7, -len * 0.04, wid * 1.08, -len * 0.38, wid * 0.86, -len * 0.62);
    }
    ctx.bezierCurveTo(wid * 0.7, -len * 0.84, wid * 0.25 * tip, -len * 0.97, 0, -len);
    ctx.bezierCurveTo(-wid * 0.25 * tip, -len * 0.97, -wid * 0.7, -len * 0.84, -wid * (o.heart ? 0.95 : 0.86), -len * (o.heart ? 0.5 : 0.62));
    if (o.heart) ctx.bezierCurveTo(-wid * 1.15, -len * 0.18, -wid * 0.6, len * 0.12, 0, 0);
    else ctx.bezierCurveTo(-wid * 1.08, -len * 0.38, -wid * 0.7, -len * 0.04, 0, 0);
    ctx.closePath();
  };
  path();
  const g = ctx.createLinearGradient(-wid, 0, wid, -len * 0.4);
  g.addColorStop(0, css(tone.light)); g.addColorStop(0.5, css(tone.base)); g.addColorStop(1, css(tone.dark));
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = css(mix(tone.light, WHITE, 0.25), 0.6); ctx.lineWidth = Math.max(0.6, len * 0.014);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(wid * 0.05, -len * 0.5, 0, -len * 0.98); ctx.stroke();
  ctx.lineWidth = Math.max(0.4, len * 0.007);
  for (let i = 1; i < 7; i++) {
    const y = -len * (i / 7.6);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(s * wid * 0.45, y - len * 0.05, s * wid * 0.82, y - len * 0.13); ctx.stroke(); }
  }
  if (o.gloss) {
    ctx.strokeStyle = `rgba(255,255,255,${0.32 * o.gloss})`; ctx.lineWidth = len * 0.04;
    ctx.beginPath(); ctx.moveTo(-wid * 0.5, -len * 0.25); ctx.quadraticCurveTo(-wid * 0.62, -len * 0.5, -wid * 0.32, -len * 0.75); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = css(INK, 0.3); ctx.lineWidth = Math.max(0.6, len * 0.012); path(); ctx.stroke();
  if (o.serr) {
    ctx.strokeStyle = css(tone.dark, 0.5); ctx.lineWidth = Math.max(0.5, len * 0.008);
    for (let i = 0; i < 14; i++) {
      const t = 0.12 + (i / 14) * 0.8;
      for (const s of [-1, 1]) {
        const x = s * wid * Math.sin(t * Math.PI) * 0.95, y = -len * t;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s * len * 0.012 * o.serr, y - len * 0.02); ctx.stroke();
      }
    }
  }
}

/* ---------------------------------------------------------------- saksı, toprak */

/** Toprak saksı (terracotta). (0,0) = ağız ortası, aşağı doğru h. */
export function pot(ctx: CanvasRenderingContext2D, w: number, h: number, seed = 5) {
  const rimH = h * 0.15, rimW = w * 1.06, botW = w * 0.74;
  // gövde
  ctx.beginPath();
  ctx.moveTo(-w / 2, rimH * 0.9);
  ctx.lineTo(-botW / 2, h);
  ctx.quadraticCurveTo(0, h + h * 0.035, botW / 2, h);
  ctx.lineTo(w / 2, rimH * 0.9);
  ctx.closePath();
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, "#e09a6c"); g.addColorStop(0.28, "#cd7a4b"); g.addColorStop(0.7, "#ad5a33"); g.addColorStop(1, "#7f3c22");
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = css(INK, 0.3); ctx.lineWidth = 1.2; ctx.stroke();
  // ağız bandı
  ctx.beginPath();
  ctx.roundRect(-rimW / 2, 0, rimW, rimH, rimH * 0.18);
  const r2 = ctx.createLinearGradient(-rimW / 2, 0, rimW / 2, 0);
  r2.addColorStop(0, "#eba97b"); r2.addColorStop(0.3, "#d98656"); r2.addColorStop(0.75, "#b9653b"); r2.addColorStop(1, "#8a4426");
  ctx.fillStyle = r2; ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(60,20,10,.18)";
  ctx.fillRect(-w / 2 + 2, rimH, w - 4, h * 0.03);
  ctx.strokeStyle = "rgba(255,225,200,.5)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-rimW / 2 + 6, 2.5); ctx.lineTo(rimW / 2 - 6, 2.5); ctx.stroke();
  // pişmiş toprak dokusu
  const R = rng(seed);
  for (let i = 0; i < 220; i++) {
    const y = rimH + R() * (h - rimH), t = (y - rimH) / (h - rimH);
    const half = (w / 2) * (1 - t) + (botW / 2) * t;
    const x = (R() * 2 - 1) * half * 0.96;
    ctx.fillStyle = R() > 0.5 ? "rgba(255,230,210,.16)" : "rgba(90,30,10,.14)";
    ctx.fillRect(x, y, 1.4, 1.4);
  }
}

/** Saksı içindeki toprak yüzeyi (elips), ağzın biraz altında. */
export function soilTop(ctx: CanvasRenderingContext2D, w: number, crust = 0) {
  ctx.beginPath(); ctx.ellipse(0, 0, w / 2, w * 0.07, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(-w * 0.1, -w * 0.02, 2, 0, 0, w / 2);
  g.addColorStop(0, "#6b4a33"); g.addColorStop(1, "#3c2718");
  ctx.fillStyle = g; ctx.fill();
  const R = rng(11);
  for (let i = 0; i < 90; i++) {
    const a = R() * 6.28, d = Math.sqrt(R());
    ctx.fillStyle = R() > 0.82 ? "rgba(240,236,226,.7)" : "rgba(30,18,10,.35)";
    ctx.fillRect(Math.cos(a) * d * w * 0.48, Math.sin(a) * d * w * 0.065, 1.6, 1.3);
  }
  if (crust > 0) {
    ctx.strokeStyle = `rgba(245,245,240,${0.7 * crust})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2 - 3, w * 0.07 - 2, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 40; i++) {
      const a = R() * 6.28, d = 0.7 + R() * 0.28;
      ctx.fillStyle = `rgba(250,250,245,${0.55 * crust})`;
      ctx.beginPath(); ctx.arc(Math.cos(a) * d * w * 0.48, Math.sin(a) * d * w * 0.065, 1.2 + R() * 2, 0, 6.28); ctx.fill();
    }
  }
}

/* ---------------------------------------------------------------- sprite önbelleği */

let noise: HTMLCanvasElement | null = null;
function noiseTile() {
  if (noise) return noise;
  noise = makeCanvas(160, 160);
  const x = noise.getContext("2d")!;
  const d = x.createImageData(160, 160);
  const R = rng(77);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = R() * 255;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  return noise;
}
/** Çizimin yalnızca boyalı piksellerine ince gren (baskı illüstrasyon hissi). */
export function grain(ctx: CanvasRenderingContext2D, px: number, anchor: [number, number], amount = 0.075) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = amount;
  ctx.fillStyle = ctx.createPattern(noiseTile(), "repeat")!;
  ctx.fillRect(0, 0, px, px);
  ctx.globalAlpha = 0.16;
  const g = ctx.createRadialGradient(px * anchor[0] - px * 0.2, px * anchor[1] - px * 0.25, 0, px * anchor[0], px * anchor[1], px * 0.75);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(40,10,30,.9)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, px, px);
  ctx.restore();
}

export type Sprite = { c: HTMLCanvasElement; ax: number; ay: number; s: number };
const cache = new Map<string, Sprite>();

/**
 * Bir çizimi kare tuvale işle. size = mantıksal boyut (px), dpr çarpanı ile.
 * anchor: çizimin (0,0) noktasının tuval içindeki oranı.
 */
export function sprite(key: string, size: number, dpr: number, anchor: [number, number], draw: (ctx: CanvasRenderingContext2D, s: number) => void): Sprite {
  const k = `${key}@${size}@${dpr}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const px = size * dpr;
  const c = makeCanvas(px, px);
  const ctx = c.getContext("2d")!;
  ctx.translate(px * anchor[0], px * anchor[1]);
  ctx.scale(dpr, dpr);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  draw(ctx, size);
  grain(ctx, px, anchor);
  const sp = { c, ax: px * anchor[0], ay: px * anchor[1], s: 1 / dpr };
  cache.set(k, sp);
  return sp;
}

/** Sprite'ı (x,y) noktasına, verilen ölçek/açı/opaklıkla bas. */
export function stamp(ctx: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, scale = 1, rot = 0, alpha = 1, fy = 1) {
  if (alpha <= 0.003 || scale <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  const k = scale * sp.s;
  ctx.scale(k, k * fy);
  ctx.drawImage(sp.c, -sp.ax, -sp.ay);
  ctx.restore();
}

/* ---------------------------------------------------------------- tür ikonları */

export type FlowerKind = "geranium" | "petunia" | "petunia2" | "begonia" | "violet" | "rose" | "anthurium" | "peacelily" | "marigold" | "lily" | "tulip" | "orchid" | "orchidW" | "dendro" | "catt" | "onci" | "vanda" | "echeveria" | "cactusflower" | "mammillaria" | "cereus" | "opuntia" | "aloe" | "haworthia" | "crassula" | "schlum";

/** Rehber / herbaryum için tek parça çiçek + yaprak kompozisyonu. Merkez (0,0), s = kutu boyu. */
export function drawSpecimen(ctx: CanvasRenderingContext2D, kind: FlowerKind, s: number) {
  const L = PAL.leaf;
  switch (kind) {
    case "geranium": {
      at(ctx, -s * 0.2, s * 0.22, -0.5, () => geraniumLeaf(ctx, s * 0.2, L, 1, 2));
      at(ctx, s * 0.22, s * 0.25, 0.4, () => geraniumLeaf(ctx, s * 0.17, L, 1, 5));
      const R = rng(12);
      const N = 15;
      const pts: [number, number, number][] = [];
      for (let i = 0; i < N; i++) {
        const a = i * 2.39996, d = Math.sqrt((i + 0.5) / N) * s * 0.26;
        pts.push([Math.cos(a) * d, Math.sin(a) * d * 0.82 - s * 0.08, d]);
      }
      pts.sort((a, b) => b[2] - a[2]);
      for (const [x, y, d] of pts) at(ctx, x, y, R() * 6, () => geraniumFloret(ctx, s * 0.085 * (1 - d / (s * 0.9)), PAL.geranium, (R() * 1000) | 0));
      break;
    }
    case "petunia":
    case "petunia2": {
      const pal = kind === "petunia" ? PAL.petunia : PAL.petuniaViolet;
      at(ctx, -s * 0.24, s * 0.3, -0.9, () => ovalLeaf(ctx, s * 0.28, s * 0.1, L));
      at(ctx, s * 0.26, s * 0.28, 1.0, () => ovalLeaf(ctx, s * 0.26, s * 0.1, L));
      at(ctx, s * 0.18, -s * 0.2, 0, () => petunia(ctx, s * 0.17, pal, 8));
      at(ctx, -s * 0.06, s * 0.04, 0, () => petunia(ctx, s * 0.26, pal, 3));
      break;
    }
    case "begonia": {
      at(ctx, -s * 0.2, s * 0.3, -0.7, () => ovalLeaf(ctx, s * 0.3, s * 0.17, L, { gloss: 1, tip: 1.2 }));
      at(ctx, s * 0.22, s * 0.3, 0.8, () => ovalLeaf(ctx, s * 0.28, s * 0.16, L, { gloss: 1, tip: 1.2 }));
      at(ctx, s * 0.16, -s * 0.18, 0.3, () => begonia(ctx, s * 0.16));
      at(ctx, -s * 0.08, s * 0.02, -0.2, () => begonia(ctx, s * 0.24));
      break;
    }
    case "violet": {
      for (let i = 0; i < 6; i++) at(ctx, 0, s * 0.18, -1.5 + i * 0.6, () => ovalLeaf(ctx, s * 0.36, s * 0.17, L, { tip: 1.6 }));
      at(ctx, -s * 0.14, -s * 0.06, 0, () => violet(ctx, s * 0.14));
      at(ctx, s * 0.14, -s * 0.1, 0.2, () => violet(ctx, s * 0.13));
      at(ctx, 0, s * 0.04, -0.1, () => violet(ctx, s * 0.15));
      break;
    }
    case "rose": {
      at(ctx, -s * 0.22, s * 0.28, -0.8, () => ovalLeaf(ctx, s * 0.24, s * 0.11, L, { serr: 1 }));
      at(ctx, s * 0.24, s * 0.24, 0.9, () => ovalLeaf(ctx, s * 0.22, s * 0.1, L, { serr: 1 }));
      at(ctx, 0, -s * 0.02, 0, () => rose(ctx, s * 0.3));
      break;
    }
    case "anthurium": {
      at(ctx, s * 0.16, s * 0.28, 0.5, () => ovalLeaf(ctx, s * 0.42, s * 0.2, L, { gloss: 1.2, heart: true, tip: 0.6 }));
      at(ctx, -s * 0.04, -s * 0.12, -0.25, () => anthurium(ctx, s * 0.3));
      break;
    }
    case "peacelily": {
      at(ctx, -s * 0.16, s * 0.4, -0.45, () => ovalLeaf(ctx, s * 0.5, s * 0.14, L, { gloss: 1.2, tip: 0.4 }));
      at(ctx, s * 0.2, s * 0.4, 0.5, () => ovalLeaf(ctx, s * 0.46, s * 0.13, L, { gloss: 1.2, tip: 0.4 }));
      at(ctx, 0, s * 0.3, 0.05, () => peaceLily(ctx, s * 0.36));
      break;
    }
    case "marigold": {
      at(ctx, -s * 0.2, s * 0.3, -0.8, () => ovalLeaf(ctx, s * 0.3, s * 0.07, L, { serr: 2, tip: 0.3 }));
      at(ctx, s * 0.22, s * 0.3, 0.8, () => ovalLeaf(ctx, s * 0.28, s * 0.07, L, { serr: 2, tip: 0.3 }));
      at(ctx, 0, -s * 0.04, 0, () => marigold(ctx, s * 0.3));
      break;
    }
    case "lily": {
      at(ctx, -s * 0.18, s * 0.38, -0.6, () => ovalLeaf(ctx, s * 0.34, s * 0.06, L, { tip: 0.3 }));
      at(ctx, s * 0.18, s * 0.38, 0.6, () => ovalLeaf(ctx, s * 0.32, s * 0.06, L, { tip: 0.3 }));
      at(ctx, 0, -s * 0.04, 0.2, () => lily(ctx, s * 0.36));
      break;
    }
    case "orchid":
    case "orchidW": {
      const pal = kind === "orchid" ? OPALS.phalPink : OPALS.phalWhite;
      at(ctx, -s * 0.04, s * 0.42, -1.25, () => ovalLeaf(ctx, s * 0.4, s * 0.13, L, { gloss: 1.2, tip: 1.3 }));
      at(ctx, s * 0.02, s * 0.42, 1.15, () => ovalLeaf(ctx, s * 0.36, s * 0.12, L, { gloss: 1.2, tip: 1.3 }));
      ctx.strokeStyle = css(mix(L.base, hex("#6b5a2a"), 0.3)); ctx.lineWidth = s * 0.014;
      ctx.beginPath(); ctx.moveTo(-s * 0.02, s * 0.38); ctx.bezierCurveTo(-s * 0.06, 0, -s * 0.02, -s * 0.32, s * 0.24, -s * 0.36); ctx.stroke();
      at(ctx, s * 0.27, -s * 0.36, 0, () => orchidBud(ctx, s * 0.022, pal));
      at(ctx, s * 0.17, -s * 0.31, 0.2, () => orchid(ctx, s * 0.1, pal));
      at(ctx, s * 0.0, -s * 0.22, -0.1, () => orchid(ctx, s * 0.13, pal));
      at(ctx, -s * 0.07, -s * 0.03, 0.1, () => orchid(ctx, s * 0.15, pal));
      break;
    }
    case "dendro": {
      ctx.strokeStyle = css(mix(L.base, hex("#c8b45a"), 0.35)); ctx.lineWidth = s * 0.05;
      ctx.beginPath(); ctx.moveTo(0, s * 0.46); ctx.quadraticCurveTo(s * 0.03, 0, -s * 0.02, -s * 0.42); ctx.stroke();
      ctx.strokeStyle = css(INK, 0.25); ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) { const y = s * 0.4 - i * s * 0.12; ctx.beginPath(); ctx.moveTo(-s * 0.025, y); ctx.lineTo(s * 0.03, y); ctx.stroke(); }
      for (const [y, an] of [[0.3, -0.9], [0.12, 1.0], [-0.06, -1.0]]) at(ctx, 0, s * y, an, () => ovalLeaf(ctx, s * 0.2, s * 0.06, L, { gloss: 0.8 }));
      for (const [x, y, r] of [[-0.14, -0.3, 0.12], [0.14, -0.26, 0.11], [-0.1, -0.08, 0.12], [0.13, -0.02, 0.11]]) at(ctx, s * x, s * y, x * 2, () => orchid(ctx, s * r, OPALS.dendro, "dendro"));
      break;
    }
    case "catt": {
      ctx.fillStyle = css(mix(L.base, hex("#a8a050"), 0.3)); ctx.strokeStyle = css(INK, 0.3);
      ctx.beginPath(); ctx.ellipse(s * 0.02, s * 0.36, s * 0.05, s * 0.12, 0, 0, 6.28); ctx.fill(); ctx.stroke();
      at(ctx, s * 0.02, s * 0.26, 0.15, () => ovalLeaf(ctx, s * 0.42, s * 0.1, L, { gloss: 1, tip: 0.9 }));
      at(ctx, -s * 0.12, -s * 0.02, -0.15, () => orchid(ctx, s * 0.22, OPALS.catt, "catt"));
      at(ctx, s * 0.16, -s * 0.22, 0.25, () => orchid(ctx, s * 0.16, OPALS.catt, "catt"));
      break;
    }
    case "onci": {
      for (const [an, l] of [[-0.35, 0.5], [-0.12, 0.56], [0.2, 0.52], [0.4, 0.44]]) at(ctx, 0, s * 0.46, an, () => ovalLeaf(ctx, s * l, s * 0.035, L, { tip: 0.3 }));
      ctx.strokeStyle = css(mix(L.base, hex("#6b5a2a"), 0.4)); ctx.lineWidth = s * 0.01;
      ctx.beginPath(); ctx.moveTo(s * 0.02, s * 0.4); ctx.quadraticCurveTo(s * 0.06, -s * 0.1, -s * 0.18, -s * 0.38); ctx.stroke();
      const R = rng(4);
      for (let i = 0; i < 11; i++) { const t = 0.25 + i * 0.07; const x = s * (0.06 - t * 0.3) + (R() - 0.5) * s * 0.16, y = s * (0.4 - t * 0.8); at(ctx, x, y, (R() - 0.5) * 0.5, () => orchid(ctx, s * (0.07 + R() * 0.02), OPALS.onci, "onci")); }
      break;
    }
    case "vanda": {
      for (let i = 0; i < 6; i++) at(ctx, 0, s * (0.42 - i * 0.07), i % 2 ? 1.2 : -1.2, () => ovalLeaf(ctx, s * 0.3, s * 0.05, L, { tip: 0.6 }));
      for (const [x, y, r] of [[-0.12, -0.22, 0.13], [0.12, -0.16, 0.12], [-0.02, -0.02, 0.13]]) at(ctx, s * x, s * y, x, () => orchid(ctx, s * r, OPALS.vanda, "vanda"));
      break;
    }
    case "echeveria": {
      ctx.strokeStyle = "#b8836a"; ctx.lineWidth = s * 0.014; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(s * 0.04, s * 0.2); ctx.bezierCurveTo(s * 0.1, -s * 0.12, s * 0.22, -s * 0.3, s * 0.36, -s * 0.3); ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const t = 0.45 + i * 0.1, x = s * (0.04 + (0.36 - 0.04) * t * t), y = s * (0.2 - 0.5 * Math.sin(t * 1.5));
        at(ctx, x, y + s * 0.02, 0.3 - i * 0.05, () => { const g = ctx.createLinearGradient(0, -s * 0.03, 0, s * 0.035); g.addColorStop(0, "#f39a6a"); g.addColorStop(1, "#f7d26a"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.017, s * 0.03, 0, 0, 6.28); ctx.fill(); ctx.strokeStyle = css(INK, 0.25); ctx.lineWidth = 0.8; ctx.stroke(); });
      }
      at(ctx, 0, s * 0.3, 0, () => pebbles(ctx, s * 0.78, 64));
      ctx.save(); ctx.translate(0, s * 0.18); ctx.scale(1, 0.6); echeveria(ctx, s * 0.36, 6); ctx.restore();
      break;
    }
    case "cactusflower":
    case "mammillaria": {
      at(ctx, 0, s * 0.4, 0, () => pebbles(ctx, s * 0.74, 62));
      at(ctx, 0, s * 0.4, 0, () => mammillaria(ctx, s * 0.52, s * 0.5, 1));
      break;
    }
    case "cereus": {
      at(ctx, 0, s * 0.44, 0, () => pebbles(ctx, s * 0.6, 63));
      const mw = s * 0.17, mh = s * 0.8, bx = -s * 0.05, by = s * 0.44;
      const ax = s * 0.15, ay = by - mh * 0.34, aw = s * 0.13, ah = s * 0.4;
      cactusTube(ctx, [bx, ay + aw * 0.55, ax, ay + aw * 0.6, ax, ay - aw * 0.15], aw * 0.96);
      at(ctx, ax, ay, 0, () => cactusBody(ctx, aw, ah, { prof: colProf(0.16), ribs: 8, seed: 7, rot: 0.3 }));
      at(ctx, bx, by, 0, () => cactusBody(ctx, mw, mh, { prof: colProf(0.1), ribs: 8, seed: 5 }));
      ctx.save(); ctx.translate(bx + mw * 0.12, by - mh * 0.97); ctx.scale(1, 0.62); cactusBloom(ctx, s * 0.085, CPAL.white, 8); ctx.restore();
      break;
    }
    case "opuntia": {
      at(ctx, 0, s * 0.44, 0, () => pebbles(ctx, s * 0.6, 65));
      at(ctx, -s * 0.07, s * 0.1, -0.55, () => opuntiaPad(ctx, s * 0.32, s * 0.23));
      at(ctx, s * 0.07, s * 0.09, 0.5, () => opuntiaPad(ctx, s * 0.34, s * 0.24));
      at(ctx, 0, s * 0.44, 0, () => opuntiaPad(ctx, s * 0.42, s * 0.3));
      ctx.save(); ctx.translate(s * 0.24, -s * 0.2); ctx.scale(1, 0.75); cactusBloom(ctx, s * 0.075, CPAL.yellow, 9); ctx.restore();
      at(ctx, -s * 0.27, -s * 0.14, -0.6, () => { const g = ctx.createLinearGradient(-s * 0.03, 0, s * 0.03, -s * 0.07); g.addColorStop(0, "#d6286f"); g.addColorStop(1, "#8a0f45"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -s * 0.035, s * 0.03, s * 0.045, 0, 0, 6.28); ctx.fill(); ctx.strokeStyle = css(INK, 0.3); ctx.lineWidth = 1; ctx.stroke(); });
      break;
    }
    case "aloe": {
      at(ctx, 0, s * 0.42, 0, () => pebbles(ctx, s * 0.7, 66));
      at(ctx, 0, s * 0.42, 0, () => aloe(ctx, s * 0.92));
      break;
    }
    case "haworthia": {
      at(ctx, 0, s * 0.36, 0, () => pebbles(ctx, s * 0.62, 67));
      at(ctx, 0, s * 0.36, 0, () => haworthia(ctx, s * 1.12));
      break;
    }
    case "crassula": {
      at(ctx, 0, s * 0.44, 0, () => pebbles(ctx, s * 0.6, 68));
      at(ctx, 0, s * 0.44, 0, () => crassula(ctx, s * 1.05, 1));
      break;
    }
    case "schlum": {
      at(ctx, 0, s * 0.14, 0, () => pot(ctx, s * 0.32, s * 0.28, 9));
      at(ctx, 0, s * 0.16, 0, () => schlumbergera(ctx, s * 1.05, 1, 1));
      break;
    }
    case "tulip": {
      at(ctx, -s * 0.06, s * 0.46, -0.32, () => ovalLeaf(ctx, s * 0.52, s * 0.1, L, { tip: 0.5 }));
      at(ctx, s * 0.08, s * 0.46, 0.3, () => ovalLeaf(ctx, s * 0.46, s * 0.09, L, { tip: 0.5 }));
      ctx.strokeStyle = css(L.base); ctx.lineWidth = s * 0.03;
      ctx.beginPath(); ctx.moveTo(0, s * 0.46); ctx.quadraticCurveTo(s * 0.03, s * 0.1, 0, -s * 0.05); ctx.stroke();
      at(ctx, 0, -s * 0.03, 0, () => tulip(ctx, s * 0.26));
      break;
    }
  }
}

/** Yalnız çiçek başı (film sahneleri için). Merkez (0,0), s = kutu boyu. */
export function drawHead(ctx: CanvasRenderingContext2D, kind: FlowerKind, s: number) {
  switch (kind) {
    case "geranium": {
      const R = rng(31);
      const N = 16;
      const pts: [number, number, number][] = [];
      for (let i = 0; i < N; i++) { const a = i * 2.39996, d = Math.sqrt((i + 0.5) / N) * s * 0.32; pts.push([Math.cos(a) * d, Math.sin(a) * d * 0.85, d]); }
      pts.sort((a, b) => b[2] - a[2]);
      for (const [x, y, d] of pts) at(ctx, x, y, R() * 6, () => geraniumFloret(ctx, s * 0.11 * (1 - d / (s * 1.1)), PAL.geranium, (R() * 1000) | 0));
      break;
    }
    case "petunia": petunia(ctx, s * 0.42, PAL.petunia, 3); break;
    case "petunia2": petunia(ctx, s * 0.42, PAL.petuniaViolet, 5); break;
    case "begonia": begonia(ctx, s * 0.4); break;
    case "violet": violet(ctx, s * 0.36); break;
    case "rose": rose(ctx, s * 0.44); break;
    case "marigold": marigold(ctx, s * 0.42); break;
    case "lily": lily(ctx, s * 0.46); break;
    case "anthurium": at(ctx, 0, -s * 0.12, 0, () => anthurium(ctx, s * 0.36)); break;
    case "peacelily": at(ctx, 0, s * 0.3, 0, () => peaceLily(ctx, s * 0.36)); break;
    case "tulip": at(ctx, 0, s * 0.28, 0, () => tulip(ctx, s * 0.34)); break;
    case "orchid": orchid(ctx, s * 0.44); break;
    case "orchidW": orchid(ctx, s * 0.44, OPALS.phalWhite); break;
    case "dendro": orchid(ctx, s * 0.4, OPALS.dendro, "dendro"); break;
    case "catt": orchid(ctx, s * 0.44, OPALS.catt, "catt"); break;
    case "onci": orchid(ctx, s * 0.42, OPALS.onci, "onci"); break;
    case "vanda": orchid(ctx, s * 0.42, OPALS.vanda, "vanda"); break;
    case "echeveria": echeveria(ctx, s * 0.46); break;
    case "cactusflower": cactusBloom(ctx, s * 0.44, CPAL.pink, 4); break;
    case "mammillaria": at(ctx, 0, s * 0.3, 0, () => mammillaria(ctx, s * 0.62, s * 0.58, 1)); break;
    case "cereus": case "opuntia": case "aloe": case "haworthia": case "crassula": case "schlum": drawSpecimen(ctx, kind, s * 1.05); break;
  }
}

/** Orkide çiçeği, önden. shape: phal (kelebek) · dendro · catt (cattleya) · onci (dans eden kız) · vanda. */
export type OrchidShape = "phal" | "dendro" | "catt" | "onci" | "vanda";
type OPal = { base: RGB; mid: RGB; tip: RGB };
export const OPALS: Record<string, OPal> = {
  phalPink: { base: hex("#a3197a"), mid: hex("#e070b8"), tip: hex("#fbe3f2") },
  phalWhite: { base: hex("#7a1f8a"), mid: hex("#e9c6ee"), tip: hex("#ffffff") },
  dendro: { base: hex("#6b1f7a"), mid: hex("#c98fd6"), tip: hex("#ffffff") },
  catt: { base: hex("#9a1460"), mid: hex("#d872b0"), tip: hex("#f6d4ea") },
  onci: { base: hex("#7a4a12"), mid: hex("#e2b520"), tip: hex("#fbe36a") },
  vanda: { base: hex("#6e4a1a"), mid: hex("#c8c060"), tip: hex("#ecebb0") },
};
export function orchid(ctx: CanvasRenderingContext2D, r: number, pal: OPal = OPALS.phalPink, shape: OrchidShape = "phal") {
  if (shape === "onci") {
    for (const a of [0, Math.PI - 0.9, Math.PI + 0.9]) at(ctx, 0, 0, a, () => paintPetal(ctx, r * 0.5, r * 0.18, { base: pal.base, mid: mix(pal.mid, pal.base, 0.35), tip: pal.mid, veins: 3, veinAlpha: 0.5, vein: pal.base, spots: { color: pal.base, n: 8, seed: 3 } }, { tip: 0.7 }));
    for (const a of [-1.2, 1.2]) at(ctx, 0, 0, a, () => paintPetal(ctx, r * 0.5, r * 0.2, { base: pal.base, mid: mix(pal.mid, pal.base, 0.3), tip: pal.mid, veins: 3, veinAlpha: 0.5, vein: pal.base, spots: { color: pal.base, n: 8, seed: 5 } }, { tip: 0.8 }));
    at(ctx, 0, r * 0.12, Math.PI, () => paintPetal(ctx, r * 0.95, r * 0.86, { base: mix(pal.mid, pal.base, 0.25), mid: pal.mid, tip: pal.tip, veins: 7, veinAlpha: 0.18, vein: pal.base }, { waist: 0.95, notch: 0.1 }));
    ctx.fillStyle = css(pal.base, 0.8); ctx.beginPath(); ctx.ellipse(0, r * 0.04, r * 0.07, r * 0.1, 0, 0, 6.28); ctx.fill();
    return;
  }
  const P = {
    phal: { sl: 0.92, sw: 0.34, pa: 1.45, pl: 0.95, pw: 0.68, ll: 0.5, lw: 0.26, wave: 0, spots: 14 },
    dendro: { sl: 0.9, sw: 0.26, pa: 1.35, pl: 0.86, pw: 0.44, ll: 0.55, lw: 0.32, wave: 0, spots: 0 },
    catt: { sl: 0.95, sw: 0.26, pa: 1.3, pl: 1.0, pw: 0.66, ll: 0.82, lw: 0.52, wave: 0, spots: 0 },
    vanda: { sl: 0.86, sw: 0.44, pa: 1.3, pl: 0.84, pw: 0.48, ll: 0.38, lw: 0.2, wave: 0, spots: 22 },
  }[shape];
  for (const a of [0, Math.PI - 0.62, Math.PI + 0.62]) at(ctx, 0, 0, a, () => paintPetal(ctx, r * P.sl, r * P.sw, { base: pal.mid, mid: pal.tip, tip: shape === "dendro" ? pal.mid : pal.tip, veins: 5, veinAlpha: 0.3, vein: pal.base, spots: P.spots ? { color: pal.base, n: Math.round(P.spots * 0.6), seed: 21 } : undefined }, { tip: 0.8 }));
  for (const a of [-P.pa, P.pa]) at(ctx, 0, 0, a, () => paintPetal(ctx, r * P.pl, r * P.pw, { base: pal.mid, mid: mix(pal.tip, pal.mid, 0.3), tip: shape === "dendro" ? pal.mid : pal.tip, veins: 9, veinAlpha: 0.32, vein: pal.base, spots: P.spots ? { color: pal.base, n: P.spots, seed: 12 } : undefined }, { waist: 0.75, wave: P.wave || undefined }));
  const lipBase = shape === "catt" ? hex("#f4c430") : shape === "dendro" ? mix(pal.base, INK, 0.3) : hex("#f2c230");
  at(ctx, 0, r * 0.05, Math.PI, () => paintPetal(ctx, r * P.ll, r * P.lw, { base: lipBase, mid: pal.base, tip: mix(pal.base, INK, 0.2), veins: 3, veinAlpha: 0.4 }, { notch: shape === "catt" ? 0.08 : 0.15, waist: shape === "catt" ? 0.9 : undefined }));
  ctx.fillStyle = "#fff6d8";
  ctx.beginPath(); ctx.ellipse(0, -r * 0.06, r * 0.08, r * 0.12, 0, 0, 6.28); ctx.fill();
  ctx.strokeStyle = css(INK, 0.3); ctx.lineWidth = r * 0.015; ctx.stroke();
}

/** Orkide tomurcuğu: yuvarlak, renkli, yeşil sapçıklı. */
export function orchidBud(ctx: CanvasRenderingContext2D, r: number, pal: OPal = OPALS.phalPink, open = 0) {
  ctx.strokeStyle = css(PAL.leaf.base); ctx.lineWidth = r * 0.22;
  ctx.beginPath(); ctx.moveTo(0, r * 1.6); ctx.quadraticCurveTo(r * 0.3, r * 0.8, 0, r * 0.5); ctx.stroke();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
  g.addColorStop(0, css(mix(pal.tip, WHITE, 0.3))); g.addColorStop(0.6, css(mix(pal.mid, hex("#9ab86a"), 0.45 - open * 0.4))); g.addColorStop(1, css(mix(pal.base, hex("#5e7a3a"), 0.4 - open * 0.3)));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, r * (0.8 + open * 0.3), r, 0, 0, 6.28); ctx.fill();
  ctx.strokeStyle = css(INK, 0.3); ctx.lineWidth = Math.max(0.6, r * 0.06); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = r * 0.12;
  ctx.beginPath(); ctx.ellipse(-r * 0.2, -r * 0.2, r * 0.35, r * 0.5, -0.4, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
}

/** Kabuk (çam kabuğu) parçası: düzensiz çokgen, lif çizgili. Merkez (0,0). rotten 0..1 = ayrışmış. */
export function barkChip(ctx: CanvasRenderingContext2D, w: number, seed = 1, rotten = 0) {
  const R = rng(seed);
  const n = 6 + ((R() * 3) | 0);
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 + R() * 0.4, rr = w * (0.38 + R() * 0.2); const x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.62; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
  ctx.closePath();
  const g = ctx.createLinearGradient(-w / 2, -w / 3, w / 2, w / 3);
  g.addColorStop(0, css(mix(hex("#b07a4a"), hex("#4a3324"), rotten))); g.addColorStop(1, css(mix(hex("#6e4527"), hex("#2e2018"), rotten)));
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = css(INK, 0.35); ctx.lineWidth = Math.max(0.6, w * 0.03); ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = "rgba(60,30,15," + (0.35 - rotten * 0.2) + ")"; ctx.lineWidth = Math.max(0.5, w * 0.02);
  for (let i = 0; i < 4; i++) { const y = -w * 0.2 + i * w * 0.13; ctx.beginPath(); ctx.moveTo(-w / 2, y); ctx.quadraticCurveTo(0, y + (R() - 0.5) * w * 0.1, w / 2, y); ctx.stroke(); }
  ctx.restore();
}

/** Eşeverya rozeti (sukulent), üstten: katman katman etli sivri yapraklar, uçlar pembe. */
export function echeveria(ctx: CanvasRenderingContext2D, r: number, seed = 6, o: { blush?: number; pale?: number; open?: number } = {}) {
  const R = rng(seed);
  const blush = o.blush ?? 1, pale = o.pale ?? 0, open = o.open ?? 0;
  const layers = [[11, 1, 0.34], [9, 0.78, 0.3], [8, 0.58, 0.26], [6, 0.4, 0.22], [5, 0.24, 0.18]];
  const PALE = hex("#d9dcb8");
  layers.forEach(([n, k, w], li) => {
    const off = R() * 6.28, kk = k * (1 - open * 0.35 * (li / 4)) + open * 0.06 * (1 - li / 4);
    for (let i = 0; i < n; i++) {
      const a = off + (i / n) * 6.28;
      at(ctx, 0, 0, a, () => paintPetal(ctx, r * kk, r * w * (1 - open * 0.2), {
        base: mix(hex("#7fa59a"), PALE, pale * 0.7), mid: mix(mix(hex("#93bfae"), hex("#c2dbcf"), li * 0.15), PALE, pale * 0.6), tip: mix(mix(hex("#bcd8c8"), hex("#e07f9c"), blush * (0.2 + 0.5 * (1 - li / 4))), PALE, pale), veins: 1, veinAlpha: 0.12, ink: 0.24,
      }, { tip: 0.55, waist: 0.8 }));
    }
  });
}

/* ================================================================ kaktüs ve sukulentler */

export const CTONE = {
  cactus: { dark: hex("#1d5532"), base: hex("#3c8a4e"), light: hex("#93c97e") },
  blue: { dark: hex("#2f5f55"), base: hex("#5f9488"), light: hex("#a9cdbf") },
  pale: { dark: hex("#6d7a48"), base: hex("#a5ae72"), light: hex("#dcdfb4") },
  aloe: { dark: hex("#3b6a56"), base: hex("#6c9e85"), light: hex("#b7d6c0") },
  zebra: { dark: hex("#13341f"), base: hex("#2b5838"), light: hex("#5e8f60") },
  jade: { dark: hex("#285f35"), base: hex("#4a9556"), light: hex("#a3d493") },
  schl: { dark: hex("#225a2e"), base: hex("#3f8a46"), light: hex("#8cc67e") },
} satisfies Record<string, LeafTone>;
export const CPAL = {
  pink: { base: hex("#b3125a"), mid: hex("#ef5d9c"), tip: hex("#ffd5e7") },
  magenta: { base: hex("#93105a"), mid: hex("#dd3594"), tip: hex("#ffc6e5") },
  yellow: { base: hex("#d4820a"), mid: hex("#f6c136"), tip: hex("#fff2b8") },
  white: { base: hex("#e3a9c5"), mid: hex("#fbeef4"), tip: hex("#ffffff") },
  coral: { base: hex("#cf4a26"), mid: hex("#f08a4b"), tip: hex("#ffd6a6") },
};

/** Kaktüs çiçeği, önden: iki kat sivri taç yaprak, krem boğaz, sarı ercikler, yeşil dişicik. */
export function cactusBloom(ctx: CanvasRenderingContext2D, r: number, pal = CPAL.pink, seed = 3) {
  const R = rng(seed);
  const off = R() * 6.28;
  const n1 = 15, n2 = 11;
  for (let i = 0; i < n1; i++) at(ctx, 0, 0, off + (i / n1) * 6.28 + (R() - 0.5) * 0.1, () => paintPetal(ctx, r * (0.9 + R() * 0.12), r * 0.17, { base: pal.base, mid: pal.mid, tip: pal.tip, veins: 1, veinAlpha: 0.16, ink: 0.2 }, { tip: 0.42, waist: 0.45 }));
  for (let i = 0; i < n2; i++) at(ctx, 0, 0, off + ((i + 0.5) / n2) * 6.28, () => paintPetal(ctx, r * 0.68, r * 0.16, { base: pal.base, mid: mix(pal.mid, WHITE, 0.18), tip: mix(pal.tip, WHITE, 0.35), veins: 1, veinAlpha: 0.14, ink: 0.18 }, { tip: 0.5, waist: 0.45 }));
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.34);
  g.addColorStop(0, "rgba(255,244,196,.95)"); g.addColorStop(1, "rgba(255,244,196,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.34, 0, 6.28); ctx.fill();
  for (let i = 0; i < 70; i++) {
    const a = R() * 6.28, d = Math.sqrt(R()) * r * 0.21;
    ctx.fillStyle = R() > 0.35 ? "#fff3b6" : "#eebf3e";
    ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * (0.016 + R() * 0.012), 0, 6.28); ctx.fill();
  }
  ctx.strokeStyle = "#8dbd5c"; ctx.lineWidth = Math.max(0.6, r * 0.028); ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.28; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.08, Math.sin(a) * r * 0.08); ctx.stroke(); }
}

/** Kaktüs çiçek tomurcuğu: yeşil pullu taban, kapalı sivri pembe taç yaprakları. Taban (0,0), uç -y, boy s. */
export function cactusBud(ctx: CanvasRenderingContext2D, s: number, pal = CPAL.pink, open = 0) {
  for (const [a, k] of [[-0.42, 0.62], [0.42, 0.62], [-0.22, 0.86], [0.22, 0.86], [0, 1]] as const)
    at(ctx, 0, 0, a * (1 + open * 1.4), () => paintPetal(ctx, s * k, s * 0.2, { base: mix(pal.base, hex("#7aa45a"), 0.5), mid: pal.mid, tip: pal.tip, veins: 1, veinAlpha: 0.2, ink: 0.3 }, { tip: 0.38, waist: 0.6 }));
  for (const a of [-0.9, -0.5, 0.5, 0.9]) at(ctx, 0, s * 0.04, a, () => paintPetal(ctx, s * 0.36, s * 0.13, { base: hex("#5e8f4a"), mid: hex("#8cbd6a"), tip: hex("#d9a3b8"), ink: 0.3 }, { tip: 0.4 }));
}

/** Kaktüs gövdesi profilleri: v (0 taban → 1 tepe) → yarı genişlik oranı. */
export const globeProf = (v: number) => Math.sqrt(Math.max(0, 1 - ((v - 0.42) / 0.58) ** 2));
export const colProf = (top: number) => (v: number) => (v < 0.04 ? 0.9 + v * 2.5 : v < 1 - top ? 1 : Math.sqrt(Math.max(0, 1 - ((v - (1 - top)) / top) ** 2)));

export type CactusOpt = { ribs?: number; tone?: LeafTone; spine?: string; seed?: number; prof?: (v: number) => number; tuber?: boolean; spineLen?: number; rows?: number; rot?: number; spineW?: number };

/** Kaktüs gövdesi. Taban (0,0), tepe -h. tuber: Mammillaria gibi sarmal memecikler + beyaz dikenler; değilse dikey kaburgalar + areoller. */
export function cactusBody(ctx: CanvasRenderingContext2D, w: number, h: number, o: CactusOpt = {}) {
  const tone = o.tone ?? CTONE.cactus, R = rng(o.seed ?? 3), prof = o.prof ?? globeProf;
  const N = 56, hw = (v: number) => (w / 2) * prof(v);
  const path = () => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) { const v = i / N; if (i) ctx.lineTo(-hw(v), -v * h); else ctx.moveTo(-hw(v), 0); }
    for (let i = N; i >= 0; i--) { const v = i / N; ctx.lineTo(hw(v), -v * h); }
    ctx.closePath();
  };
  path();
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, css(mix(tone.base, tone.light, 0.6))); g.addColorStop(0.32, css(tone.base)); g.addColorStop(0.78, css(tone.dark)); g.addColorStop(1, css(mix(tone.dark, INK, 0.35)));
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  const tg = ctx.createRadialGradient(-w * 0.18, -h * 0.82, 0, -w * 0.18, -h * 0.82, Math.max(w, h) * 0.65);
  tg.addColorStop(0, "rgba(255,255,226,.32)"); tg.addColorStop(1, "rgba(255,255,226,0)");
  ctx.fillStyle = tg; ctx.fillRect(-w, -h * 1.1, w * 2, h * 1.2);
  const bot = ctx.createLinearGradient(0, 0, 0, -h * 0.25);
  bot.addColorStop(0, "rgba(40,30,10,.28)"); bot.addColorStop(1, "rgba(40,30,10,0)");
  ctx.fillStyle = bot; ctx.fillRect(-w, -h * 0.25, w * 2, h * 0.26);
  const ribs = o.ribs ?? 10, rot = o.rot ?? 0.17;
  if (!o.tuber) {
    for (let i = 0; i < ribs; i++) {
      const th = -Math.PI / 2 + ((i + rot) / ribs) * Math.PI * 2;
      if (th <= -Math.PI / 2 || th >= Math.PI / 2) continue;
      const cs = Math.cos(th);
      ctx.strokeStyle = css(mix(tone.dark, INK, 0.4), 0.22 + 0.25 * cs); ctx.lineWidth = Math.max(0.6, w * 0.03 * cs);
      ctx.beginPath(); for (let k = 0; k <= N; k++) { const v = k / N, x = Math.sin(th) * hw(v); if (k) ctx.lineTo(x, -v * h); else ctx.moveTo(x, 0); } ctx.stroke();
      const tc = th + Math.PI / ribs;
      if (tc < Math.PI / 2) {
        ctx.strokeStyle = `rgba(255,255,230,${0.12 + 0.2 * Math.max(0, -Math.sin(tc) * 0.6 + 0.5)})`; ctx.lineWidth = Math.max(0.5, w * 0.018 * Math.cos(tc));
        ctx.beginPath(); for (let k = 0; k <= N; k++) { const v = k / N, x = Math.sin(tc) * hw(v); if (k) ctx.lineTo(x, -v * h); else ctx.moveTo(x, 0); } ctx.stroke();
      }
    }
  }
  ctx.restore();
  ctx.strokeStyle = css(INK, 0.3); ctx.lineWidth = Math.max(0.6, w * 0.012); path(); ctx.stroke();
  const spine = o.spine ?? "rgba(250,246,226,.9)", sl = o.spineLen ?? w * 0.08;
  if (o.tuber) {
    // sarmal memecikler (altın açı), arkadan öne
    const rows = o.rows ?? 150, zmin = (0 - 0.42) / 0.58;
    const pts: { x: number; y: number; c: number; sy: number }[] = [];
    for (let i = 0; i < rows; i++) {
      const z = 1 - ((i + 0.5) / rows) * (1 - zmin), ph = i * 2.39996 + rot;
      const c = Math.cos(ph); if (c < 0.08) continue;
      const v = 0.42 + 0.58 * z, s = Math.sqrt(Math.max(0, 1 - z * z));
      pts.push({ x: Math.sin(ph) * s * (w / 2) * 0.97, y: -v * h, c, sy: 0.35 + 0.65 * s });
    }
    pts.sort((a, b) => a.c - b.c);
    const tr = w * 0.05;
    for (const p of pts) {
      const sx = 0.25 + 0.75 * p.c;
      const tg2 = ctx.createRadialGradient(p.x - tr * 0.3, p.y - tr * 0.4, 0, p.x, p.y, tr);
      tg2.addColorStop(0, css(mix(tone.light, WHITE, 0.15))); tg2.addColorStop(1, css(tone.base, 0));
      ctx.fillStyle = tg2; ctx.beginPath(); ctx.ellipse(p.x, p.y, tr * sx, tr * p.sy, 0, 0, 6.28); ctx.fill();
      ctx.strokeStyle = spine; ctx.lineWidth = Math.max(0.2, w * 0.0045 * (o.spineW ?? 1));
      const n = 12;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * 6.28 + R() * 0.3, L = sl * (0.6 + R() * 0.5);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(a) * L * sx, p.y + Math.sin(a) * L * p.sy); ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,252,240,.95)"; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.6, w * 0.011), 0, 6.28); ctx.fill();
      if (R() > 0.55) { ctx.strokeStyle = "rgba(150,70,40,.85)"; ctx.lineWidth = Math.max(0.4, w * 0.006); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (R() - 0.5) * sl * 0.5, p.y - sl * 0.55 * p.sy); ctx.stroke(); }
    }
  } else {
    // kaburga sırtlarında areoller + diken demetleri
    for (let i = 0; i < ribs; i++) {
      const tc = -Math.PI / 2 + ((i + rot) / ribs) * Math.PI * 2 + Math.PI / ribs;
      if (tc <= -Math.PI / 2 + 0.1 || tc >= Math.PI / 2 - 0.1) continue;
      const cs = Math.cos(tc), step = Math.max(0.035, (w * 0.12) / h);
      for (let v = 0.04 + (i % 2) * step * 0.5; v < 0.985; v += step) {
        const x = Math.sin(tc) * hw(v), y = -v * h;
        ctx.fillStyle = "rgba(248,240,214,.95)"; ctx.beginPath(); ctx.ellipse(x, y, w * 0.016 * (0.4 + cs * 0.6), w * 0.016, 0, 0, 6.28); ctx.fill();
        ctx.strokeStyle = spine; ctx.lineWidth = Math.max(0.35, w * 0.006);
        for (let k = 0; k < 6; k++) {
          const a = -Math.PI / 2 + (k - 2.5) * 0.55 + Math.sin(tc) * 0.9 + (R() - 0.5) * 0.3, L = sl * (0.5 + R() * 0.6);
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L * 0.8 + L * 0.3); ctx.stroke();
        }
      }
    }
  }
}

/** Top kaktüsün tepesindeki çiçek tacı noktaları (perspektifli halka). back: arkadakiler. */
export function crownRing(w: number, h: number, n: number, v = 0.84, prof = globeProf) {
  const hw = (w / 2) * prof(v);
  return Array.from({ length: n }, (_, i) => {
    const ph = -Math.PI + ((i + 0.5) / n) * Math.PI * 2;
    return { x: Math.sin(ph) * hw, y: -v * h + Math.cos(ph) * hw * 0.28, front: Math.cos(ph), i };
  }).sort((a, b) => a.front - b.front);
}

/** Etli, sivri sukulent yaprağı (aloe, haworthia). Taban (0,0), uç -y; bend: uç kayması. */
export function fleshLeaf(ctx: CanvasRenderingContext2D, len: number, wid: number, bend: number, tone: LeafTone, o: { teeth?: boolean; spots?: number; stripes?: boolean; seed?: number; blush?: number } = {}) {
  const R = rng(o.seed ?? 9), N = 24;
  const P = (t: number) => ({ x: t * t * bend * len, y: -(2 * (1 - t) * t * len * 0.55 + t * t * len) });
  const D = (t: number) => { const dx = 2 * t * bend * len, dy = -(2 * (1 - 2 * t) * len * 0.55 + 2 * t * len); const m = Math.hypot(dx, dy) || 1; return { x: dx / m, y: dy / m }; };
  const wt = (t: number) => wid * Math.pow(1 - t, 0.85) * (0.82 + 0.18 * Math.min(1, t * 5));
  const L: { x: number; y: number }[] = [], Rt: { x: number; y: number }[] = [];
  for (let i = 0; i <= N; i++) { const t = i / N, p = P(t), d = D(t), w = wt(t); L.push({ x: p.x - d.y * w, y: p.y + d.x * w }); Rt.push({ x: p.x + d.y * w, y: p.y - d.x * w }); }
  const path = () => { ctx.beginPath(); L.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); for (let i = N; i >= 0; i--) ctx.lineTo(Rt[i].x, Rt[i].y); ctx.closePath(); };
  if (o.teeth) {
    ctx.fillStyle = "rgba(236,228,196,.95)";
    for (let i = 2; i < N - 1; i += 2) for (const [E, s] of [[L, 1], [Rt, -1]] as const) {
      const t = i / N, d = D(t), q = E[i], tl = wid * 0.12 * (1 - t * 0.6);
      const nx = -d.y * s, ny = d.x * s;
      ctx.beginPath(); ctx.moveTo(q.x - d.x * tl * 0.6, q.y - d.y * tl * 0.6); ctx.lineTo(q.x + nx * tl + d.x * tl * 0.9, q.y + ny * tl + d.y * tl * 0.9); ctx.lineTo(q.x + d.x * tl * 0.6, q.y + d.y * tl * 0.6); ctx.fill();
    }
  }
  path();
  const tip = P(1);
  const g = ctx.createLinearGradient(0, 0, tip.x, tip.y);
  g.addColorStop(0, css(mix(tone.base, tone.dark, 0.35))); g.addColorStop(0.55, css(tone.base)); g.addColorStop(1, css(o.blush ? mix(tone.light, hex("#d9768f"), o.blush) : tone.light));
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = css(tone.dark, 0.32);
  ctx.beginPath(); for (let i = 0; i <= N; i++) { const p = P(i / N); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); } for (let i = N; i >= 0; i--) ctx.lineTo(L[i].x, L[i].y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = css(mix(tone.light, WHITE, 0.3), 0.42); ctx.lineWidth = wid * 0.22; ctx.lineCap = "round";
  ctx.beginPath(); for (let i = 1; i < N - 2; i++) { const t = i / N, p = P(t), d = D(t), w = wt(t) * 0.42; const x = p.x + d.y * w, y = p.y - d.x * w; if (i > 1) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke();
  if (o.spots) {
    for (let k = 0; k < o.spots; k++) {
      const t = 0.08 + R() * 0.72, p = P(t), d = D(t), sd = (R() * 2 - 1) * 0.7 * wt(t);
      ctx.fillStyle = `rgba(240,248,236,${0.45 + R() * 0.3})`;
      ctx.beginPath(); ctx.ellipse(p.x - d.y * sd, p.y + d.x * sd, wid * (0.05 + R() * 0.04), wid * 0.03, Math.atan2(d.y, d.x), 0, 6.28); ctx.fill();
    }
  }
  if (o.stripes) {
    for (let t = 0.07; t < 0.86; t += 0.075) {
      const p = P(t), d = D(t), w = wt(t);
      for (let s = -0.82; s <= 0.82; s += 0.16) {
        const x = p.x - d.y * s * w, y = p.y + d.x * s * w - Math.abs(s) * wid * 0.08;
        ctx.fillStyle = `rgba(246,248,240,${0.7 + R() * 0.25})`;
        ctx.beginPath(); ctx.arc(x, y, wid * (0.045 + R() * 0.03), 0, 6.28); ctx.fill();
      }
    }
  }
  ctx.restore();
  ctx.strokeStyle = css(INK, 0.3); ctx.lineWidth = Math.max(0.5, wid * 0.05); path(); ctx.stroke();
}

/** Aloe vera: yandan rozet, dişli kenarlı mavi-yeşil yapraklar, beyaz benekler. Taban (0,0). */
export function aloe(ctx: CanvasRenderingContext2D, s: number, tone: LeafTone = CTONE.aloe, seed = 21) {
  const R = rng(seed);
  const back: [number, number, number][] = [[-0.38, 0.62, 0.075], [0.3, 0.66, 0.075], [-0.08, 0.72, 0.08], [0.12, 0.58, 0.07]];
  const front: [number, number, number][] = [[-1.05, 0.5, 0.08], [0.98, 0.52, 0.08], [-0.72, 0.62, 0.085], [0.66, 0.64, 0.085], [-0.3, 0.7, 0.09], [0.32, 0.68, 0.09], [0.02, 0.56, 0.085]];
  const dark = { dark: mix(tone.dark, INK, 0.2), base: mix(tone.base, tone.dark, 0.35), light: tone.base };
  for (const [a, l, w] of back) at(ctx, 0, 0, a, () => fleshLeaf(ctx, s * l, s * w, a * 0.22, dark, { teeth: true, spots: 6, seed: (R() * 99) | 0 }));
  for (const [a, l, w] of front) at(ctx, 0, 0, a, () => fleshLeaf(ctx, s * l, s * w, a * 0.18 + (R() - 0.5) * 0.05, tone, { teeth: true, spots: 10, seed: (R() * 99) | 0 }));
}

/** Zebra haworthia: dar, sert, beyaz şeritli koyu yapraklar. Taban (0,0). */
export function haworthia(ctx: CanvasRenderingContext2D, s: number, seed = 33) {
  const R = rng(seed);
  const n = 15;
  const idx = Array.from({ length: n }, (_, i) => i), mid = (n - 1) / 2;
  const order = [...idx.filter((i) => i % 2 === 0), ...idx.filter((i) => i % 2 === 1).sort((a, b) => Math.abs(b - mid) - Math.abs(a - mid))];
  for (const i of order) {
    const a = -1.15 + (i / (n - 1)) * 2.3, back = i % 2 === 0;
    const tone = back ? { dark: mix(CTONE.zebra.dark, INK, 0.3), base: CTONE.zebra.dark, light: CTONE.zebra.base } : CTONE.zebra;
    at(ctx, 0, 0, a * (back ? 0.7 : 1), () => fleshLeaf(ctx, s * (0.3 + R() * 0.08 + (1 - Math.abs(a)) * 0.08), s * 0.05, -a * 0.08, tone, { stripes: true, seed: i + 3 }));
  }
}

/** Para ağacı (Crassula ovata): kalın gövde, etli oval yaprak çiftleri, kırmızı kenar. Taban (0,0). */
export function crassula(ctx: CanvasRenderingContext2D, s: number, flowers = 0, seed = 41) {
  const R = rng(seed);
  const trunk = (pts: number[], w: number) => {
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(60,40,20,.5)"; ctx.lineWidth = w + 2;
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); ctx.stroke();
    const g = ctx.createLinearGradient(pts[0] - w, 0, pts[0] + w, 0);
    g.addColorStop(0, "#9a8a5c"); g.addColorStop(0.5, "#6f7a48"); g.addColorStop(1, "#4d5a32");
    ctx.strokeStyle = g; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); ctx.stroke();
  };
  const leaf = (x: number, y: number, a: number, l: number) => at(ctx, x, y, a, () => {
    ctx.beginPath(); ctx.ellipse(0, -l * 0.5, l * 0.36, l * 0.5, 0, 0, 6.28);
    const g = ctx.createLinearGradient(-l * 0.36, 0, l * 0.36, -l);
    g.addColorStop(0, css(CTONE.jade.light)); g.addColorStop(0.55, css(CTONE.jade.base)); g.addColorStop(1, css(CTONE.jade.dark));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "rgba(190,64,66,.5)"; ctx.lineWidth = Math.max(0.7, l * 0.035); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = l * 0.08;
    ctx.beginPath(); ctx.ellipse(-l * 0.1, -l * 0.55, l * 0.15, l * 0.3, 0.1, 2.4, 4.2); ctx.stroke();
  });
  const tips: [number, number, number][] = [];
  const br = [[0, 0, -s * 0.02, -s * 0.18, -s * 0.06, -s * 0.3, s * 0.07], [-s * 0.06, -s * 0.3, -s * 0.16, -s * 0.36, -s * 0.24, -s * 0.44, s * 0.04], [-s * 0.06, -s * 0.3, s * 0.04, -s * 0.42, s * 0.16, -s * 0.48, s * 0.045], [-s * 0.04, -s * 0.2, s * 0.1, -s * 0.22, s * 0.2, -s * 0.3, s * 0.035]];
  for (const b of br) { trunk(b.slice(0, 6), b[6]); tips.push([b[4], b[5], Math.atan2(b[5] - b[3], b[4] - b[2]) + Math.PI / 2]); }
  for (const [x, y, a] of tips) {
    for (let k = 0; k < 3; k++) {
      const yy = y + k * s * 0.04, l = s * (0.15 - k * 0.025), sp = 0.85 + k * 0.32;
      leaf(x, yy, a - sp, l); leaf(x, yy, a + sp, l * 0.96);
    }
    leaf(x, y, a + (R() - 0.5) * 0.2, s * 0.1);
    if (flowers > 0) for (let k = 0; k < 7; k++) {
      const fx = x + (R() - 0.5) * s * 0.1, fy = y - s * 0.1 - R() * s * 0.05;
      at(ctx, fx, fy, R() * 6, () => { for (let p = 0; p < 5; p++) at(ctx, 0, 0, (p / 5) * 6.28, () => paintPetal(ctx, s * 0.022 * flowers, s * 0.008, { base: hex("#f2c6d6"), mid: hex("#fff1f6"), tip: WHITE, ink: 0.15 }, { tip: 0.5 })); ctx.fillStyle = "#e9a2bd"; ctx.beginPath(); ctx.arc(0, 0, s * 0.005, 0, 6.28); ctx.fill(); });
    }
  }
}

/** Yılbaşı kaktüsü (Schlumbergera): dişli yassı boğumlar zinciri, uçlarda fuşya çiçek. Taban (0,0). */
export function schlumbergera(ctx: CanvasRenderingContext2D, s: number, bloom = 1, buds = 1, seed = 51, tone: LeafTone = CTONE.schl) {
  const R = rng(seed);
  const segment = (sl: number, sw: number) => {
    const p = () => {
      ctx.beginPath(); ctx.moveTo(-sw * 0.18, 0);
      ctx.quadraticCurveTo(-sw * 0.52, -sl * 0.2, -sw * 0.5, -sl * 0.36); ctx.lineTo(-sw * 0.64, -sl * 0.46); ctx.lineTo(-sw * 0.5, -sl * 0.56);
      ctx.quadraticCurveTo(-sw * 0.52, -sl * 0.74, -sw * 0.58, -sl * 0.86); ctx.lineTo(-sw * 0.66, -sl * 1.0); ctx.lineTo(-sw * 0.3, -sl * 0.96);
      ctx.lineTo(sw * 0.3, -sl * 0.96); ctx.lineTo(sw * 0.66, -sl * 1.0); ctx.lineTo(sw * 0.58, -sl * 0.86);
      ctx.quadraticCurveTo(sw * 0.52, -sl * 0.74, sw * 0.5, -sl * 0.56); ctx.lineTo(sw * 0.64, -sl * 0.46); ctx.lineTo(sw * 0.5, -sl * 0.36);
      ctx.quadraticCurveTo(sw * 0.52, -sl * 0.2, sw * 0.18, 0); ctx.closePath();
    };
    p();
    const g = ctx.createLinearGradient(-sw / 2, 0, sw / 2, -sl);
    g.addColorStop(0, css(tone.light)); g.addColorStop(0.5, css(tone.base)); g.addColorStop(1, css(tone.dark));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = css(INK, 0.28); ctx.lineWidth = Math.max(0.5, sw * 0.04); ctx.stroke();
    ctx.strokeStyle = css(mix(tone.light, WHITE, 0.3), 0.45); ctx.lineWidth = Math.max(0.5, sw * 0.05);
    ctx.beginPath(); ctx.moveTo(0, -sl * 0.05); ctx.lineTo(0, -sl * 0.92); ctx.stroke();
  };
  const flower = (k: number) => {
    if (k <= 0.01) return;
    const pal = CPAL.magenta, L = s * 0.15 * (0.4 + 0.6 * k);
    ctx.fillStyle = css(pal.base); ctx.beginPath(); ctx.ellipse(0, -L * 0.25, L * 0.09, L * 0.3, 0, 0, 6.28); ctx.fill();
    for (const [a, l] of [[-1.25, 0.7], [1.25, 0.7], [-0.85, 0.85], [0.85, 0.85], [-0.4, 0.95], [0.4, 0.95]] as const)
      at(ctx, 0, -L * 0.5, a * (0.5 + 0.5 * k), () => paintPetal(ctx, L * l, L * 0.17, { base: pal.base, mid: pal.mid, tip: pal.tip, veins: 1, veinAlpha: 0.18, ink: 0.2 }, { tip: 0.4, waist: 0.5 }));
    ctx.strokeStyle = "rgba(255,240,248,.95)"; ctx.lineWidth = Math.max(0.5, L * 0.025);
    for (let i = 0; i < 5; i++) { const a = (i - 2) * 0.09; ctx.beginPath(); ctx.moveTo(0, -L * 0.5); ctx.lineTo(Math.sin(a) * L * 0.95, -L * 0.5 - Math.cos(a) * L * 0.95 * k); ctx.stroke(); }
    ctx.fillStyle = "#c2186d"; ctx.beginPath(); ctx.arc(0, -L * 0.5 - L * 1.05 * k, L * 0.04, 0, 6.28); ctx.fill();
  };
  const bud = (k: number) => {
    if (k <= 0.01) return;
    ctx.fillStyle = css(CPAL.magenta.mid); ctx.strokeStyle = css(INK, 0.25); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, -s * 0.03 * k, s * 0.016 * k, s * 0.034 * k, 0, 0, 6.28); ctx.fill(); ctx.stroke();
  };
  const branch = (depth: number, a: number, sl: number) => {
    ctx.save(); ctx.rotate(a);
    segment(sl, sl * 0.62);
    ctx.translate(0, -sl * 0.96);
    if (depth > 0) {
      const kids = depth > 1 || R() > 0.4 ? 2 : 1;
      for (let k = 0; k < kids; k++) branch(depth - 1, (kids === 2 ? (k ? 0.42 : -0.42) : 0) + (R() - 0.5) * 0.25 + Math.sign(a) * 0.18, sl * (0.92 + R() * 0.1));
    } else {
      const roll = R();
      if (roll < 0.55) flower(bloom); else bud(buds);
    }
    ctx.restore();
  };
  for (const a of [-1.15, -0.62, -0.12, 0.38, 0.86, 1.25]) branch(2, a, s * 0.1);
}

/** Kaktüs inciri yassı gövde (opuntia). Taban (0,0), uç -y. */
export function opuntiaPad(ctx: CanvasRenderingContext2D, len: number, wid: number, tone: LeafTone = CTONE.cactus) {
  ctx.beginPath(); ctx.ellipse(0, -len / 2, wid / 2, len / 2, 0, 0, 6.28);
  const g = ctx.createLinearGradient(-wid / 2, 0, wid / 2, -len * 0.3);
  g.addColorStop(0, css(tone.light)); g.addColorStop(0.45, css(tone.base)); g.addColorStop(1, css(tone.dark));
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = css(INK, 0.3); ctx.lineWidth = Math.max(0.6, wid * 0.02); ctx.stroke();
  for (let j = 1; j < 9; j++) for (let k = -3; k <= 3; k++) {
    const y = -len * (j / 9), x = (k + (j % 2) * 0.5) * wid * 0.13;
    if ((x / (wid / 2)) ** 2 + ((y + len / 2) / (len / 2)) ** 2 > 0.78) continue;
    ctx.fillStyle = "rgba(196,150,70,.9)"; ctx.beginPath(); ctx.arc(x, y, wid * 0.018, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "rgba(250,246,226,.8)"; ctx.lineWidth = Math.max(0.4, wid * 0.006);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - wid * 0.04, y - wid * 0.05); ctx.moveTo(x, y); ctx.lineTo(x + wid * 0.045, y - wid * 0.035); ctx.stroke();
  }
}

/** Sukulent dibindeki çakıllı toprak tümseği. (0,0) = merkez. */
export function pebbles(ctx: CanvasRenderingContext2D, w: number, seed = 61) {
  const R = rng(seed);
  ctx.fillStyle = "rgba(60,40,24,.08)"; ctx.beginPath(); ctx.ellipse(0, w * 0.025, w * 0.53, w * 0.085, 0, 0, 6.28); ctx.fill();
  ctx.fillStyle = "#6a4c35"; ctx.beginPath(); ctx.ellipse(0, 0, w / 2, w * 0.075, 0, 0, 6.28); ctx.fill();
  const cols = ["#efe9dc", "#d9d2c3", "#b9b1a2", "#f6f2ea", "#a8a091", "#e4d6bf"];
  for (let i = 0; i < 46; i++) {
    const a = R() * 6.28, d = Math.sqrt(R()), x = Math.cos(a) * d * w * 0.46, y = Math.sin(a) * d * w * 0.06, r = w * (0.018 + R() * 0.02);
    ctx.fillStyle = cols[(R() * cols.length) | 0]; ctx.strokeStyle = css(INK, 0.22); ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.72, R() * 3, 0, 6.28); ctx.fill(); ctx.stroke();
  }
}

/** Kaktüs dirseği: eğri boyunca silindir gölgeli boru (kaburga çizgileriyle). q = [x0,y0,cx,cy,x1,y1]. */
export function cactusTube(ctx: CanvasRenderingContext2D, q: number[], w: number, tone: LeafTone = CTONE.cactus) {
  const pth = () => { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.quadraticCurveTo(q[2], q[3], q[4], q[5]); };
  ctx.lineCap = "butt";
  for (const [k, c, a] of [[1.06, css(INK, 0.3), 1], [1, css(mix(tone.dark, INK, 0.2)), 1], [0.8, css(tone.dark), 1], [0.6, css(tone.base), 1], [0.34, css(mix(tone.base, tone.light, 0.5)), 1], [0.12, "rgba(255,255,226,.35)", 1]] as const) { ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = w * k; pth(); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
/** Top kaktüs + çiçek tacı (bloom 0..1). Taban (0,0). */
export function mammillaria(ctx: CanvasRenderingContext2D, w: number, h: number, bloom = 1, o: CactusOpt = {}, n = 9, pal = CPAL.pink) {
  const ring = crownRing(w, h, n);
  const fl = (p: { x: number; y: number; i: number }) => { if (bloom <= 0.01) return; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, 0.72); cactusBloom(ctx, w * 0.125 * bloom, pal, p.i + 3); ctx.restore(); };
  ring.filter((p) => p.front < 0).forEach(fl);
  cactusBody(ctx, w, h, { tuber: true, spine: "rgba(252,250,240,.92)", spineLen: w * 0.075, ...o });
  ring.filter((p) => p.front >= 0).forEach(fl);
}


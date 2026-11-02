/* Stüdyo filmi yardımcıları: yumuşatma, kinetik yazı, el yazısı silme, bokeh, gren, vinyet, ışık sızıntısı.
   Kareler çevrimdışı işlenir; maliyetli efektler (blur, çok katman) serbest. */
import { rng } from "../flora";

export const W = 1080, H = 1920;
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const outExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const outCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const outBack = (t: number) => { t = clamp01(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const sm = (t: number, a: number, b: number) => { const x = seg(t, a, b); return x * x * (3 - 2 * x); };

export type Fonts = { display: string; script: string; hand: string; sans: string };

/** Harf harf yükselen kinetik yazı. el = yazının başlangıcından beri geçen sn. */
export function kinetic(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: {
  size: number; family: string; weight?: number; color: string; el: number; align?: "center" | "left";
  stagger?: number; dur?: number; out?: number; outDur?: number; shadow?: string; tracking?: number;
}) {
  const { family, weight = 800, color, el, align = "center", stagger = 0.035, dur = 0.55, tracking = -0.035 } = o;
  let size = o.size;
  if (el <= 0) return;
  ctx.save();
  ctx.font = `${weight} ${size}px ${family}`;
  { const w0 = ctx.measureText(text).width * (1 + tracking); if (w0 > 980) { size = Math.floor(size * 980 / w0); ctx.font = `${weight} ${size}px ${family}`; } }
  ctx.textBaseline = "alphabetic";
  const chars = [...text];
  const ws = chars.map((c) => ctx.measureText(c).width + size * tracking);
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = align === "center" ? x - total / 2 : x;
  const outA = o.out !== undefined ? 1 - seg(el, o.out, o.out + (o.outDur ?? 0.4)) : 1;
  chars.forEach((c, i) => {
    const q = outCubic((el - i * stagger) / dur);
    if (q > 0.001 && outA > 0.001) {
      ctx.globalAlpha = q * outA;
      const blur = (1 - q) * 10 + (1 - outA) * 8;
      ctx.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
      if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = size * 0.35; }
      ctx.fillStyle = color;
      ctx.fillText(c, cx, y + (1 - q) * size * 0.55 - (1 - outA) * size * 0.2);
    }
    cx += ws[i];
  });
  ctx.restore();
}

/** El yazısı gibi soldan sağa açılan yazı (bitişik el yazısı harfleri bölünmesin diye silme). */
export function scriptWipe(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { size: number; family: string; color: string; p: number; alpha?: number; glow?: string }) {
  if (o.p <= 0) return;
  ctx.save();
  ctx.font = `400 ${o.size}px ${o.family}`;
  let w = ctx.measureText(text).width;
  if (w > 960) { o = { ...o, size: Math.floor(o.size * 960 / w) }; ctx.font = `400 ${o.size}px ${o.family}`; w = ctx.measureText(text).width; }
  const x0 = x - w / 2 - o.size * 0.3, reveal = (w + o.size * 0.6) * clamp01(o.p);
  ctx.beginPath(); ctx.rect(x0, y - o.size * 1.3, reveal, o.size * 2); ctx.clip();
  ctx.globalAlpha = o.alpha ?? 1;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.size * 0.25; }
  ctx.fillStyle = o.color; ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.restore();
  if (o.p > 0 && o.p < 1) {
    // kalem ucu ışığı
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const px = x0 + reveal, py = y - o.size * 0.3;
    const g = ctx.createRadialGradient(px, py, 0, px, py, o.size * 0.5);
    g.addColorStop(0, "rgba(255,240,250,.9)"); g.addColorStop(1, "rgba(255,240,250,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, o.size * 0.5, 0, 6.28); ctx.fill();
    ctx.restore();
  }
}

/** Hızla kayan kelime: hareket bulanıklığı izi ile. v = hız (px/kare), işaret yönü verir. */
export function whipWord(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { size: number; family: string; color: string; v: number; alpha: number }) {
  if (o.alpha <= 0.01) return;
  ctx.save();
  ctx.font = `800 ${o.size}px ${o.family}`; ctx.textAlign = "center";
  const n = Math.min(10, Math.ceil(Math.abs(o.v) / 18));
  for (let i = n; i >= 0; i--) {
    ctx.globalAlpha = o.alpha * (i === 0 ? 1 : 0.16 * (1 - i / (n + 1)));
    ctx.fillStyle = o.color;
    ctx.fillText(text, x - Math.sign(o.v) * i * Math.abs(o.v) * 0.12, y);
  }
  ctx.restore();
}

/* ---------- bokeh, toz, gren, vinyet, ışık sızıntısı ---------- */
export function makeBokeh(seed: number, n: number, palette: string[]) {
  const R = rng(seed);
  return Array.from({ length: n }, () => ({ x: R(), y: R(), r: 40 + R() * 150, c: palette[(R() * palette.length) | 0], sp: 0.004 + R() * 0.012, ph: R() * 6.28, a: 0.25 + R() * 0.45, depth: R() }));
}
export function drawBokeh(ctx: CanvasRenderingContext2D, b: ReturnType<typeof makeBokeh>, t: number, k = 1, dx = 0, dy = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (const o of b) {
    const x = (((o.x + Math.sin(t * 0.3 + o.ph) * 0.03 + dx * (0.3 + o.depth)) % 1) + 1) % 1 * W;
    const y = (((o.y - t * o.sp + dy * (0.3 + o.depth)) % 1) + 1) % 1 * H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
    g.addColorStop(0, `rgba(${o.c},${o.a * k})`); g.addColorStop(0.65, `rgba(${o.c},${o.a * k * 0.45})`); g.addColorStop(1, `rgba(${o.c},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, o.r, 0, 6.28); ctx.fill();
  }
  ctx.restore();
}

export function makeMotes(seed: number, n: number) {
  const R = rng(seed);
  return Array.from({ length: n }, () => ({ x: R(), y: R(), s: 1 + R() * 3, sp: 0.01 + R() * 0.03, ph: R() * 6.28 }));
}
export function drawMotes(ctx: CanvasRenderingContext2D, m: ReturnType<typeof makeMotes>, t: number, k: number, color = "255,245,220") {
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (const o of m) {
    const x = ((o.x + Math.sin(t * 0.5 + o.ph) * 0.02 + t * o.sp * 0.4) % 1) * W, y = ((o.y + Math.cos(t * 0.4 + o.ph) * 0.02 - t * o.sp * 0.2 + 1) % 1) * H;
    const tw = 0.5 + 0.5 * Math.sin(t * 3 + o.ph * 4);
    ctx.fillStyle = `rgba(${color},${0.55 * k * tw})`;
    ctx.beginPath(); ctx.arc(x, y, o.s, 0, 6.28); ctx.fill();
  }
  ctx.restore();
}

let grainTiles: HTMLCanvasElement[] = [];
export function grain(ctx: CanvasRenderingContext2D, t: number, amount = 0.07) {
  if (!grainTiles.length) {
    const R = rng(5);
    grainTiles = Array.from({ length: 6 }, () => {
      const c = document.createElement("canvas"); c.width = 256; c.height = 256;
      const x = c.getContext("2d")!; const d = x.createImageData(256, 256);
      for (let i = 0; i < d.data.length; i += 4) { const v = R() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0); return c;
    });
  }
  const tile = grainTiles[Math.floor(t * 24) % grainTiles.length];
  ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = amount;
  ctx.fillStyle = ctx.createPattern(tile, "repeat")!; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
export function vignette(ctx: CanvasRenderingContext2D, k: number, color = "40,10,40") {
  if (k <= 0) return;
  const g = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.25, W / 2, H * 0.5, H * 0.78);
  g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${k})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
export function lightLeak(ctx: CanvasRenderingContext2D, t: number, k: number, warm = "255,190,150", cool = "230,170,255") {
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = "screen";
  const x1 = W * (0.15 + 0.1 * Math.sin(t * 0.4)), y1 = H * (0.1 + 0.05 * Math.cos(t * 0.3));
  let g = ctx.createRadialGradient(x1, y1, 0, x1, y1, W * 0.9);
  g.addColorStop(0, `rgba(${warm},${0.35 * k})`); g.addColorStop(1, `rgba(${warm},0)`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const x2 = W * (0.9 - 0.1 * Math.sin(t * 0.33)), y2 = H * (0.85 + 0.05 * Math.sin(t * 0.5));
  g = ctx.createRadialGradient(x2, y2, 0, x2, y2, W * 0.8);
  g.addColorStop(0, `rgba(${cool},${0.28 * k})`); g.addColorStop(1, `rgba(${cool},0)`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
/** Parlama: sahnenin bulanık kopyasını üstüne 'screen' ile bas (bloom). */
export function bloom(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, k: number, blur = 26) {
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = k; ctx.filter = `blur(${blur}px) brightness(1.1)`;
  ctx.drawImage(src, 0, 0); ctx.restore();
}
export function flash(ctx: CanvasRenderingContext2D, k: number, color = "255,250,252") {
  if (k <= 0) return;
  ctx.fillStyle = `rgba(${color},${clamp01(k)})`; ctx.fillRect(0, 0, W, H);
}

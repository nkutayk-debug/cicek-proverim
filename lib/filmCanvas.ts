/* Film sahneleri için tuval katmanları: çiçek patlaması, sprey sisi, ortam (yaprak + bokeh). */
import { CTONE, css, drawHead, fleshLeaf, geraniumLeaf, hex, mix, ovalLeaf, PAL, rng, sprite, stamp, type FlowerKind, type Sprite } from "./flora";

const SUCC: FlowerKind[] = ["echeveria", "cactusflower", "mammillaria", "cereus", "opuntia", "aloe", "haworthia", "crassula", "schlum"];
const ORKS: FlowerKind[] = ["orchid", "orchidW", "dendro", "catt", "onci", "vanda"];

const back = (t: number) => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));

function fit(c: HTMLCanvasElement) {
  const r = c.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr));
  return { W: r.width, H: r.height, dpr };
}

/* ---------------------------------------------------------- çiçek patlaması */
export function createBloom(c: HTMLCanvasElement, kinds: FlowerKind[]) {
  const ctx = c.getContext("2d")!;
  let W = 0, H = 0, dpr = 1;
  type F = { x: number; y: number; s: number; kind: FlowerKind; d: number; rot: number; ph: number; leaf: number };
  let flowers: F[] = [];
  const spr: Record<string, Sprite> = {};
  const S = 260;
  const resize = () => {
    ({ W, H, dpr } = fit(c));
    const R = rng(55);
    const m = Math.min(W, H);
    flowers = [];
    const N = W > 700 ? 18 : 11;
    for (let i = 0; i < N; i++) {
      // ortadaki yazı alanını boş bırak: elips halkası + köşeler
      const a = (i / N) * Math.PI * 2 + R() * 0.3;
      const ring = 0.86 + R() * 0.32;
      const x = W / 2 + Math.cos(a) * W * 0.44 * ring;
      const y = H / 2 + Math.sin(a) * H * 0.46 * ring;
      flowers.push({ x, y, s: m * (0.28 + R() * 0.2), kind: kinds[i % kinds.length], d: 0.1 + R() * 1.5, rot: R() * 6.28, ph: R() * 6, leaf: (R() * 4) | 0 });
    }
    flowers.sort((p, q) => p.s - q.s);
    const d = dpr;
    for (const k of new Set(kinds)) spr["h" + k] = sprite("fh-" + k, S, d, [0.5, 0.5], (x, s) => drawHead(x, k, s));
    // arka yapraklar türe göre: sukulentte etli sivri yaprak, orkidede oval, çiçeklide sardunya
    const succ = kinds.every((k) => SUCC.includes(k)), ork = kinds.some((k) => ORKS.includes(k));
    for (let i = 0; i < 4; i++) spr["lf" + i] = sprite("fl-" + (succ ? "s" : ork ? "o" : "") + i, 200, d, [0.5, i < 2 && !succ && !ork ? 0.5 : 0.95], (x, s) => (succ ? fleshLeaf(x, s * 0.8, s * 0.1, (i % 2 ? 0.08 : -0.08), i < 2 ? CTONE.aloe : CTONE.cactus, { teeth: i < 2, spots: i < 2 ? 8 : 0, seed: i + 3 }) : i < 2 && !ork ? geraniumLeaf(x, s * 0.42, PAL.leaf, 0.5, 4 + i * 9) : ovalLeaf(x, s * 0.85, s * (ork ? 0.22 : 0.3), PAL.leaf, { gloss: 0.8 })));
  };
  const draw = (t: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    // yavaş kamera itişi
    const z = 1 + ease(t / 5) * 0.05;
    ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (W / 2) * (1 - z), dpr * (H / 2) * (1 - z));
    for (const f of flowers) {
      const q = (t - f.d) / 0.9;
      if (q <= 0) continue;
      const sc = (f.s / S);
      const sw = Math.sin(t * 0.8 + f.ph) * 0.04;
      // yapraklar
      const lq = ease(Math.min(1, (t - f.d + 0.25) / 0.7));
      stamp(ctx, spr["lf" + f.leaf], f.x + Math.cos(f.rot) * f.s * 0.42, f.y + Math.sin(f.rot) * f.s * 0.42, sc * 1.25 * lq, f.rot + Math.PI / 2, lq);
      stamp(ctx, spr["h" + f.kind], f.x, f.y, sc * back(q), f.rot * 0.2 + (1 - ease(q)) * -0.8 + sw, Math.min(1, q * 3));
    }
  };
  return { resize, draw };
}

/* ---------------------------------------------------------- sprey sisi */
type Drop = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; puff: boolean };
export function createMist(c: HTMLCanvasElement, rgb: string) {
  const ctx = c.getContext("2d")!;
  let W = 0, H = 0, dpr = 1;
  const drops: Drop[] = [];
  let drop: Sprite, puff: Sprite;
  const resize = () => {
    ({ W, H, dpr } = fit(c));
    drop = sprite("mist-d-" + rgb, 28, dpr, [0.5, 0.5], (x, s) => {
      const g = x.createRadialGradient(-s * 0.08, -s * 0.08, 0, 0, 0, s / 2);
      g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.3, `rgba(${rgb},.55)`); g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
    });
    puff = sprite("mist-p-" + rgb, 160, dpr, [0.5, 0.5], (x, s) => {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, s / 2);
      g.addColorStop(0, `rgba(${rgb},.42)`); g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
    });
  };
  /** (x,y) memesinden a açısıyla dt süresince sis üret. */
  const emit = (x: number, y: number, a: number, dt: number, power = 1) => {
    const m = Math.min(W, H);
    const n = Math.ceil(dt * 1100 * power);
    for (let i = 0; i < n; i++) {
      const aa = a + (Math.random() - 0.5) * 0.46, sp = m * (1.1 + Math.random() * 1.0);
      drops.push({ x, y, vx: Math.cos(aa) * sp, vy: Math.sin(aa) * sp, life: 0, max: 0.8 + Math.random() * 0.8, r: m * (0.004 + Math.random() * 0.01), puff: false });
    }
    if (Math.random() < dt * 40) {
      const aa = a + (Math.random() - 0.5) * 0.2, sp = m * (0.8 + Math.random() * 0.3);
      drops.push({ x, y, vx: Math.cos(aa) * sp, vy: Math.sin(aa) * sp, life: 0, max: 1.4 + Math.random() * 0.6, r: m * 0.002, puff: true });
    }
  };
  const step = (dt: number) => {
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.life += dt;
      if (d.life > d.max) { drops.splice(i, 1); continue; }
      const drag = Math.pow(0.08, dt);
      d.vx *= drag; d.vy = d.vy * drag + H * 0.06 * dt;
      d.x += d.vx * dt; d.y += d.vy * dt;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = Math.min(W, H);
    for (const d of drops) {
      const q = d.life / d.max;
      if (d.puff) stamp(ctx, puff, d.x, d.y, (m / 700) * (0.5 + q * 1.8), 0, (1 - q) * 0.75);
      else stamp(ctx, drop, d.x, d.y, (d.r / 14) * (0.7 + q * 1.4), 0, Math.min(1, (1 - q) * 1.2));
    }
  };
  const clear = () => { drops.length = 0; };
  return { resize, emit, step, clear, size: () => ({ W, H }) };
}

/* ---------------------------------------------------------- ortam: bokeh + süzülen taç yapraklar */
export function createAmbient(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  let W = 0, H = 0, dpr = 1;
  const R = rng(8);
  const bokeh = Array.from({ length: 12 }, () => ({ x: R(), y: R(), r: 0.06 + R() * 0.12, sp: 0.01 + R() * 0.02, ph: R() * 6, alt: R() > 0.5, c: "" }));
  const petals = Array.from({ length: 16 }, () => ({ x: R(), y: R(), s: 0.6 + R() * 0.8, sp: 0.04 + R() * 0.05, ph: R() * 6, rot: R() * 6 }));
  let petal: Sprite;
  const resize = () => {
    ({ W, H, dpr } = fit(c));
    // tema rengi: sayfanın --pink değişkeni (çiçekli pembe, orkide mor, kaktüs yeşil)
    const acc = hex((getComputedStyle(c).getPropertyValue("--pink").trim() || "#d4246c"));
    const W1: [number, number, number] = [255, 255, 255];
    for (const b of bokeh) { const q = mix(acc, W1, b.alt ? 0.84 : 0.9); b.c = `${q[0] | 0},${q[1] | 0},${q[2] | 0}`; }
    petal = sprite("amb-petal-" + acc.join("-"), 30, dpr, [0.5, 0.5], (x, s) => {
      x.beginPath(); x.ellipse(0, 0, s * 0.22, s * 0.34, 0, 0, 6.28);
      const g = x.createLinearGradient(0, -s * 0.34, 0, s * 0.34);
      g.addColorStop(0, css(mix(acc, W1, 0.62))); g.addColorStop(1, css(acc));
      x.fillStyle = g; x.fill();
    });
  };
  const draw = (time: number, k: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    if (k <= 0.01) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = Math.min(W, H);
    for (const b of bokeh) {
      const x = ((b.x + Math.sin(time * b.sp * 6 + b.ph) * 0.04) % 1) * W, y = ((b.y + time * b.sp) % 1.2 - 0.1) * H;
      const g = ctx.createRadialGradient(x, y, 0, x, y, b.r * m);
      g.addColorStop(0, `rgba(${b.c},${0.55 * k})`); g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, b.r * m, 0, 6.28); ctx.fill();
    }
    for (const p of petals) {
      const y = ((p.y + time * p.sp) % 1.15 - 0.08) * H;
      const x = (p.x + Math.sin(time * 0.6 + p.ph) * 0.05) * W;
      stamp(ctx, petal, x, y, p.s * (m / 600), p.rot + time * 0.8 * (p.ph > 3 ? 1 : -1), 0.75 * k, 0.6 + 0.4 * Math.abs(Math.sin(time * 1.6 + p.ph)));
    }
  };
  return { resize, draw };
}

"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { PAL, bud, geraniumFloret, geraniumLeaf, mix, css, pot, rng, soilTop, sprite, stamp, type Sprite } from "@/lib/flora";

/* ============================================================================
   Hero sahnesi: yorgun sardunya + gerçek Çiçek Coşturan şişesi.
   Sanal koordinat: 1000 × 1000 kutu, kaba sığdırılır.
   Akış: açılışta iki fıs → sis bitkiye değer → yapraklar dirilir, tomurcuklar açar.
   Tıklama: şişe o noktaya sıkar; en yakın kapalı salkım açılır.
   ========================================================================== */

const V = 1000;
const GROUND = 942;
const POT = { x: 405, y: 642, w: 300, h: 300 };
const BOTTLE = { x: 845, h: 600, w: 600 * (261 / 1085), nx: 34 / 261, ny: 34 / 1085 };

type Leaf = { bx: number; by: number; x: number; y: number; r: number; rot: number; z: number; seed: number; droop: number; fy: number };
type Umbel = {
  bx: number; by: number; x: number; y: number; r: number; phase: number;
  o: number; target: number; delay: number;
  florets: { dx: number; dy: number; k: number; d: number; rot: number; v: number }[];
};
type Drop = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; puff?: boolean };
type Petal = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number; s: number };
type Shot = { tx: number; ty: number; at: number; hit: boolean; auto: boolean };

function build() {
  const R = rng(2026);
  const leaves: Leaf[] = [];
  // yaprak tepesi: arka sıra küçük ve yüksek, ön sıra büyük ve saksı ağzına sarkan
  const rows = [
    { n: 6, y: 470, spread: 150, r: 52, z: 0 },
    { n: 7, y: 535, spread: 185, r: 60, z: 1 },
    { n: 7, y: 600, spread: 205, r: 66, z: 2 },
    { n: 5, y: 655, spread: 190, r: 64, z: 3 },
  ];
  for (const row of rows) {
    for (let i = 0; i < row.n; i++) {
      const t = row.n === 1 ? 0 : i / (row.n - 1) - 0.5;
      const x = POT.x + t * row.spread * 2 + (R() - 0.5) * 30;
      const y = row.y + Math.abs(t) * 60 + (R() - 0.5) * 22;
      leaves.push({
        bx: POT.x + t * 70 + (R() - 0.5) * 20, by: POT.y + 26,
        x, y, r: row.r * (0.72 + R() * 0.5), rot: t * 1.3 + (R() - 0.5) * 0.5,
        z: row.z + R() * 0.5, seed: (R() * 1000) | 0, droop: t * 0.9, fy: 0.68 + R() * 0.32,
      });
    }
  }
  leaves.sort((a, b) => a.z - b.z);

  const tips: [number, number, number][] = [
    [292, 372, 60], [368, 290, 68], [458, 248, 74], [548, 296, 66], [612, 378, 58],
    [418, 352, 62], [508, 382, 56], [330, 452, 50], [582, 455, 48],
  ];
  const umbels: Umbel[] = tips.map(([x, y, r], i) => {
    const N = 13 + ((R() * 4) | 0);
    const florets = [];
    for (let k = 0; k < N; k++) {
      const a = k * 2.39996 + R() * 0.3;
      const d = Math.sqrt((k + 0.6) / N);
      const dy = Math.sin(a) * d * r * 0.78 - r * 0.12;
      // kubbe ışığı: üst-sol açık, alt-sağ koyu
      const lit = -Math.sin(a) * d * 0.7 - Math.cos(a) * d * 0.35 + (R() - 0.5) * 0.5;
      florets.push({
        dx: Math.cos(a) * d * r, dy,
        k: 1.02 - d * 0.26 + R() * 0.08, d, rot: R() * 6.28, v: (lit > 0.25 ? 0 : lit < -0.25 ? 2 : 1) * 2 + ((R() * 2) | 0),
      });
    }
    florets.sort((p, q) => q.d - p.d); // dıştakiler arkada çizilir
    return {
      bx: POT.x + (x - POT.x) * 0.45 + (R() - 0.5) * 30, by: 560 + R() * 40, x, y, r, phase: R() * 6.28,
      o: 0, target: 0, delay: 0, florets,
    };
  });
  return { leaves, umbels };
}

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const back = (t: number) => {
  if (t <= 0) return 0; if (t >= 1) return 1;
  const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

export default function HeroBloom({ onFirstSpray }: { onFirstSpray?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = wrap.current!, c = cvs.current!;
    const ctx = c.getContext("2d")!;
    const { leaves, umbels } = build();
    const drops: Drop[] = [];
    const petals: Petal[] = [];
    const shots: Shot[] = [];
    let vigor = reduce ? 1 : 0.08;
    let vigorTarget = vigor;
    let wind = 0;
    let lastPX = 0;
    let k = 1, ox = 0, oy = 0, dpr = 1, W = 0, H = 0;
    let spr: Record<string, Sprite> = {};
    const bottle = new Image();
    bottle.src = "/img/sise-cicekli.webp";
    let press = 0; // şişe tetik animasyonu 0..1
    let aim = 0; // şişe yönelimi (radyan)
    let aimTarget = 0;
    let first = false;

    if (reduce) umbels.forEach((u) => { u.o = 1; u.target = 1; });

    const makeSprites = () => {
      const d = dpr * k;
      spr = {};
      const G = PAL.geranium;
      const Wt: [number, number, number] = [255, 255, 255], Dk: [number, number, number] = [92, 10, 48];
      const tones = [
        { base: mix(G.base, Wt, 0.12), mid: mix(G.mid, Wt, 0.16), tip: mix(G.tip, Wt, 0.22) },
        G,
        { base: mix(G.base, Dk, 0.28), mid: mix(G.mid, Dk, 0.24), tip: mix(G.tip, Dk, 0.16) },
      ];
      for (let v = 0; v < 6; v++) spr["f" + v] = sprite("floret" + v, 56, d, [0.5, 0.5], (x, s) => geraniumFloret(x, s * 0.44, tones[(v / 2) | 0], 11 + v * 7));
      spr.bud = sprite("bud", 40, d, [0.5, 0.86], (x, s) => bud(x, s * 0.21, PAL.geranium, 0));
      for (let i = 0; i < 6; i++) {
        spr["l" + i] = sprite("leaf" + i, 150, d, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, PAL.leaf, 0.55, 3 + i * 5));
        spr["t" + i] = sprite("leafT" + i, 150, d, [0.5, 0.5], (x, s) => geraniumLeaf(x, s * 0.45, PAL.leafTired, 0.25, 3 + i * 5));
      }
      spr.pot = sprite("pot", 380, d, [0.5, 0.1], (x) => { pot(x, POT.w, POT.h); x.translate(0, 22); soilTop(x, POT.w * 0.95, 0); });
      spr.drop = sprite("drop", 24, d, [0.5, 0.5], (x, s) => {
        const g = x.createRadialGradient(-s * 0.1, -s * 0.1, 0, 0, 0, s / 2);
        g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.3, "rgba(250,222,236,.55)"); g.addColorStop(1, "rgba(240,190,215,0)");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
      });
      spr.puff = sprite("puff", 120, d, [0.5, 0.5], (x, s) => {
        const g = x.createRadialGradient(0, 0, 0, 0, 0, s / 2);
        g.addColorStop(0, "rgba(252,232,242,.55)"); g.addColorStop(1, "rgba(252,232,242,0)");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
      });
      spr.petal = sprite("petal", 26, d, [0.5, 0.5], (x, s) => {
        x.beginPath(); x.ellipse(0, 0, s * 0.22, s * 0.34, 0, 0, 6.28);
        const g = x.createLinearGradient(0, -s * 0.34, 0, s * 0.34);
        g.addColorStop(0, css(PAL.geranium.tip)); g.addColorStop(1, css(PAL.geranium.base));
        x.fillStyle = g; x.fill();
      });
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.style.width = W + "px"; c.style.height = H + "px";
      k = Math.min(W / V, H / V);
      ox = (W - V * k) / 2 + (W > H * 1.05 ? 0 : 0);
      oy = H - V * k;
      makeSprites();
    };

    const nozzle = () => {
      // şişe tabanı (BOTTLE.x, GROUND) etrafında aim kadar döner
      const bx = BOTTLE.x - BOTTLE.w / 2 + BOTTLE.nx * BOTTLE.w - BOTTLE.x;
      const by = -BOTTLE.h + BOTTLE.ny * BOTTLE.h;
      const ca = Math.cos(aim), sa = Math.sin(aim);
      return { x: BOTTLE.x + bx * ca - by * sa, y: GROUND + bx * sa + by * ca };
    };

    const spray = (tx: number, ty: number, auto: boolean) => {
      const now = performance.now();
      // şişe hedefe doğru hafif eğilir (taban ekseni)
      const n0 = nozzle();
      aimTarget = Math.max(-0.22, Math.min(0.12, Math.atan2(ty - n0.y, n0.x - tx) * 0.35));
      press = 1;
      shots.push({ tx, ty, at: now, hit: false, auto });
      if (!auto && !first) { first = true; onFirstSpray?.(); }
    };

    const emit = (dt: number, s: Shot, now: number) => {
      const age = (now - s.at) / 1000;
      if (age > 0.05 && age < 0.3) {
        const n = nozzle();
        const base = Math.atan2(s.ty - n.y, s.tx - n.x);
        const count = Math.ceil(dt * 900);
        for (let i = 0; i < count; i++) {
          const a = base + (Math.random() - 0.5) * 0.5;
          const sp = 700 + Math.random() * 520;
          drops.push({ x: n.x, y: n.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.7 + Math.random() * 0.7, r: 0.35 + Math.random() * 0.75 });
        }
        if (Math.random() < dt * 30) {
          const a = base + (Math.random() - 0.5) * 0.25, sp = 520 + Math.random() * 200;
          drops.push({ x: n.x, y: n.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 1.2 + Math.random() * 0.5, r: 0.5, puff: true });
        }
      }
      if (!s.hit && age > 0.42) {
        s.hit = true;
        onHit(s.tx, s.ty, s.auto);
      }
    };

    const onHit = (tx: number, ty: number, auto: boolean) => {
      vigorTarget = 1;
      const closed = umbels.filter((u) => u.target < 1);
      if (auto) {
        // açılış: hedefe yakınlığa göre sırayla aç
        closed.sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty));
        closed.slice(0, 5).forEach((u, i) => { u.target = 1; u.delay = performance.now() + 250 + i * 240; });
        return;
      }
      if (closed.length) {
        closed.sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty));
        closed.slice(0, 2).forEach((u, i) => { u.target = 1; u.delay = performance.now() + 120 + i * 200; });
      } else {
        // hepsi açık: en yakın ikisi taç yaprak döker ve yeniden açar
        const near = [...umbels].sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty)).slice(0, 2);
        for (const u of near) {
          for (let i = 0; i < 9; i++) petals.push({ x: u.x + (Math.random() - 0.5) * u.r, y: u.y + (Math.random() - 0.5) * u.r * 0.6, vx: (Math.random() - 0.6) * 80, vy: -40 - Math.random() * 60, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 6, life: 0, s: 0.7 + Math.random() * 0.6 });
          u.o = 0.35; u.target = 1; u.delay = performance.now() + 180;
        }
      }
    };

    /* ---------- çizim ---------- */
    const drawStem = (x0: number, y0: number, x1: number, y1: number, sway: number, w: number) => {
      const cx = (x0 + x1) / 2 + (x1 - x0) * 0.25 + sway * 0.5, cy = (y0 + y1) / 2 + 30;
      ctx.lineCap = "round";
      ctx.strokeStyle = css(mix(PAL.leaf.dark, PAL.leafTired.dark, 1 - vigor));
      ctx.lineWidth = w + 1.6;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1 + sway, y1); ctx.stroke();
      ctx.strokeStyle = css(mix(PAL.leaf.light, PAL.leafTired.light, 1 - vigor), 0.9);
      ctx.lineWidth = w * 0.5;
      ctx.beginPath(); ctx.moveTo(x0 - 0.6, y0); ctx.quadraticCurveTo(cx - 0.6, cy, x1 + sway - 0.6, y1); ctx.stroke();
    };

    let raf = 0, last = performance.now(), visible = true, running = true;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = 0;
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      // durum güncelle
      vigor += (vigorTarget - vigor) * Math.min(1, dt * 1.6);
      wind *= Math.pow(0.04, dt);
      press = Math.max(0, press - dt * 4);
      aim += (aimTarget - aim) * Math.min(1, dt * 6);
      if (press === 0) aimTarget *= Math.pow(0.2, dt);
      for (const u of umbels) {
        if (u.target > u.o && now >= u.delay) u.o = Math.min(u.target, u.o + dt * 0.75);
      }
      for (const s of shots) emit(dt, s, now);
      while (shots.length && now - shots[0].at > 1500) shots.shift();
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life += dt;
        if (d.life > d.max) { drops.splice(i, 1); continue; }
        const drag = Math.pow(0.06, dt);
        d.vx *= drag; d.vy = d.vy * drag + 60 * dt;
        d.x += d.vx * dt; d.y += d.vy * dt;
      }
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.life += dt;
        if (p.y > GROUND - 4 || p.life > 4) { petals.splice(i, 1); continue; }
        p.vy += 140 * dt; p.vx *= Math.pow(0.4, dt); p.vy = Math.min(p.vy, 90);
        p.x += (p.vx + Math.sin(p.life * 3 + p.rot) * 30) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      }

      // çiz
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);

      // zemin gölgeleri
      const sh = (x: number, w: number, a: number) => {
        const g = ctx.createRadialGradient(x, GROUND, 0, x, GROUND, w);
        g.addColorStop(0, `rgba(60,20,40,${a})`); g.addColorStop(1, "rgba(60,20,40,0)");
        ctx.fillStyle = g; ctx.save(); ctx.translate(x, GROUND); ctx.scale(1, 0.12); ctx.translate(-x, -GROUND);
        ctx.beginPath(); ctx.arc(x, GROUND, w, 0, 6.28); ctx.fill(); ctx.restore();
      };
      sh(POT.x, 230, 0.2);
      sh(BOTTLE.x, 110, 0.18);

      stamp(ctx, spr.pot, POT.x, POT.y);

      const swayAt = (ph: number, amp: number) => Math.sin(t * 0.9 + ph) * amp + wind * amp * 0.12;

      // arka yapraklar (z<2)
      const drawLeaf = (L: Leaf, i: number) => {
        const sw = swayAt(L.seed, 4);
        const droop = (1 - vigor) * (0.35 + Math.abs(L.droop) * 0.6) * Math.sign(L.droop || 1);
        const lx = L.x + sw + droop * 26, ly = L.y + (1 - vigor) * 34;
        ctx.strokeStyle = css(mix(PAL.leaf.base, PAL.leafTired.base, 1 - vigor), 0.95);
        ctx.lineWidth = 2.4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(L.bx, L.by); ctx.quadraticCurveTo((L.bx + lx) / 2, Math.min(L.by, ly) - 18, lx, ly + L.r * 0.35); ctx.stroke();
        const sc = (L.r / 67.5) * (0.9 + vigor * 0.1);
        const rot = L.rot + droop * 0.5 + sw * 0.01;
        stamp(ctx, spr["t" + (i % 6)], lx, ly, sc, rot, 1, L.fy);
        stamp(ctx, spr["l" + (i % 6)], lx, ly, sc, rot, vigor, L.fy);
      };
      leaves.forEach((L, i) => { if (L.z < 2) drawLeaf(L, i); });

      // çiçek sapları + salkımlar
      for (const u of umbels) {
        const sw = swayAt(u.phase, 7);
        const sag = (1 - ease(u.o)) * 26 + (1 - vigor) * 18;
        const ux = u.x + sw, uy = u.y + sag;
        drawStem(u.bx, u.by, u.x, u.y + sag, sw, 3.2);
        // tomurcuklar (kapalı hal)
        const budA = 1 - ease(Math.min(1, u.o * 2.2));
        if (budA > 0.01) {
          // kapalı salkım: tomurcuklar sarkık demet
          for (let b = 0; b < 9; b++) {
            const a = (b - 4) * 0.2;
            const hang = Math.PI + a * 1.6 + Math.sin(t * 1.3 + b) * 0.04;
            stamp(ctx, spr.bud, ux + Math.sin(a) * 13, uy + 2 + Math.abs(b - 4) * 1.2, 1.25 + ((b * 7) % 3) * 0.15, hang, budA);
          }
        }
        // çiçekçikler
        if (u.o > 0.01) {
          for (const f of u.florets) {
            const q = (u.o - (1 - f.d) * 0.45) / 0.55;
            if (q <= 0) continue;
            const s = back(q) * f.k * (u.r / 70);
            stamp(ctx, spr["f" + f.v], ux + f.dx * ease(q), uy - u.r * 0.25 + f.dy * ease(q), s, f.rot + (1 - ease(q)) * 1.2, Math.min(1, q * 2.5));
          }
        }
      }

      // ön yapraklar
      leaves.forEach((L, i) => { if (L.z >= 2) drawLeaf(L, i); });

      // şişe
      if (bottle.complete && bottle.naturalWidth) {
        ctx.save();
        ctx.translate(BOTTLE.x, GROUND);
        ctx.rotate(aim);
        const sq = 1 - Math.sin(press * Math.PI) * 0.012;
        ctx.scale(1, sq);
        ctx.drawImage(bottle, -BOTTLE.w / 2, -BOTTLE.h, BOTTLE.w, BOTTLE.h);
        ctx.restore();
      }

      // sis
      for (const d of drops) {
        const q = d.life / d.max;
        if (d.puff) stamp(ctx, spr.puff, d.x, d.y, 0.4 + q * 1.4, 0, (1 - q) * 0.7);
        else stamp(ctx, spr.drop, d.x, d.y, d.r * (0.45 + q * 0.9), 0, Math.min(1, (1 - q) * 1.1));
      }
      for (const p of petals) stamp(ctx, spr.petal, p.x, p.y, p.s, p.rot, Math.min(1, 4 - p.life));

      const busy = drops.length || petals.length || shots.length || Math.abs(vigorTarget - vigor) > 0.002 || umbels.some((u) => u.o < u.target);
      if (visible && (busy || !reduce)) raf = requestAnimationFrame(frame);
    };

    const kick = () => { if (!raf && running) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    resize();
    bottle.onload = kick;
    const ro = new ResizeObserver(() => { resize(); kick(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { threshold: 0.02 });
    io.observe(el);

    const toV = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return { x: (e.clientX - r.left - ox) / k, y: (e.clientY - r.top - oy) / k };
    };
    const onDown = (e: PointerEvent) => {
      const p = toV(e);
      spray(Math.max(150, Math.min(760, p.x)), Math.max(120, Math.min(720, p.y)), false);
      kick();
    };
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - lastPX; lastPX = e.clientX;
      wind = Math.max(-40, Math.min(40, wind + dx * 0.4));
      kick();
    };
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("pointermove", onMove);

    const timers: number[] = [];
    if (!reduce) {
      timers.push(window.setTimeout(() => { spray(520, 300, true); kick(); }, 700));
      timers.push(window.setTimeout(() => { spray(330, 260, true); kick(); }, 1500));
      timers.push(window.setTimeout(() => {
        umbels.forEach((u, i) => { if (u.target < 1) { u.target = 1; u.delay = performance.now() + i * 160; } });
        kick();
      }, 2600));
    }
    kick();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      ro.disconnect(); io.disconnect();
      c.removeEventListener("pointerdown", onDown);
      c.removeEventListener("pointermove", onMove);
    };
  }, [reduce, onFirstSpray]);

  return (
    <div ref={wrap} className="hb">
      <canvas ref={cvs} className="hb__c" aria-label="Çiçek Coşturan şişesi saksıdaki sardunyaya sıkıyor, tomurcuklar açıyor. Sahneye tıklayarak tekrar sıkabilirsiniz." role="img" />
    </div>
  );
}

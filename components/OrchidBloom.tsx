"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { OPALS, PAL, barkChip, css, hex, mix, orchid, orchidBud, ovalLeaf, rng, sprite, stamp, type RGB, type Sprite } from "@/lib/flora";

/* ============================================================================
   Orkide hero sahnesi: şeffaf saksıda kabuk + gümüşi kökler, iki hava kökü,
   çubuğa bağlı kavisli çiçek sapı, sağda mor Çiçek Coşturan şişesi.
   Sis değince kökler yeşile döner (velamen ıslanır), yapraklar dikleşir,
   tomurcuklar dipten uca sırayla açar. Tıklama: sıradaki tomurcuklar açar.
   ========================================================================== */

const V = 1000;
const GROUND = 942;
const POT = { x: 410, top: 676, h: 258, wTop: 236, wBot: 192 };
const CROWN = { x: 410, y: 684 };
const BOTTLE = { x: 840, h: 600, w: 600 * (319 / 1072), nx: 78 / 319, ny: 33 / 1072 };
const PINK = OPALS.phalPink;

type Fl = { t: number; r: number; o: number; target: number; delay: number; rot: number; bud: boolean };
type Drop = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; puff?: boolean };
type Shot = { tx: number; ty: number; at: number; hit: boolean; auto: boolean };

/* sap: çubuk boyunca yukarı, tepede sağa kavis */
const SPIKE = { x0: 426, y0: 672, x1: 436, y1: 330, cx: 530, cy: 140, x2: 740, y2: 330 };
function spikeAt(t: number) {
  // 0..0.42 dikey kısım, 0.42..1 kavis
  if (t < 0.42) { const q = t / 0.42; return { x: SPIKE.x0 + (SPIKE.x1 - SPIKE.x0) * q, y: SPIKE.y0 + (SPIKE.y1 - SPIKE.y0) * q }; }
  const q = (t - 0.42) / 0.58, a = 1 - q;
  return { x: a * a * SPIKE.x1 + 2 * a * q * SPIKE.cx + q * q * SPIKE.x2, y: a * a * SPIKE.y1 + 2 * a * q * SPIKE.cy + q * q * SPIKE.y2 };
}

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const back = (t: number) => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.8; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

export default function OrchidBloom({ onFirstSpray }: { onFirstSpray?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = wrap.current!, c = cvs.current!;
    const ctx = c.getContext("2d")!;
    const R = rng(616);
    const flowers: Fl[] = [];
    const ts = [0.47, 0.6, 0.715, 0.815, 0.9, 0.955, 1];
    ts.forEach((t, i) => flowers.push({ t, r: 74 - i * 4.5, o: reduce && i < 5 ? 1 : 0, target: reduce && i < 5 ? 1 : 0, delay: 0, rot: (R() - 0.5) * 0.4, bud: i >= 5 }));
    const chips = Array.from({ length: 42 }, (_, i) => ({ x: (R() - 0.5) * 0.86, y: R(), w: 26 + R() * 22, seed: i + 3, rot: R() * 3 }));
    const roots = Array.from({ length: 6 }, (_, i) => {
      const pts: [number, number][] = []; let x = CROWN.x + (i - 2.5) * 14, y = CROWN.y + 14; let a = Math.PI / 2 + (i - 2.5) * 0.28;
      for (let k = 0; k < 14; k++) { a += (Math.PI / 2 - a) * 0.12 + (R() - 0.5) * 0.5; x += Math.cos(a) * 17; y += Math.sin(a) * 17; const t = (y - POT.top) / POT.h; const half = (POT.wTop / 2) * (1 - t) + (POT.wBot / 2) * t - 14; x = Math.max(POT.x - half, Math.min(POT.x + half, x)); if (y > POT.top + POT.h - 14) break; pts.push([x, y]); }
      return pts;
    });
    const aerial = [
      [[CROWN.x - 20, CROWN.y + 4], [POT.x - 150, CROWN.y - 30], [POT.x - 160, POT.top + 60], [POT.x - 136, POT.top + 150]],
      [[CROWN.x + 24, CROWN.y + 2], [POT.x + 170, CROWN.y - 50], [POT.x + 150, POT.top + 30], [POT.x + 128, POT.top + 110]],
    ] as [number, number][][];
    const drops: Drop[] = [];
    const shots: Shot[] = [];
    let vigor = reduce ? 1 : 0.1, vigorT = vigor, wet = reduce ? 1 : 0, wetT = wet;
    let k = 1, ox = 0, oy = 0, dpr = 1, wind = 0, lastPX = 0, press = 0, aim = 0, aimT = 0, first = false;
    let spr: Record<string, Sprite> = {};
    const bottle = new Image();
    bottle.src = "/img/sise-orkide.webp";

    const makeSprites = () => {
      const d = dpr * k;
      spr = {};
      for (let v = 0; v < 3; v++) spr["f" + v] = sprite("ob-f" + v, 150, d, [0.5, 0.5], (x, s) => orchid(x, s * 0.44, v === 2 ? OPALS.phalWhite : PINK));
      spr.bud = sprite("ob-bud", 40, d, [0.5, 0.5], (x, s) => orchidBud(x, s * 0.3, PINK));
      const lush = { dark: hex("#16452a"), base: hex("#2f6e3a"), light: hex("#6da35a") };
      const tired = { dark: hex("#5f6b3a"), base: hex("#8e9a55"), light: hex("#c3c182") };
      for (let i = 0; i < 4; i++) {
        spr["l" + i] = sprite("ob-l" + i, 340, d, [0.5, 0.94], (x, s) => ovalLeaf(x, s * 0.9, s * 0.22, lush, { gloss: 1.4, tip: 1.4 }));
        spr["t" + i] = sprite("ob-t" + i, 340, d, [0.5, 0.94], (x, s) => {
          ovalLeaf(x, s * 0.9, s * 0.22, tired, { gloss: 0.3, tip: 1.4 });
          x.strokeStyle = "rgba(80,70,30,.28)"; x.lineWidth = s * 0.006;
          for (let q = 0; q < 6; q++) { const y = -s * (0.15 + q * 0.12); x.beginPath(); x.moveTo(-s * 0.1, y); x.quadraticCurveTo(0, y - s * 0.03, s * 0.1, y + s * 0.01); x.stroke(); }
        });
      }
      for (let i = 0; i < 6; i++) spr["c" + i] = sprite("ob-c" + i, 60, d, [0.5, 0.5], (x, s) => barkChip(x, s * 0.8, i + 7));
      spr.drop = sprite("ob-drop", 24, d, [0.5, 0.5], (x, s) => {
        const g = x.createRadialGradient(-s * 0.08, -s * 0.08, 0, 0, 0, s / 2);
        g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.3, "rgba(226,212,250,.55)"); g.addColorStop(1, "rgba(200,180,240,0)");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
      });
      spr.puff = sprite("ob-puff", 120, d, [0.5, 0.5], (x, s) => {
        const g = x.createRadialGradient(0, 0, 0, 0, 0, s / 2);
        g.addColorStop(0, "rgba(236,226,252,.55)"); g.addColorStop(1, "rgba(236,226,252,0)");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
      });
    };
    const resize = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
      c.style.width = r.width + "px"; c.style.height = r.height + "px";
      k = Math.min(r.width / V, r.height / V); ox = (r.width - V * k) / 2; oy = r.height - V * k;
      makeSprites();
    };
    const nozzle = () => {
      const bx = -BOTTLE.w / 2 + BOTTLE.nx * BOTTLE.w, by = -BOTTLE.h + BOTTLE.ny * BOTTLE.h;
      const ca = Math.cos(aim), sa = Math.sin(aim);
      return { x: BOTTLE.x + bx * ca - by * sa, y: GROUND + bx * sa + by * ca };
    };
    const spray = (tx: number, ty: number, auto: boolean) => {
      const n0 = nozzle();
      aimT = Math.max(-0.2, Math.min(0.12, Math.atan2(ty - n0.y, n0.x - tx) * 0.35));
      press = 1;
      shots.push({ tx, ty, at: performance.now(), hit: false, auto });
      if (!auto && !first) { first = true; onFirstSpray?.(); }
    };
    const openNext = (n: number, gap: number) => {
      const closed = flowers.filter((f) => !f.bud && f.target < 1);
      closed.slice(0, n).forEach((f, i) => { f.target = 1; f.delay = performance.now() + 200 + i * gap; });
      return closed.length;
    };
    const onHit = (auto: boolean) => {
      vigorT = 1; wetT = 1;
      if (auto) { openNext(3, 420); return; }
      if (!openNext(2, 300)) flowers.forEach((f, i) => { if (!f.bud) { f.o = 0.7; f.delay = performance.now() + i * 60; } });
    };

    let raf = 0, last = performance.now(), visible = true;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = (now - t0) / 1000;
      vigor += (vigorT - vigor) * Math.min(1, dt * 1.4);
      wet += (wetT - wet) * Math.min(1, dt * 0.9);
      wind *= Math.pow(0.04, dt);
      press = Math.max(0, press - dt * 4);
      aim += (aimT - aim) * Math.min(1, dt * 6);
      if (press === 0) aimT *= Math.pow(0.2, dt);
      for (const f of flowers) if (f.target > f.o && now >= f.delay) f.o = Math.min(f.target, f.o + dt * 0.7);
      for (const s of shots) {
        const age = (now - s.at) / 1000;
        if (age > 0.05 && age < 0.32) {
          const n = nozzle(), base = Math.atan2(s.ty - n.y, s.tx - n.x);
          for (let i = 0; i < Math.ceil(dt * 900); i++) { const a = base + (Math.random() - 0.5) * 0.5, sp = 700 + Math.random() * 520; drops.push({ x: n.x, y: n.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.7 + Math.random() * 0.7, r: 0.35 + Math.random() * 0.75 }); }
          if (Math.random() < dt * 30) { const a = base + (Math.random() - 0.5) * 0.25, sp = 520 + Math.random() * 200; drops.push({ x: n.x, y: n.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 1.3, r: 0.5, puff: true }); }
        }
        if (!s.hit && age > 0.42) { s.hit = true; onHit(s.auto); }
      }
      while (shots.length && now - shots[0].at > 1500) shots.shift();
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.life += dt;
        if (d.life > d.max) { drops.splice(i, 1); continue; }
        const drag = Math.pow(0.06, dt); d.vx *= drag; d.vy = d.vy * drag + 60 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
      // gölgeler
      for (const [x, w, a] of [[POT.x, 190, 0.2], [BOTTLE.x, 110, 0.18]]) {
        const g = ctx.createRadialGradient(x, GROUND, 0, x, GROUND, w);
        g.addColorStop(0, `rgba(60,20,70,${a})`); g.addColorStop(1, "rgba(60,20,70,0)");
        ctx.save(); ctx.translate(x, GROUND); ctx.scale(1, 0.12); ctx.translate(-x, -GROUND); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, GROUND, w, 0, 6.28); ctx.fill(); ctx.restore();
      }
      // saksı içi: kabuk + kökler (cam arkasında)
      const potPath = () => {
        ctx.beginPath();
        ctx.moveTo(POT.x - POT.wTop / 2, POT.top); ctx.lineTo(POT.x - POT.wBot / 2, POT.top + POT.h);
        ctx.quadraticCurveTo(POT.x, POT.top + POT.h + 8, POT.x + POT.wBot / 2, POT.top + POT.h); ctx.lineTo(POT.x + POT.wTop / 2, POT.top); ctx.closePath();
      };
      ctx.save(); potPath(); ctx.clip();
      ctx.fillStyle = "rgba(150,115,85,.38)"; ctx.fillRect(POT.x - 140, POT.top + 16, 280, POT.h);
      const rootCol: RGB = mix(hex("#d4d9cc"), hex("#6fa35a"), wet);
      const drawRootPath = (pts: [number, number][], w: number) => {
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(70,60,40,.5)"; ctx.lineWidth = w + 2.4;
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.strokeStyle = css(rootCol); ctx.lineWidth = w;
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = w * 0.25;
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x - w * 0.2, y) : ctx.moveTo(x - w * 0.2, y))); ctx.stroke();
      };
      chips.slice(0, 20).forEach((ch, i) => stamp(ctx, spr["c" + (i % 6)], POT.x + ch.x * POT.wTop, POT.top + 20 + ch.y * (POT.h - 30), ch.w / 48, ch.rot));
      roots.forEach((r) => drawRootPath(r, 9));
      chips.slice(20).forEach((ch, i) => stamp(ctx, spr["c" + (i % 6)], POT.x + ch.x * POT.wTop, POT.top + 20 + ch.y * (POT.h - 30), ch.w / 48, ch.rot));
      ctx.restore();
      // cam saksı
      potPath();
      ctx.fillStyle = "rgba(225,235,242,.28)"; ctx.fill();
      ctx.strokeStyle = "rgba(120,140,160,.55)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(POT.x - POT.wTop / 2 + 18, POT.top + 30); ctx.lineTo(POT.x - POT.wBot / 2 + 18, POT.top + POT.h - 26); ctx.stroke();
      ctx.fillStyle = "rgba(235,242,248,.7)"; ctx.strokeStyle = "rgba(120,140,160,.55)";
      ctx.beginPath(); ctx.roundRect(POT.x - POT.wTop / 2 - 8, POT.top - 6, POT.wTop + 16, 16, 5); ctx.fill(); ctx.stroke();

      // çubuk
      ctx.strokeStyle = "#c9a46a"; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(SPIKE.x0 + 10, POT.top + 60); ctx.lineTo(SPIKE.x1 + 8, SPIKE.y1 - 10); ctx.stroke();
      // yapraklar (arka iki)
      const sway = (ph: number, amp: number) => Math.sin(t * 0.8 + ph) * amp + wind * amp * 0.01;
      const leaf = (i: number, rot: number, scale: number, ph: number) => {
        const droop = (1 - vigor) * 0.32 * Math.sign(rot);
        const r = rot + droop + sway(ph, 0.012);
        stamp(ctx, spr["t" + i], CROWN.x, CROWN.y, scale, r, 1, 0.8);
        stamp(ctx, spr["l" + i], CROWN.x, CROWN.y, scale, r, vigor, 0.8);
      };
      leaf(2, -1.05, 0.72, 1); leaf(3, 1.1, 0.68, 2);
      // çiçek sapı
      ctx.strokeStyle = css(mix(hex("#5d7a3a"), hex("#7a5a3a"), 0.25)); ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const p = spikeAt(i / 40); const sw = i > 16 ? sway(0.5, 6) * ((i - 16) / 24) : 0; if (i) ctx.lineTo(p.x + sw, p.y); else ctx.moveTo(p.x, p.y); }
      ctx.stroke();
      // klips
      ctx.fillStyle = "#e8e0d0"; ctx.beginPath(); ctx.arc(SPIKE.x1 + 6, SPIKE.y1 + 60, 6, 0, 6.28); ctx.fill();
      // çiçekler (uçtan dibe → dipteki önde)
      for (let i = flowers.length - 1; i >= 0; i--) {
        const f = flowers[i];
        const p = spikeAt(f.t);
        const sw = sway(0.5, 6) * Math.max(0, (f.t - 0.42) / 0.58);
        const fx = p.x + sw, fy = p.y + 30 + f.r * 0.25;
        // sapçık
        ctx.strokeStyle = "#6f8a45"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(p.x + sw, p.y); ctx.quadraticCurveTo(fx + 6, p.y + 12, fx, fy - f.r * 0.3); ctx.stroke();
        const q = ease(f.o);
        stamp(ctx, spr.bud, fx, fy - f.r * 0.25, (f.bud ? 0.75 : 1) * (1 + q * 0.3), f.rot, 1 - Math.min(1, q * 1.6));
        if (!f.bud && f.o > 0.01) stamp(ctx, spr["f" + (i % 3 === 2 ? 2 : i % 2)], fx, fy, (f.r / 66) * back(f.o), f.rot + (1 - q) * 0.6, Math.min(1, f.o * 2.4));
      }
      // ön yapraklar
      leaf(0, -1.62, 0.9, 3); leaf(1, 1.56, 0.84, 4);
      // hava kökleri (saksı dışında)
      for (const pth of aerial) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(70,60,40,.45)"; ctx.lineWidth = 11.5;
        ctx.beginPath(); ctx.moveTo(pth[0][0], pth[0][1]); ctx.bezierCurveTo(pth[1][0], pth[1][1], pth[2][0], pth[2][1], pth[3][0], pth[3][1]); ctx.stroke();
        ctx.strokeStyle = css(rootCol); ctx.lineWidth = 9;
        ctx.beginPath(); ctx.moveTo(pth[0][0], pth[0][1]); ctx.bezierCurveTo(pth[1][0], pth[1][1], pth[2][0], pth[2][1], pth[3][0], pth[3][1]); ctx.stroke();
        ctx.fillStyle = css(mix(hex("#9cc56a"), hex("#4f9a3c"), wet)); ctx.beginPath(); ctx.arc(pth[3][0], pth[3][1], 5.4, 0, 6.28); ctx.fill();
      }
      // şişe
      if (bottle.complete && bottle.naturalWidth) {
        ctx.save(); ctx.translate(BOTTLE.x, GROUND); ctx.rotate(aim); ctx.scale(1, 1 - Math.sin(press * Math.PI) * 0.012);
        ctx.drawImage(bottle, -BOTTLE.w / 2, -BOTTLE.h, BOTTLE.w, BOTTLE.h); ctx.restore();
      }
      for (const d of drops) {
        const q = d.life / d.max;
        if (d.puff) stamp(ctx, spr.puff, d.x, d.y, 0.4 + q * 1.4, 0, (1 - q) * 0.7);
        else stamp(ctx, spr.drop, d.x, d.y, d.r * (0.45 + q * 0.9), 0, Math.min(1, (1 - q) * 1.1));
      }
      const busy = drops.length || shots.length || Math.abs(vigorT - vigor) > 0.002 || Math.abs(wetT - wet) > 0.002 || flowers.some((f) => f.o < f.target);
      if (visible && (busy || !reduce)) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    resize();
    bottle.onload = kick;
    const ro = new ResizeObserver(() => { resize(); kick(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { threshold: 0.02 });
    io.observe(el);
    const toV = (e: PointerEvent) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left - ox) / k, y: (e.clientY - r.top - oy) / k }; };
    const onDown = (e: PointerEvent) => { const p = toV(e); spray(Math.max(200, Math.min(720, p.x)), Math.max(160, Math.min(720, p.y)), false); kick(); };
    const onMove = (e: PointerEvent) => { const dx = e.clientX - lastPX; lastPX = e.clientX; wind = Math.max(-40, Math.min(40, wind + dx * 0.4)); kick(); };
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("pointermove", onMove);
    const timers: number[] = [];
    if (!reduce) {
      timers.push(window.setTimeout(() => { spray(470, 380, true); kick(); }, 700));
      timers.push(window.setTimeout(() => { spray(560, 300, true); kick(); }, 1500));
      timers.push(window.setTimeout(() => { flowers.forEach((f, i) => { if (!f.bud && f.target < 1) { f.target = 1; f.delay = performance.now() + i * 260; } }); kick(); }, 2700));
    }
    kick();
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro.disconnect(); io.disconnect(); c.removeEventListener("pointerdown", onDown); c.removeEventListener("pointermove", onMove); };
  }, [reduce, onFirstSpray]);

  return (
    <div ref={wrap} className="hb">
      <canvas ref={cvs} className="hb__c" role="img" aria-label="Çiçek Coşturan orkide şişesi şeffaf saksıdaki kelebek orkideye sıkıyor; kökler yeşile dönüyor, tomurcuklar sırayla açıyor. Sahneye tıklayarak tekrar sıkabilirsiniz." />
    </div>
  );
}

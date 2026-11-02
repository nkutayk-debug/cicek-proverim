"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { CPAL, CTONE, INK_RGB, aloe, cactusBloom, cactusBody, cactusTube, colProf, crownRing, css, echeveria, haworthia, hex, mix, rng, sprite, stamp, type LeafTone, type Sprite } from "@/lib/flora";

/* ============================================================================
   Kaktüs & sukulent hero sahnesi: geniş toprak kasede sütun kaktüs, aloe,
   top kaktüs (Mammillaria), eşeverya ve zebra haworthia; sağda yeşil şişe.
   Sis değince: yüzeylerde su boncukları belirir, solgun renkler canlanır,
   eşeverya rozeti toplanıp uçları pembeleşir, top kaktüsün tacı sırayla açar,
   sütun kaktüsün tepesinde iri çiçekler patlar. Tıklama: bir fıs daha.
   ========================================================================== */

const V = 1000;
const GROUND = 942;
const BOWL = { x: 440, y: 790, rx: 290, ry: 40, depth: 140, bot: 190 };
const BOTTLE = { x: 852, h: 600, w: 600 * (334 / 1189), nx: 0.251, ny: 0.024 };
const CER = { x: 326, y: 798, w: 104, h: 540, ax: 106, ay: -196, aw: 78, ah: 236 };
const MAM = { x: 462, y: 824, w: 178, h: 166 };
const ECH = { x: 628, y: 808, r: 120 };
const ALO = { x: 580, y: 786, s: 350 };
const HAW = { x: 236, y: 830, s: 210 };

type Fl = { x: number; y: number; r: number; o: number; target: number; delay: number; rot: number; back: boolean; pal: keyof typeof CPAL; big?: boolean };
type Drop = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; puff?: boolean };
type Bead = { x: number; y: number; r: number; born: number; life: number; ph: number };
type Shot = { tx: number; ty: number; at: number; hit: boolean; auto: boolean };

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const back = (t: number) => { if (t <= 0) return 0; if (t >= 1) return 1; const c = 1.8; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const tiredOf = (t: LeafTone, k = 0.62): LeafTone => ({ dark: mix(t.dark, CTONE.pale.dark, k), base: mix(t.base, CTONE.pale.base, k), light: mix(t.light, CTONE.pale.light, k) });

export default function KaktusBloom({ onFirstSpray }: { onFirstSpray?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = wrap.current!, c = cvs.current!;
    const ctx = c.getContext("2d")!;
    const R = rng(808);
    // top kaktüs tacı + sütun kaktüs çiçekleri
    const flowers: Fl[] = crownRing(MAM.w, MAM.h, 11).map((p) => ({ x: MAM.x + p.x, y: MAM.y + p.y, r: 21 + R() * 4, o: reduce ? 1 : 0, target: reduce ? 1 : 0, delay: 0, rot: (R() - 0.5) * 0.6, back: p.front < 0, pal: "pink" as const }));
    flowers.push({ x: CER.x + 6, y: CER.y - CER.h + 4, r: 52, o: reduce ? 1 : 0, target: reduce ? 1 : 0, delay: 0, rot: 0.1, back: false, pal: "white", big: true });
    flowers.push({ x: CER.x + CER.ax + 3, y: CER.y + CER.ay - CER.ah + 4, r: 44, o: reduce ? 1 : 0, target: reduce ? 1 : 0, delay: 0, rot: -0.15, back: false, pal: "magenta", big: true });
    // su boncuğu adayları (bitki yüzeyleri)
    const spots: { x: number; y: number }[] = [];
    for (let i = 0; i < 70; i++) { const a = R() * 6.28, d = Math.sqrt(R()); spots.push({ x: MAM.x + Math.cos(a) * d * 66, y: MAM.y - 72 + Math.sin(a) * d * 62 }); }
    for (let i = 0; i < 60; i++) { const a = R() * 6.28, d = Math.sqrt(R()); spots.push({ x: ECH.x + Math.cos(a) * d * 92, y: ECH.y + Math.sin(a) * d * 46 }); }
    for (let i = 0; i < 60; i++) spots.push({ x: CER.x + (R() - 0.5) * 70, y: CER.y - 30 - R() * (CER.h - 60) });
    for (let i = 0; i < 26; i++) spots.push({ x: CER.x + CER.ax + (R() - 0.5) * 50, y: CER.y + CER.ay - R() * (CER.ah - 20) });
    for (let i = 0; i < 50; i++) { const a = -1.05 + R() * 2.1, d = 50 + R() * 150; spots.push({ x: ALO.x + Math.sin(a) * d, y: ALO.y - Math.cos(a) * d }); }
    for (let i = 0; i < 26; i++) { const a = -0.9 + R() * 1.8, d = 20 + R() * 60; spots.push({ x: HAW.x + Math.sin(a) * d, y: HAW.y - Math.cos(a) * d }); }

    const drops: Drop[] = [];
    const beads: Bead[] = [];
    const shots: Shot[] = [];
    let vigor = reduce ? 1 : 0, vigorT = vigor;
    let k = 1, ox = 0, oy = 0, dpr = 1, press = 0, aim = 0, aimT = 0, first = false, pulse = 0;
    let spr: Record<string, Sprite> = {};
    const bottle = new Image();
    bottle.src = "/img/sise-kaktus.webp";

    const makeSprites = () => {
      const d = dpr * k;
      spr = {};
      for (const v of ["f", "t"] as const) {
        const tired = v === "t";
        const ct: LeafTone = tired ? tiredOf(CTONE.cactus) : CTONE.cactus;
        spr["cer" + v] = sprite("kb-cer" + v, 680, d, [0.34, 0.9], (x) => {
          cactusTube(x, [CER.w * 0.2, CER.ay + CER.aw * 0.55, CER.ax, CER.ay + CER.aw * 0.62, CER.ax, CER.ay - CER.aw * 0.1], CER.aw * 0.96, ct);
          x.save(); x.translate(CER.ax, CER.ay); cactusBody(x, CER.aw, CER.ah, { prof: colProf(0.18), ribs: 8, seed: 7, rot: 0.3, tone: ct }); x.restore();
          cactusBody(x, CER.w, CER.h, { prof: colProf(0.1), ribs: 9, seed: 5, tone: ct });
        });
        spr["mam" + v] = sprite("kb-mam" + v, 300, d, [0.5, 0.82], (x) => cactusBody(x, MAM.w, MAM.h, { tuber: true, rows: 170, spine: "rgba(252,250,240,.92)", spineLen: MAM.w * 0.075, tone: tired ? tiredOf(CTONE.cactus, 0.5) : CTONE.cactus }));
        spr["alo" + v] = sprite("kb-alo" + v, 560, d, [0.5, 0.86], (x) => aloe(x, ALO.s, tired ? tiredOf(CTONE.aloe, 0.55) : CTONE.aloe));
        spr["haw" + v] = sprite("kb-haw" + v, 290, d, [0.5, 0.86], (x) => haworthia(x, HAW.s));
        spr["ech" + v] = sprite("kb-ech" + v, 280, d, [0.5, 0.5], (x, s) => echeveria(x, s * 0.43, 6, tired ? { blush: 0.05, pale: 0.6, open: 0.55 } : { blush: 0.75 }));
      }
      for (const p of Object.keys(CPAL) as (keyof typeof CPAL)[]) spr["fl-" + p] = sprite("kb-fl-" + p, 120, d, [0.5, 0.5], (x, s) => cactusBloom(x, s * 0.44, CPAL[p], 5));
      spr.bud = sprite("kb-bud", 40, d, [0.5, 0.75], (x, s) => {
        const g = x.createLinearGradient(0, -s * 0.5, 0, s * 0.2); g.addColorStop(0, "#f7a8c8"); g.addColorStop(1, "#8bbd6a");
        x.fillStyle = g; x.strokeStyle = css(INK_RGB, 0.3); x.lineWidth = 1;
        x.beginPath(); x.ellipse(0, -s * 0.15, s * 0.2, s * 0.3, 0, 0, 6.28); x.fill(); x.stroke();
      });
      spr.bowl = sprite("kb-bowl", 680, d, [0.5, 0.3], (x) => {
        const { rx, ry, depth, bot } = BOWL;
        // gövde
        x.beginPath(); x.moveTo(-rx, 0); x.bezierCurveTo(-rx, depth * 0.55, -bot - 30, depth, -bot, depth); x.lineTo(bot, depth); x.bezierCurveTo(bot + 30, depth, rx, depth * 0.55, rx, 0); x.closePath();
        const g = x.createLinearGradient(-rx, 0, rx, 0);
        g.addColorStop(0, "#e7a77a"); g.addColorStop(0.3, "#d2804f"); g.addColorStop(0.72, "#b15c34"); g.addColorStop(1, "#7f3c22");
        x.fillStyle = g; x.fill(); x.strokeStyle = "rgba(58,22,46,.3)"; x.lineWidth = 1.4; x.stroke();
        const sh = x.createLinearGradient(0, 0, 0, depth); sh.addColorStop(0, "rgba(60,20,10,.22)"); sh.addColorStop(0.25, "rgba(60,20,10,0)"); sh.addColorStop(1, "rgba(60,20,10,.18)");
        x.fillStyle = sh; x.fill();
        const RR = rng(14);
        for (let i = 0; i < 260; i++) { const y = RR() * depth, t = y / depth, half = rx * (1 - t * t) + bot * t * t; x.fillStyle = RR() > 0.5 ? "rgba(255,230,210,.16)" : "rgba(90,30,10,.13)"; x.fillRect((RR() * 2 - 1) * half * 0.94, y + 8, 1.6, 1.6); }
        // ağız
        x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.28);
        const rg = x.createLinearGradient(-rx, 0, rx, 0); rg.addColorStop(0, "#f0b88d"); rg.addColorStop(0.4, "#dc8d5c"); rg.addColorStop(1, "#9b4a2a");
        x.fillStyle = rg; x.fill(); x.stroke();
        // toprak + çakıl
        x.beginPath(); x.ellipse(0, 3, rx - 14, ry - 8, 0, 0, 6.28); x.fillStyle = "#5b3f2b"; x.fill();
        const cols = ["#efe9dc", "#d9d2c3", "#bdb5a6", "#f6f2ea", "#a8a091", "#e4d6bf", "#cfc3ae"];
        for (let i = 0; i < 230; i++) {
          const a = RR() * 6.28, dd = Math.sqrt(RR()), px = Math.cos(a) * dd * (rx - 22), py = 3 + Math.sin(a) * dd * (ry - 12), r = 3.5 + RR() * 5.5;
          x.fillStyle = cols[(RR() * cols.length) | 0]; x.strokeStyle = "rgba(58,22,46,.2)"; x.lineWidth = 0.8;
          x.beginPath(); x.ellipse(px, py, r, r * 0.68, RR() * 3, 0, 6.28); x.fill(); x.stroke();
        }
      });
      spr.front = sprite("kb-front", 680, d, [0.5, 0.3], (x) => {
        const { rx, ry } = BOWL, RR = rng(19);
        const cols = ["#efe9dc", "#d9d2c3", "#f6f2ea", "#e4d6bf"];
        for (let i = 0; i < 60; i++) {
          const a = 0.35 + RR() * 2.45, dd = 0.72 + RR() * 0.26, px = Math.cos(a) * dd * (rx - 22), py = 3 + Math.sin(a) * dd * (ry - 12), r = 4 + RR() * 5;
          x.fillStyle = cols[(RR() * cols.length) | 0]; x.strokeStyle = "rgba(58,22,46,.2)"; x.lineWidth = 0.8;
          x.beginPath(); x.ellipse(px, py, r, r * 0.68, RR() * 3, 0, 6.28); x.fill(); x.stroke();
        }
        // ön ağız kenarı
        x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0.12, Math.PI - 0.12); x.strokeStyle = "#e8a274"; x.lineWidth = 9; x.stroke();
        x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0.4, Math.PI - 0.4); x.strokeStyle = "rgba(255,236,214,.55)"; x.lineWidth = 2.4; x.stroke();
      });
      spr.drop = sprite("kb-drop", 24, d, [0.5, 0.5], (x, s) => {
        const g = x.createRadialGradient(-s * 0.08, -s * 0.08, 0, 0, 0, s / 2);
        g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.3, "rgba(214,242,222,.55)"); g.addColorStop(1, "rgba(190,230,200,0)");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
      });
      spr.puff = sprite("kb-puff", 120, d, [0.5, 0.5], (x, s) => {
        const g = x.createRadialGradient(0, 0, 0, 0, 0, s / 2);
        g.addColorStop(0, "rgba(226,246,232,.55)"); g.addColorStop(1, "rgba(226,246,232,0)");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, s / 2, 0, 6.28); x.fill();
      });
      spr.bead = sprite("kb-bead", 32, d, [0.5, 0.5], (x, s) => {
        const r = s * 0.42;
        x.fillStyle = "rgba(40,70,50,.18)"; x.beginPath(); x.arc(r * 0.12, r * 0.18, r, 0, 6.28); x.fill();
        const g = x.createRadialGradient(-r * 0.3, -r * 0.35, 0, 0, 0, r);
        g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.35, "rgba(235,250,240,.35)"); g.addColorStop(0.85, "rgba(200,232,212,.25)"); g.addColorStop(1, "rgba(90,130,100,.5)");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, 6.28); x.fill();
        x.fillStyle = "rgba(255,255,255,.95)"; x.beginPath(); x.ellipse(-r * 0.35, -r * 0.4, r * 0.22, r * 0.14, -0.6, 0, 6.28); x.fill();
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
    const addBeads = (tx: number, ty: number, n: number) => {
      const now = performance.now();
      const near = spots.filter((s) => Math.hypot(s.x - tx, s.y - ty) < 300);
      const pool = near.length > 12 ? near : spots;
      for (let i = 0; i < n; i++) {
        const s = pool[(Math.random() * pool.length) | 0];
        beads.push({ x: s.x + (Math.random() - 0.5) * 8, y: s.y + (Math.random() - 0.5) * 8, r: 0.22 + Math.random() * 0.32, born: now + Math.random() * 380, life: 6 + Math.random() * 6, ph: Math.random() * 6.28 });
      }
      while (beads.length > 150) beads.shift();
    };
    const openNext = (n: number, gap: number) => {
      const closed = flowers.filter((f) => f.target < 1).sort((a, b) => Number(a.big) - Number(b.big));
      closed.slice(0, n).forEach((f, i) => { f.target = 1; f.delay = performance.now() + 200 + i * gap; });
      return closed.length;
    };
    const onHit = (s: Shot) => {
      vigorT = 1;
      addBeads(s.tx, s.ty, s.auto ? 46 : 30);
      if (s.auto) { openNext(4, 260); return; }
      if (!openNext(3, 220)) pulse = 1;
    };

    let raf = 0, last = performance.now(), visible = true;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = (now - t0) / 1000;
      vigor += (vigorT - vigor) * Math.min(1, dt * 1.1);
      press = Math.max(0, press - dt * 4);
      pulse = Math.max(0, pulse - dt * 1.6);
      aim += (aimT - aim) * Math.min(1, dt * 6);
      if (press === 0) aimT *= Math.pow(0.2, dt);
      for (const f of flowers) if (f.target > f.o && now >= f.delay) f.o = Math.min(f.target, f.o + dt * (f.big ? 0.55 : 0.9));
      for (const s of shots) {
        const age = (now - s.at) / 1000;
        if (age > 0.05 && age < 0.32) {
          const n = nozzle(), base = Math.atan2(s.ty - n.y, s.tx - n.x);
          for (let i = 0; i < Math.ceil(dt * 900); i++) { const a = base + (Math.random() - 0.5) * 0.5, sp = 700 + Math.random() * 520; drops.push({ x: n.x, y: n.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.7 + Math.random() * 0.7, r: 0.35 + Math.random() * 0.75 }); }
          if (Math.random() < dt * 30) { const a = base + (Math.random() - 0.5) * 0.25, sp = 520 + Math.random() * 200; drops.push({ x: n.x, y: n.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 1.3, r: 0.5, puff: true }); }
        }
        if (!s.hit && age > 0.42) { s.hit = true; onHit(s); }
      }
      while (shots.length && now - shots[0].at > 1500) shots.shift();
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.life += dt;
        if (d.life > d.max) { drops.splice(i, 1); continue; }
        const drag = Math.pow(0.06, dt); d.vx *= drag; d.vy = d.vy * drag + 60 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
      }
      for (let i = beads.length - 1; i >= 0; i--) if ((now - beads[i].born) / 1000 > beads[i].life) beads.splice(i, 1);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
      // gölgeler
      for (const [x, w, a] of [[BOWL.x, 300, 0.2], [BOTTLE.x, 110, 0.18]]) {
        const g = ctx.createRadialGradient(x, GROUND, 0, x, GROUND, w);
        g.addColorStop(0, `rgba(20,60,35,${a})`); g.addColorStop(1, "rgba(20,60,35,0)");
        ctx.save(); ctx.translate(x, GROUND); ctx.scale(1, 0.1); ctx.translate(-x, -GROUND); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, GROUND, w, 0, 6.28); ctx.fill(); ctx.restore();
      }
      stamp(ctx, spr.bowl, BOWL.x, BOWL.y);
      const both = (key: string, x: number, y: number, sc = 1, fy = 1) => { stamp(ctx, spr[key + "t"], x, y, sc, 0, 1, fy); stamp(ctx, spr[key + "f"], x, y, sc, 0, vigor, fy); };
      // arka sıra
      both("alo", ALO.x, ALO.y);
      both("cer", CER.x, CER.y);
      // sütun kaktüs çiçekleri
      const sway = (ph: number) => Math.sin(t * 1.1 + ph) * 0.03;
      const flower = (f: Fl) => {
        const q = ease(f.o), pop = 1 + pulse * 0.08 * Math.sin(pulse * 12 + f.x);
        if (f.o < 1) stamp(ctx, spr.bud, f.x, f.y + (f.big ? 6 : 2), (f.big ? 1.25 : 0.62) * (1 + q * 0.2), f.rot, 1 - Math.min(1, q * 1.8));
        if (f.o > 0.01) stamp(ctx, spr["fl-" + f.pal], f.x, f.y - (f.big ? 4 : 0), (f.r / 53) * back(f.o) * pop, f.rot + sway(f.x) + (1 - q) * 0.5, Math.min(1, f.o * 2.4), f.big ? 0.62 : 0.74);
      };
      flowers.filter((f) => f.big).forEach(flower);
      both("haw", HAW.x, HAW.y);
      // top kaktüs: arka taç → gövde → ön taç
      flowers.filter((f) => !f.big && f.back).forEach(flower);
      both("mam", MAM.x, MAM.y);
      flowers.filter((f) => !f.big && !f.back).forEach(flower);
      // eşeverya: toplanır, büyür
      const es = 0.92 + 0.08 * vigor;
      stamp(ctx, spr.echt, ECH.x, ECH.y, es * 1.04, 0.2, 1, 0.56);
      stamp(ctx, spr.echf, ECH.x, ECH.y, es, 0.2, vigor, 0.56);
      stamp(ctx, spr.front, BOWL.x, BOWL.y);
      // su boncukları
      for (const b of beads) {
        const age = (now - b.born) / 1000; if (age < 0) continue;
        const a = Math.min(1, age * 5) * Math.min(1, (b.life - age) / 2.2);
        const tw = 0.85 + 0.15 * Math.sin(t * 3 + b.ph);
        stamp(ctx, spr.bead, b.x, b.y + Math.min(4, age * 0.4), b.r * Math.min(1, age * 6) * (0.75 + 0.25 * Math.min(1, (b.life - age) / 2.2)), 0, a * tw);
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
      const busy = drops.length || shots.length || beads.length || pulse > 0 || Math.abs(vigorT - vigor) > 0.002 || flowers.some((f) => f.o < f.target);
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
    const onDown = (e: PointerEvent) => { const p = toV(e); spray(Math.max(220, Math.min(700, p.x)), Math.max(420, Math.min(830, p.y)), false); kick(); };
    c.addEventListener("pointerdown", onDown);
    const timers: number[] = [];
    if (!reduce) {
      timers.push(window.setTimeout(() => { spray(560, 700, true); kick(); }, 700));
      timers.push(window.setTimeout(() => { spray(380, 560, true); kick(); }, 1500));
      timers.push(window.setTimeout(() => { flowers.forEach((f, i) => { if (f.target < 1) { f.target = 1; f.delay = performance.now() + i * 180; } }); kick(); }, 2700));
    }
    kick();
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro.disconnect(); io.disconnect(); c.removeEventListener("pointerdown", onDown); };
  }, [reduce, onFirstSpray]);

  return (
    <div ref={wrap} className="hb">
      <canvas ref={cvs} className="hb__c" role="img" aria-label="Çiçek Coşturan kaktüs ve sukulent şişesi toprak kasedeki kaktüs, aloe, eşeverya ve haworthiaya sıkıyor; yüzeylerde su damlaları beliriyor, renkler canlanıyor, kaktüs çiçekleri açıyor. Sahneye tıklayarak tekrar sıkabilirsiniz." />
    </div>
  );
}

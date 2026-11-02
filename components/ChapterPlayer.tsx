"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play } from "@phosphor-icons/react";
import Icon from "./Icon";
import Refs from "./Refs";
import { createWhyScene } from "@/lib/whyScene";
import { createRootLens } from "@/lib/rootlens";
import { createOrchidScene } from "@/lib/orchidScene";
import { createOrchidLens } from "@/lib/orchidLens";
import { createKaktusScene } from "@/lib/kaktusScene";
import { createKaktusLens } from "@/lib/kaktusLens";

export type Chapter = { icon: string; title: string; text: string; refs: number[]; kicker?: string };

/* Hareketli infografik: bölümler video gibi akar (yapışkan değil, sayfayı tutmaz).
   Görünür olunca oynar; bölüme tıklayınca atlar. */
export default function ChapterPlayer({ id, title, lead, chapters, kind, dur = 7.5, labels = [] }: {
  id: string; title: string; lead: string; chapters: Chapter[]; kind: "why" | "roots" | "whyOrchid" | "rootsOrchid" | "whyKaktus" | "rootsKaktus"; dur?: number; labels?: { problem: string; fix: string }[];
}) {
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const state = useRef({ ch: 0, t: 0, playing: false, user: false, visible: false });
  const [ch, setCh] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = stage.current!, c = cvs.current!;
    const scene = kind === "why" ? createWhyScene(c) : kind === "whyOrchid" ? createOrchidScene(c, labels) : kind === "whyKaktus" ? createKaktusScene(c, labels) : null;
    const lens = kind === "roots" ? createRootLens(c) : kind === "rootsOrchid" ? createOrchidLens(c) : kind === "rootsKaktus" ? createKaktusLens(c) : null;
    let raf = 0, last = performance.now(), ready = false;
    const time0 = performance.now();
    const s = state.current;
    if (reduce) { s.t = 1; }

    const resize = () => {
      const r = el.getBoundingClientRect();
      if (scene) scene.resize(r.width, r.height);
      if (lens) lens.resize(Math.min(r.width, r.height));
    };
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (s.playing && s.visible && !reduce) {
        s.t += dt / dur;
        if (s.t >= 1) {
          s.t = 0;
          s.ch = (s.ch + 1) % chapters.length;
          setCh(s.ch);
        }
      }
      bars.current.forEach((b, i) => b && b.style.setProperty("--p", String(i < s.ch ? 1 : i === s.ch ? s.t : 0)));
      const time = (now - time0) / 1000;
      if (scene) scene.draw(s.ch, Math.min(1, s.t * 1.08), time);
      if (lens) lens.draw((s.ch + Math.min(1, s.t * 1.05)) / chapters.length, time);
      if (s.visible) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && ready) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const ro = new ResizeObserver(() => { if (ready) { resize(); kick(); } });
    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      if (e.isIntersecting && !ready) { ready = true; resize(); ro.observe(el); }
      if (e.intersectionRatio > 0.35 && !s.user && !s.playing) { s.playing = true; setPlaying(true); }
      kick();
    }, { threshold: [0, 0.35, 0.6], rootMargin: "200px 0px" });
    io.observe(el);
    (state.current as unknown as { kick: () => void }).kick = kick;
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [kind, chapters.length, dur, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (i: number) => {
    const s = state.current;
    s.ch = i; s.t = 0; s.playing = true; setCh(i); setPlaying(true);
    (s as unknown as { kick?: () => void }).kick?.();
  };
  const toggle = () => {
    const s = state.current;
    s.playing = !s.playing; s.user = true; setPlaying(s.playing);
    (s as unknown as { kick?: () => void }).kick?.();
  };
  const c = chapters[ch];

  return (
    <section id={id} ref={sec} className={`cp cp--${kind.startsWith("why") ? "why" : "roots"}`}>
      <div className="wrap cp__head">
        <h2>{title}</h2>
        <p>{lead}</p>
      </div>
      <div className="wrap cp__grid">
        <div className="cp__stage" ref={stage}>
          <canvas ref={cvs} role="img" aria-label={`${title}: ${c.title}`} />
          <button className="cp__play" onClick={toggle} aria-label={playing ? "Durdur" : "Oynat"}>
            {playing ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          </button>
        </div>
        <div className="cp__side">
          <ol className="cp__list">
            {chapters.map((x, i) => (
              <li key={x.title} className={i === ch ? "is-on" : ""}>
                <button onClick={() => go(i)}>
                  <span className="cp__ic"><Icon name={x.icon} size={20} /></span>
                  <span className="cp__t">{x.kicker ? <em>{x.kicker}</em> : null}{x.title}</span>
                </button>
                <span className="cp__bar"><span ref={(el) => { bars.current[i] = el; }} /></span>
              </li>
            ))}
          </ol>
          <AnimatePresence mode="wait">
            <motion.div
              key={ch}
              className="cp__text"
              initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3>{c.title}</h3>
              <p>{c.text}<Refs ns={c.refs} /></p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

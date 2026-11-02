"use client";

import { createContext, useContext, useEffect, useRef, useState, type MutableRefObject } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play, ArrowCounterClockwise, ShoppingBagOpen, ArrowRight } from "@phosphor-icons/react";
import Icon from "../Icon";
import { shotDur, type Shot } from "@/lib/films";
import { bySlug, LINE_COLOR, SET_BOTTLES, tl, type Product } from "@/lib/products";
import type { Prices } from "@/lib/prices";
import { createAmbient, createBloom, createMist } from "@/lib/filmCanvas";
import { createRootLens } from "@/lib/rootlens";
import { createOrchidLens } from "@/lib/orchidLens";
import { createKaktusLens } from "@/lib/kaktusLens";

/* ==========================================================================
   FİLM: kodla üretilen, video gibi akan kısa tanıtım.
   Görünür olunca oynar (sayfayı tutmaz), kesmelerle sahne değişir.
   DOM sahneleri CSS animasyonudur (durdurunca donar); tuval sahneleri saat okur.
   ========================================================================== */

type Clock = { t: number; time: number; playing: boolean };
const ClockCtx = createContext<MutableRefObject<Clock> | null>(null);
const useClock = () => useContext(ClockCtx)!;

const AMB: Record<Shot["type"], number> = { words: 1, strobe: 0.9, bloom: 0.35, spray: 0.25, roots: 0.3, photos: 0.55, product: 0.7, steps: 0.7, end: 0.9 };

export default function Film({ shots, prices, label, here, story = false }: { shots: Shot[]; prices: Prices; label: string; here?: string; story?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const amb = useRef<HTMLCanvasElement>(null);
  const segs = useRef<(HTMLSpanElement | null)[]>([]);
  const tc = useRef<HTMLSpanElement>(null);
  const clock = useRef<Clock>({ t: 0, time: 0, playing: false });
  const ctl = useRef({ idx: 0, visible: false, user: false, ended: false, kick: () => {} });
  const [idx, setIdx] = useState(0);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  const total = shots.reduce((a, s) => a + (Number.isFinite(shotDur(s)) ? shotDur(s) : 0), 0);
  const starts = shots.map((_, i) => shots.slice(0, i).reduce((a, s) => a + (Number.isFinite(shotDur(s)) ? shotDur(s) : 0), 0));

  useEffect(() => {
    const el = root.current!, ac = amb.current!;
    const ambient = createAmbient(ac);
    let raf = 0, last = performance.now(), ready = false;
    const c = clock.current, s = ctl.current;
    const fmt = (x: number) => `0:${String(Math.floor(x)).padStart(2, "0")}`;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (c.playing && s.visible) {
        c.t += dt; c.time += dt;
        const d = shotDur(shots[s.idx]);
        if (c.t >= d) {
          c.t = 0;
          s.idx = Math.min(shots.length - 1, s.idx + 1);
          setIdx(s.idx);
        }
        if (!Number.isFinite(shotDur(shots[s.idx])) && c.t > 2.2) { s.ended = true; }
      }
      const played = starts[s.idx] + (Number.isFinite(shotDur(shots[s.idx])) ? c.t : 0);
      segs.current.forEach((b, i) => b && b.style.setProperty("--p", String(i < s.idx ? 1 : i === s.idx ? Math.min(1, c.t / shotDur(shots[i])) : 0)));
      if (tc.current) tc.current.textContent = `${fmt(played)} / ${fmt(total)}`;
      ambient.draw(c.time, AMB[shots[s.idx].type]);
      if (s.visible) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && ready) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    s.kick = kick;
    const ro = new ResizeObserver(() => { if (ready) { ambient.resize(); kick(); } });
    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      if (e.isIntersecting && !ready) { ready = true; ambient.resize(); ro.observe(el); }
      if (e.intersectionRatio >= 0.5 && !s.user && !c.playing && !reduce) { c.playing = true; setPlaying(true); }
      if (e.intersectionRatio < 0.15 && c.playing && !s.user) { c.playing = false; setPlaying(false); }
      kick();
    }, { threshold: [0, 0.15, 0.5, 0.8], rootMargin: "100px 0px" });
    io.observe(el);
    if (story) { ready = true; ambient.resize(); s.visible = true; s.user = true; c.playing = true; setPlaying(true); kick(); }
    if (reduce && !story) { s.idx = shots.length - 1; setIdx(s.idx); }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [shots, reduce, total, story]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    const c = clock.current, s = ctl.current;
    c.playing = !c.playing; s.user = true; setPlaying(c.playing); s.kick();
  };
  const jump = (i: number) => {
    const c = clock.current, s = ctl.current;
    s.idx = i; c.t = 0; c.playing = true; s.ended = false; setIdx(i); setRun((r) => r + 1); setPlaying(true); s.kick();
  };

  const shot = shots[idx];
  return (
    <ClockCtx.Provider value={clock}>
      <div ref={root} className={`film${story ? " film--story" : ""}${playing ? "" : " is-paused"}`} aria-label={label} role="region">
        <canvas ref={amb} className="film__amb" aria-hidden />
        <div className="film__stage" key={`${idx}-${run}`}>
          <span className="film__flash" aria-hidden />
          <ShotView shot={shot} prices={prices} here={here} story={story} onReplay={() => jump(0)} />
        </div>
        {story ? null : <div className="film__bar">
          <button className="film__btn" onClick={toggle} aria-label={playing ? "Durdur" : "Oynat"}>
            {playing ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
          </button>
          <div className="film__segs">
            {shots.map((s, i) => Number.isFinite(shotDur(s)) ? (
              <button key={i} className="film__seg" style={{ flexGrow: shotDur(s) }} onClick={() => jump(i)} aria-label={`Sahne ${i + 1}`}>
                <span ref={(el) => { segs.current[i] = el; }} />
              </button>
            ) : null)}
          </div>
          <span className="film__tc" ref={tc}>0:00</span>
          <button className="film__btn" onClick={() => jump(0)} aria-label="Baştan oynat"><ArrowCounterClockwise size={16} weight="bold" /></button>
        </div>}
      </div>
    </ClockCtx.Provider>
  );
}

function ShotView({ shot, prices, here, story, onReplay }: { shot: Shot; prices: Prices; here?: string; story?: boolean; onReplay: () => void }) {
  switch (shot.type) {
    case "words": return <WordsShot lines={shot.lines} script={shot.script ?? []} />;
    case "strobe": return <StrobeShot items={shot.items} each={shot.each} />;
    case "bloom": return <BloomShot shot={shot} />;
    case "spray": return <SprayShot text={shot.text} slug={shot.slug} />;
    case "roots": return <RootsShot captions={shot.captions} dur={shot.dur} lens={shot.lens} />;
    case "photos": return <PhotosShot imgs={shot.imgs} caption={shot.caption} />;
    case "product": return <ProductShot slug={shot.slug} callouts={shot.callouts} />;
    case "steps": return <StepsShot steps={shot.steps} />;
    case "end": return <EndShot slug={shot.slug} prices={prices} here={here} story={story} onReplay={onReplay} />;
  }
}

/* ---------- yazı ---------- */
function WordsShot({ lines, script }: { lines: string[]; script: number[] }) {
  let n = 0;
  return (
    <div className="sh sh--words">
      <div className="shw">
        {lines.map((l, li) => (
          <div key={li} className={`shw__line${script.includes(li) ? " is-script" : ""}`}>
            {l.split(" ").map((w, wi) => <span key={wi} style={{ animationDelay: `${0.1 + n++ * 0.16 + li * 0.25}s` }}>{w}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function StrobeShot({ items, each }: { items: { text: string; icon: string }[]; each: number }) {
  return (
    <div className="sh sh--strobe">
      {items.map((it, i) => (
        <div key={it.text} className="shs" style={{ animationDuration: `${each}s`, animationDelay: `${i * each}s` }}>
          <span className="shs__ic"><Icon name={it.icon} size={40} /></span>
          <span className="shs__t">{it.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- tuval sahneleri ---------- */
function useCanvasLoop(setup: (c: HTMLCanvasElement) => { resize: () => void; draw: (t: number, dt: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const clock = useClock();
  useEffect(() => {
    const c = ref.current!;
    const sc = setup(c);
    sc.resize();
    let raf = 0, last = clock.current.t;
    const loop = () => {
      const t = clock.current.t;
      sc.draw(t, Math.max(0, Math.min(0.05, t - last)));
      last = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => sc.resize());
    ro.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

function BloomShot({ shot }: { shot: Extract<Shot, { type: "bloom" }> }) {
  const ref = useCanvasLoop((c) => { const b = createBloom(c, shot.kinds); return { resize: b.resize, draw: (t) => b.draw(t) }; });
  return (
    <div className="sh sh--bloom">
      <canvas ref={ref} className="sh__cv" aria-hidden />
      <div className="shb">
        <p className="shb__cap">{shot.caption}</p>
        {shot.sub ? <p className="shb__sub">{shot.sub}</p> : null}
      </div>
    </div>
  );
}

function SprayShot({ text, slug }: { text: string; slug: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const bottles = useRef<(HTMLImageElement | null)[]>([]);
  const p = bySlug(slug)!;
  const list: Product[] = p.line === "set" ? SET_BOTTLES : [p];
  const ref = useCanvasLoop((c) => {
    const mist = createMist(c, LINE_COLOR[p.line].mist);
    return {
      resize: mist.resize,
      draw: (t, dt) => {
        const sr = stage.current?.getBoundingClientRect();
        if (sr) list.forEach((b, i) => {
          const img = bottles.current[i];
          const st = 0.55 + i * 0.22;
          if (!img || t < st || t > st + 1.5) return;
          const r = img.getBoundingClientRect();
          const x = r.left - sr.left + b.nozzle[0] * r.width, y = r.top - sr.top + b.nozzle[1] * r.height;
          mist.emit(x, y, Math.PI - 0.15 + Math.sin(t * 3.2 + i) * 0.08, dt, 1 / list.length + 0.35);
        });
        mist.step(dt);
      },
    };
  });
  return (
    <div className="sh sh--spray" ref={stage}>
      <canvas ref={ref} className="sh__cv" aria-hidden />
      <p className="shp__text" style={{ ["--line" as string]: LINE_COLOR[p.line].main }}>{text}</p>
      <div className={`shp__bottles shp__bottles--${list.length}`}>
        {list.map((b, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={b.slug} ref={(el) => { bottles.current[i] = el; }} src={b.bottle} alt="" style={{ animationDelay: `${i * 0.12}s`, aspectRatio: `${b.ratio}` }} />
        ))}
      </div>
    </div>
  );
}

function RootsShot({ captions, dur, lens: kind }: { captions: string[]; dur: number; lens?: "orchid" | "kaktus" }) {
  const ref = useCanvasLoop((c) => {
    const lens = kind === "orchid" ? createOrchidLens(c) : kind === "kaktus" ? createKaktusLens(c) : createRootLens(c);
    return { resize: () => lens.resize(c.getBoundingClientRect().width), draw: (t) => lens.draw(Math.min(1, t / (dur * 0.92)), t) };
  });
  const each = dur / captions.length;
  return (
    <div className="sh sh--roots">
      <div className="shr__lens"><canvas ref={ref} aria-hidden /></div>
      <div className="shr__caps">
        {captions.map((t, i) => (
          <p key={t} style={{ animationDelay: `${i * each}s`, animationDuration: `${each}s` }} className={i === captions.length - 1 ? "is-last" : ""}>{t}</p>
        ))}
      </div>
    </div>
  );
}

/* ---------- fotoğraf, ürün, adımlar, kapanış ---------- */
function PhotosShot({ imgs, caption }: { imgs: string[]; caption: string }) {
  return (
    <div className="sh sh--photos">
      <div className="shph">
        {imgs.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s} src={s} alt="" style={{ animationDelay: `${0.1 + i * 0.28}s`, ["--r" as string]: `${(i - 1) * 2.5}deg` }} />
        ))}
      </div>
      <p className="shph__cap">{caption}</p>
    </div>
  );
}

function ProductShot({ slug, callouts }: { slug: string; callouts: { icon: string; text: string }[] }) {
  const p = bySlug(slug)!;
  const list = p.line === "set" ? SET_BOTTLES : [p];
  const pos = ["lt", "rt", "lb", "rb"];
  return (
    <div className="sh sh--product" style={{ ["--line" as string]: LINE_COLOR[p.line].main }}>
      <div className="shpr__glow" aria-hidden />
      <div className={`shpr__bottles shpr__bottles--${list.length}`}>
        {list.map((b) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={b.slug} src={b.bottle} alt="" style={{ aspectRatio: `${b.ratio}` }} />
        ))}
      </div>
      {callouts.slice(0, 4).map((c, i) => (
        <div key={c.text} className={`shpr__co shpr__co--${pos[i]}`} style={{ animationDelay: `${0.6 + i * 0.75}s` }}>
          <span><Icon name={c.icon} size={22} /></span>{c.text}
        </div>
      ))}
    </div>
  );
}

function StepsShot({ steps }: { steps: { icon: string; title: string }[] }) {
  return (
    <div className="sh sh--steps">
      <p className="shst__k">Nasıl kullanılır?</p>
      <div className="shst">
        {steps.map((s, i) => (
          <div key={s.title} className={`shst__i shst__i--${s.icon}`} style={{ animationDelay: `${0.2 + i * 0.85}s` }}>
            <span className="shst__ic" style={{ animationDelay: `${0.6 + i * 0.85}s` }}><Icon name={s.icon} size={34} /></span>
            <b>{s.title}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function EndShot({ slug, prices, here, story, onReplay }: { slug: string; prices: Prices; here?: string; story?: boolean; onReplay: () => void }) {
  const p = bySlug(slug)!;
  const pr = prices[slug] ?? p.fallback;
  const list = p.line === "set" ? SET_BOTTLES : [p];
  return (
    <div className="sh sh--end" style={{ ["--line" as string]: LINE_COLOR[p.line].main }}>
      <div className={`she__bottles she__bottles--${list.length}`}>
        {list.map((b) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={b.slug} src={b.bottle} alt="" style={{ aspectRatio: `${b.ratio}` }} />
        ))}
      </div>
      <div className="she__info">
        <p className="she__brand">Çiçek <em>Coşturan</em></p>
        <h3>{p.short}{p.line !== "set" ? " · 400 ml" : " · 3 x 400 ml"}</h3>
        <p className="she__price">{pr.sell > pr.now ? <s>{tl(pr.sell)}</s> : null}<b>{tl(pr.now)}</b></p>
        {story ? <p className="she__url">proverim.com.tr</p> : <><div className="she__cta">
          <a className="btn btn--pink" href={p.shop} target="_blank" rel="noopener noreferrer"><ShoppingBagOpen size={20} weight="bold" /> Satın Al</a>
          {here !== slug ? <a className="btn btn--ghost" href={`/urun/${slug}`}>İncele <ArrowRight size={18} weight="bold" /></a> : null}
        </div>
        <button className="she__again" onClick={onReplay}><ArrowCounterClockwise size={16} weight="bold" /> Tekrar izle</button></>}
      </div>
    </div>
  );
}

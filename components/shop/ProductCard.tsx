"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShoppingBagOpen, ArrowRight } from "@phosphor-icons/react";
import { LINE_COLOR, SET_BOTTLES, tl, type Product } from "@/lib/products";
import type { Price } from "@/lib/prices";
import { createMist } from "@/lib/filmCanvas";

/** Şişe(ler) + sprey sisi. Görünür olunca bir kez, üstüne gelince yeniden sıkar. */
export function SprayStage({ p, className, auto = true, big = false }: { p: Product; className?: string; auto?: boolean; big?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const fire = useRef<() => void>(() => {});
  const reduce = useReducedMotion();
  const list = p.line === "set" ? SET_BOTTLES : [p];

  useEffect(() => {
    if (reduce) return;
    const el = box.current!, c = cvs.current!;
    const mist = createMist(c, LINE_COLOR[p.line].mist);
    let raf = 0, until = 0, last = 0, ready = false, alive = 0;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const br = el.getBoundingClientRect();
      if (now < until) list.forEach((b, i) => {
        const im = imgs.current[i];
        if (!im || now < until - 1300 + i * 180) return;
        const r = im.getBoundingClientRect();
        mist.emit(r.left - br.left + b.nozzle[0] * r.width, r.top - br.top + b.nozzle[1] * r.height, Math.PI - 0.1 + Math.sin(now / 300 + i) * 0.07, dt, big ? 0.9 : 0.55);
      });
      mist.step(dt);
      if (now < until + 1800) raf = requestAnimationFrame(frame);
      else alive = 0;
    };
    fire.current = () => {
      if (!ready) { mist.resize(); ready = true; }
      until = performance.now() + 1300;
      if (!alive) { alive = 1; last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    const io = new IntersectionObserver(([e]) => { if (e.intersectionRatio > 0.6 && auto) { fire.current(); io.disconnect(); } }, { threshold: [0, 0.6] });
    io.observe(el);
    const ro = new ResizeObserver(() => { if (ready) mist.resize(); });
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [p, auto, big, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={box} className={`spray ${className ?? ""}`} onPointerEnter={() => fire.current()} onClick={() => fire.current()} style={{ ["--line" as string]: LINE_COLOR[p.line].main, ["--soft" as string]: LINE_COLOR[p.line].soft }}>
      <canvas ref={cvs} className="spray__cv" aria-hidden />
      <div className={`spray__bottles spray__bottles--${list.length}`}>
        {list.map((b, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={b.slug} ref={(el) => { imgs.current[i] = el; }} src={b.bottle} alt={i === 0 ? `Çiçek Coşturan ${p.short} şişesi` : ""} width={Math.round(b.ratio * 1000)} height={1000} style={{ aspectRatio: `${b.ratio}` }} />
        ))}
      </div>
    </div>
  );
}

export default function ProductCard({ p, price, i, feature }: { p: Product; price: Price; i: number; feature?: boolean }) {
  const reduce = useReducedMotion();
  const off = price.sell > price.now ? Math.round((1 - price.now / price.sell) * 100) : 0;
  return (
    <motion.article
      className={`pc pc--${p.line}${feature ? " pc--feature" : ""}`}
      style={{ ["--line" as string]: LINE_COLOR[p.line].main, ["--soft" as string]: LINE_COLOR[p.line].soft, ["--deep" as string]: LINE_COLOR[p.line].deep }}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <a href={`/urun/${p.slug}`} className="pc__media" aria-label={`${p.short} ürün sayfası`}>
        <SprayStage p={p} />
        {off ? <span className="pc__off">%{off} indirim</span> : null}
      </a>
      <div className="pc__body">
        <h3><a href={`/urun/${p.slug}`}>{p.short}</a></h3>
        <p className="pc__tag">{p.tagline}</p>
        <div className="pc__row">
          <p className="pc__price">{off ? <s>{tl(price.sell)}</s> : null}<b>{tl(price.now)}</b></p>
          <div className="pc__act">
            <a className="pc__more" href={`/urun/${p.slug}`}>İncele <ArrowRight size={16} weight="bold" /></a>
            <a className="btn btn--pink btn--sm" href={p.shop} target="_blank" rel="noopener noreferrer"><ShoppingBagOpen size={18} weight="bold" /> Satın Al</a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShoppingBagOpen, WhatsappLogo } from "@phosphor-icons/react";
import Icon from "../Icon";
import { SprayStage } from "./ProductCard";
import { LINE_COLOR, tl, type Product } from "@/lib/products";
import type { Price } from "@/lib/prices";
import { wa } from "@/lib/content";

/* Ürün sayfası girişi: sprey sahnesi + galeri | ad, fiyat, faydalar, Satın Al. Aşağı inince sabit satın alma çubuğu. */
export default function ProductIntro({ p, price }: { p: Product; price: Price }) {
  const [view, setView] = useState(0);
  const [bar, setBar] = useState(false);
  const cta = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const off = price.sell > price.now ? Math.round((1 - price.now / price.sell) * 100) : 0;
  const c = LINE_COLOR[p.line];

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    if (cta.current) io.observe(cta.current);
    return () => io.disconnect();
  }, []);

  const m = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.75, delay: d, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <section className="pi" style={{ ["--line" as string]: c.main, ["--soft" as string]: c.soft, ["--deep" as string]: c.deep }}>
      <div className="wrap pi__grid">
        <div className="pi__media">
          <div className="pi__main">
            {view === 0 ? <SprayStage p={p} big className="pi__spray" /> : (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img key={view} src={p.gallery[view - 1]} alt={`${p.short} uygulama görseli`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} />
            )}
          </div>
          <div className="pi__thumbs">
            <button className={view === 0 ? "is-on" : ""} onClick={() => setView(0)} aria-label="Şişe">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.bottle} alt="" className="pi__tb" />
            </button>
            {p.gallery.map((g, i) => (
              <button key={g} className={view === i + 1 ? "is-on" : ""} onClick={() => setView(i + 1)} aria-label={`Görsel ${i + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
        <div className="pi__info">
          <motion.nav className="pi__crumb" aria-label="Konum" {...m(0)}><a href="/">Çiçek Coşturan</a><span>/</span><a href="/#urunler">Ürünler</a><span>/</span>{p.short}</motion.nav>
          <motion.h1 {...m(0.06)}>{p.full}</motion.h1>
          <motion.p className="pi__tag" {...m(0.12)}>{p.tagline}</motion.p>
          <motion.div className="pi__price" {...m(0.18)}>
            {off ? <s>{tl(price.sell)}</s> : null}<b>{tl(price.now)}</b>{off ? <span>%{off} indirim</span> : null}
          </motion.div>
          <motion.ul className="pi__feats" {...m(0.24)}>
            {p.features.map((f) => <li key={f.text}><span><Icon name={f.icon} size={20} /></span>{f.text}</li>)}
          </motion.ul>
          <motion.div className="pi__cta" ref={cta} {...m(0.3)}>
            <a className="btn btn--pink btn--lg" href={p.shop} target="_blank" rel="noopener noreferrer"><ShoppingBagOpen size={22} weight="bold" /> Satın Al</a>
            <a className="btn btn--ghost btn--lg" href={wa(`Merhaba, Çiçek Coşturan ${p.short} hakkında bilgi almak istiyorum.`)} target="_blank" rel="noopener noreferrer"><WhatsappLogo size={20} weight="fill" /> Bitkimi Sor</a>
          </motion.div>
          <p className="pi__note">Ödeme ve teslimat proverim.com.tr mağazasında güvenle tamamlanır.</p>
        </div>
      </div>
      <div className={`buybar${bar ? " is-on" : ""}`} aria-hidden={!bar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.bottle} alt="" />
        <div className="buybar__t"><b>{p.short}</b><span>{off ? <s>{tl(price.sell)}</s> : null}{tl(price.now)}</span></div>
        <a className="btn btn--pink btn--sm" href={p.shop} target="_blank" rel="noopener noreferrer" tabIndex={bar ? 0 : -1}><ShoppingBagOpen size={18} weight="bold" /> Satın Al</a>
      </div>
    </section>
  );
}

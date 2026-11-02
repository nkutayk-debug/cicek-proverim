"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShoppingBagOpen, WhatsappLogo } from "@phosphor-icons/react";
import HeroBloom from "./HeroBloom";
import OrchidBloom from "./OrchidBloom";
import KaktusBloom from "./KaktusBloom";
import { SHOP_URL, WA_DEFAULT } from "@/lib/content";

const up = (d: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: d, ease: [0.16, 1, 0.3, 1] as const },
});

type HeroProps = { scene?: "cicek" | "orkide" | "kaktus"; eyebrow?: string; badge?: string; sub?: string; sr?: string; shop?: string; ask?: string };

export default function Hero({
  scene = "cicek",
  eyebrow = "Proverim · Çiçekli bitkiler için",
  badge,
  sub = "Saksı ve balkon çiçeklerinde kök çevresini, yaprak canlılığını ve tomurcuklanmayı destekleyen 400 ml sprey bitki besini.",
  sr = ": Çiçekli Bitkiler İçin Bitki Besini Sprey",
  shop = SHOP_URL,
  ask = WA_DEFAULT,
}: HeroProps) {
  const reduce = useReducedMotion();
  const [tried, setTried] = useState(false);
  const onFirst = useCallback(() => setTried(true), []);
  const m = (d: number) => (reduce ? {} : up(d));

  return (
    <section className="hero" id="ust">
      <div className="hero__glow" aria-hidden />
      <div className="hero__copy">
        <motion.p className="hero__eyebrow" {...m(0.05)}>{eyebrow}</motion.p>
        <motion.h1 className="hero__title" {...m(0.12)}>
          <span className="hero__cicek">Çiçek</span>
          <span className="hero__costuran">Coşturan</span>
          {badge ? <span className="hero__badge">{badge}</span> : null}
          <span className="sr-only">{sr}</span>
        </motion.h1>
        <motion.p className="hero__sub" {...m(0.24)}>
          {sub}
        </motion.p>
        <motion.div className="hero__cta" {...m(0.34)}>
          <a className="btn btn--pink" href={shop} target="_blank" rel="noopener noreferrer">
            <ShoppingBagOpen size={20} weight="bold" /> Satın Al
          </a>
          <a className="btn btn--ghost" href={ask} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={20} weight="fill" /> Bitkimi Sor
          </a>
        </motion.div>
      </div>
      <div className="hero__art">
        {scene === "orkide" ? <OrchidBloom onFirstSpray={onFirst} /> : scene === "kaktus" ? <KaktusBloom onFirstSpray={onFirst} /> : <HeroBloom onFirstSpray={onFirst} />}
        <motion.p
          className={`hero__hint${tried ? " is-gone" : ""}`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: tried ? 0 : 1 }}
          transition={{ duration: 0.6, delay: tried ? 0 : 3.4 }}
          aria-hidden
        >
          saksıya dokun, bir fıs daha
          <svg viewBox="0 0 120 60" className="hero__hintArrow"><path d="M4 8 C 40 4, 78 18, 104 46 M 104 46 l -16 -2 M 104 46 l -2 -15" /></svg>
        </motion.p>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import Icon from "./Icon";
import CareCalendar from "./CareCalendar";
import { STEPS, URUN_BITKILER } from "@/lib/content";

/* Kullanım: ürün sayfasındaki talimat dört hareketli adım + 15 günlük takvim. */
type Step = { icon: string; title: string; text: string };
export default function Usage({ steps = STEPS as unknown as Step[], plants = URUN_BITKILER, title = "15 günde bir, dört hareket", lead = "Ürün sayfasındaki kullanım talimatı, sırasıyla.", plantsTitle = "Hangi bitkilerde kullanılır?", product = "Çiçek Coşturan" }: { steps?: Step[]; plants?: string[]; title?: string; lead?: string; plantsTitle?: string; product?: string }) {
  const reduce = useReducedMotion();
  return (
    <section id="kullanim" className="sec use">
      <div className="wrap">
        <div className="head">
          <h2>{title}</h2>
          <p>{lead}</p>
        </div>
        <ol className={`use__rail use__rail--${steps.length}`}>
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              className={`use__step use__step--${s.icon}`}
              initial={reduce ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="use__node"><Icon name={s.icon} size={30} /></span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </motion.li>
          ))}
        </ol>
        <CareCalendar product={product} />
        <div className="use__where">
          <h3>{plantsTitle}</h3>
          <ul>{plants.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sun, Drop, Thermometer, CalendarBlank, WhatsappLogo } from "@phosphor-icons/react";
import Specimen from "./Specimen";
import Refs from "./Refs";
import { PLANTS, wa } from "@/lib/content";
import type { FlowerKind } from "@/lib/flora";

type GPlant = { id: string; name: string; latin: string; img?: string; flower: string; light: string; water: string; temp: string; season: string; why: string; tip: string; refs: number[] };

/* Bitki rehberi: çizilmiş çiçek sekmeleri → türün bakım kartı + gerçek ürün görseli (yoksa büyük çizim). */
export default function Guide({ plants = PLANTS as GPlant[], title = "Bitkine göre bakım", lead = "Her çiçeğin ışığı, suyu ve açmama sebebi farklı. Bitkini seç.", product = "Çiçek Coşturan", hrefs = {} }: { plants?: GPlant[]; title?: string; lead?: string; product?: string; hrefs?: Record<string, string> }) {
  const [id, setId] = useState(plants[0].id);
  const reduce = useReducedMotion();
  const p = plants.find((x) => x.id === id)!;
  const facts = [
    { I: Sun, k: "Işık", v: p.light },
    { I: Drop, k: "Su", v: p.water },
    { I: Thermometer, k: "Sıcaklık", v: p.temp },
    { I: CalendarBlank, k: "Çiçek dönemi", v: p.season },
  ];
  return (
    <section id="rehber" className="sec guide">
      <div className="wrap">
        <div className="head">
          <h2>{title}</h2>
          <p>{lead}</p>
        </div>
        <div className="guide__tabs" role="tablist" aria-label="Bitki seçimi">
          {plants.map((x) => (
            <button key={x.id} role="tab" aria-selected={x.id === id} className={x.id === id ? "is-on" : ""} onClick={() => setId(x.id)}>
              <Specimen kind={x.flower as FlowerKind} size={74} />
              <span>{x.name}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            className="guide__panel"
            role="tabpanel"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {p.img ? (
              <div className="guide__img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={`${p.name} bakımı için Çiçek Coşturan`} width={1024} height={1536} loading="lazy" />
              </div>
            ) : (
              <div className="guide__img guide__img--drawn">
                <Specimen kind={p.flower as FlowerKind} size={340} label={`${p.name} çizimi`} />
              </div>
            )}
            <div className="guide__body">
              <h3>{p.name}</h3>
              <p className="guide__latin">{p.latin}</p>
              <dl className="guide__facts">
                {facts.map(({ I, k, v }) => (
                  <div key={k}>
                    <dt><I size={18} weight="duotone" /> {k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <h4>Neden açmıyor olabilir?</h4>
              <p>{p.why}<Refs ns={p.refs} /></p>
              <h4>Çiçek Coşturan ile</h4>
              <p>{p.tip}</p>
              <div className="guide__cta">
              {hrefs[p.id] ? <a className="btn btn--pink" href={hrefs[p.id]}>{p.name} rehberinin tamamı</a> : null}
              <a className="btn btn--ghost" href={wa(`Merhaba, ${p.name.toLocaleLowerCase("tr-TR")} bakımı ve ${product} kullanımı hakkında sormak istiyorum.`)} target="_blank" rel="noopener noreferrer">
                <WhatsappLogo size={20} weight="fill" /> Bitkimi Sor
              </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

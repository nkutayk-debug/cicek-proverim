"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import Specimen from "./Specimen";
import { STUDIES, SOURCES, type Study } from "@/lib/content";

/* Araştırmalar: her çalışma bir herbaryum yaprağı. Çizilmiş örnek + bulgu + kaynak. */
export default function Herbarium({ studies = STUDIES, title = "Saksıda denendi", lead = "Faydalı kök bakterilerinin çiçekli bitkilerde neler yapabildiğini gösteren hakemli çalışmalardan seçtiklerimiz. Bu denemeler farklı bakteri suşlarıyla yapıldı; Çiçek Coşturan'ın kendisiyle yapılmış çalışmalar değildir." }: { studies?: Study[]; title?: string; lead?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const go = (dir: number) => {
    const t = track.current!;
    const card = t.querySelector(".hb-sheet") as HTMLElement;
    t.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <section id="arastirma" className="sec herb">
      <div className="wrap herb__top">
        <div className="head head--left">
          <h2>{title}</h2>
          <p>{lead}</p>
        </div>
        <div className="herb__nav">
          <button onClick={() => go(-1)} aria-label="Önceki çalışma"><ArrowLeft size={20} weight="bold" /></button>
          <button onClick={() => go(1)} aria-label="Sonraki çalışma"><ArrowRight size={20} weight="bold" /></button>
        </div>
      </div>
      <div className="herb__track" ref={track}>
        {studies.map((s, i) => {
          const src = SOURCES.find((x) => x.n === s.ref)!;
          const authors = src.text.split("(")[0];
          const short = `${authors.split(" ")[0]}${authors.includes(",") ? " ve ark." : ""}, ${src.text.match(/\((\d{4})\)/)?.[1] ?? ""}`;
          return (
            <motion.article
              key={s.plant + s.ref}
              className="hb-sheet"
              initial={reduce ? false : { opacity: 0, y: 30, rotate: i % 2 ? 1.2 : -1.2 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 0.6 : -0.6 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="hb-sheet__plate">
                <span className="hb-tape hb-tape--a" aria-hidden />
                <span className="hb-tape hb-tape--b" aria-hidden />
                <Specimen kind={s.species} size={230} label={`${s.plant} çizimi`} />
              </div>
              <div className="hb-sheet__label">
                <p className="hb-sheet__latin">{s.latin}</p>
                <h3>{s.plant}</h3>
                <p className="hb-sheet__big">{s.big}<span>{s.bigLabel}</span></p>
                <p className="hb-sheet__find">{s.finding}</p>
                <a className="hb-sheet__src" href={src.url} target="_blank" rel="noopener noreferrer">
                  {short} <ArrowUpRight size={14} weight="bold" />
                </a>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

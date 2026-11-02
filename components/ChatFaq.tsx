"use client";

import { useEffect, useRef, useState } from "react";
import { WhatsappLogo, PaperPlaneRight } from "@phosphor-icons/react";
import { wa } from "@/lib/content";

type Msg = { from: "bot" | "me"; text: string; id: number };

/* SSS sohbet düzeninde: soruya dokun, cevap mesaj olarak gelir. Liste kendi içinde kayar. */
export default function ChatFaq({ faq, title = "Sıkça sorulanlar", product = "Çiçek Coşturan", note = "Cevaplar ürün sayfasındaki bakım rehberinden. Bitkine özel bir derdin varsa fotoğrafıyla WhatsApp'tan yaz." }: { faq: { q: string; a: string }[]; title?: string; product?: string; note?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Merhaba! Çiçeğinle ilgili merak ettiğin soruya dokun, hemen cevaplayayım.", id: 0 }]);
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState<number[]>([]);
  const log = useRef<HTMLDivElement>(null);
  const n = useRef(1);

  useEffect(() => { const l = log.current; if (l) l.scrollTo({ top: l.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);

  const ask = (i: number) => {
    if (typing) return;
    const f = faq[i];
    setAsked((a) => (a.includes(i) ? a : [...a, i]));
    setMsgs((m) => [...m, { from: "me", text: f.q, id: n.current++ }]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: f.a, id: n.current++ }]);
    }, 750 + Math.min(900, f.a.length * 4));
  };

  return (
    <section id="sss" className="sec chat">
      <div className="wrap chat__grid">
        <div className="chat__side">
          <h2>{title}</h2>
          <p>{note}</p>
          <div className="chat__qs">
            {faq.map((f, i) => (
              <button key={f.q} onClick={() => ask(i)} className={asked.includes(i) ? "is-asked" : ""}>{f.q}</button>
            ))}
          </div>
        </div>
        <div className="chat__phone" aria-live="polite">
          <div className="chat__top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <span className="chat__av"><img src="/icon.png" alt="" width={36} height={36} /></span>
            <div><b>{product}</b><small>Bitki bakım asistanı</small></div>
          </div>
          <div className="chat__log" ref={log}>
            {msgs.map((m) => <p key={m.id} className={`chat__msg chat__msg--${m.from}`}>{m.text}</p>)}
            {typing ? <p className="chat__msg chat__msg--bot chat__typing"><i /><i /><i /></p> : null}
          </div>
          <a className="chat__input" href={wa(`Merhaba, ${product} hakkında sormak istiyorum:`)} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={20} weight="fill" /><span>Kendi sorunu WhatsApp&apos;tan yaz</span><PaperPlaneRight size={18} weight="fill" />
          </a>
        </div>
      </div>
      {/* arama motorları ve ekran okuyucular için tam metin */}
      <dl className="sr-only">{faq.map((f) => <div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>)}</dl>
    </section>
  );
}

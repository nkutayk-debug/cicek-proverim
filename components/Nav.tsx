"use client";

import { useEffect, useState } from "react";
import { ShoppingBagOpen, List, X } from "@phosphor-icons/react";
import { SHOP_URL } from "@/lib/content";

const LINKS = [
  { href: "#urunler", label: "Ürünler" },
  { href: "#neden", label: "Neden açmaz?" },
  { href: "#kok", label: "Kökte ne olur?" },
  { href: "#rehber", label: "Rehber" },
  { href: "#sss", label: "SSS" },
];

const PAGES = [{ id: "cicekli", href: "/", label: "Çiçekli bitkiler", short: "Çiçekli" }, { id: "orkide", href: "/orkide", label: "Orkide", short: "Orkide" }, { id: "kaktus", href: "/kaktus-sukulent", label: "Kaktüs & Sukulent", short: "Kaktüs" }];

export default function Nav({ base = "", shop = SHOP_URL, current }: { base?: string; shop?: string; current?: "cicekli" | "orkide" | "kaktus" }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { rootMargin: "0px" });
    const s = document.getElementById("nav-sentinel");
    if (s) io.observe(s);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <div id="nav-sentinel" aria-hidden style={{ position: "absolute", top: 0, height: 80, width: 1, pointerEvents: "none" }} />
      <header className={`nav${solid ? " is-solid" : ""}${open ? " is-open" : ""}`}>
        <a href={current ? "#ust" : "/"} className="nav__brand" aria-label="Çiçek Coşturan ana sayfa">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/proverim-logo.webp" alt="Proverim" width={118} height={34} />
          <span className="nav__sep" aria-hidden />
          <span className="nav__prod">Çiçek <em>Coşturan</em></span>
        </a>
        <div className="nav__pages" role="navigation" aria-label="Bitki grubu">
          {PAGES.map((pg) => <a key={pg.id} href={pg.href} className={current === pg.id ? "is-on" : ""} aria-current={current === pg.id ? "page" : undefined}><span className="nav__pl">{pg.label}</span><span className="nav__ps">{pg.short}</span></a>)}
        </div>
        <nav className="nav__links" aria-label="Sayfa bölümleri">
          {LINKS.map((l) => <a key={l.href} href={base && l.href === "#rehber" ? "/rehber" : base && l.href === "#sss" ? "/sss" : `${base}${l.href}`} onClick={() => setOpen(false)}>{l.label}</a>)}
        </nav>
        <a className="btn btn--pink btn--sm nav__buy" href={shop} target="_blank" rel="noopener noreferrer">
          <ShoppingBagOpen size={18} weight="bold" /> Satın Al
        </a>
        <button className="nav__burger" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </header>
    </>
  );
}

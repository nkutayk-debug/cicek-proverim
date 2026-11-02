import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/products";
import { FAQ, SITE } from "@/lib/content";
import { ORCHID_FAQ } from "@/lib/orchid";
import { KAKTUS_FAQ } from "@/lib/kaktus";

const TITLE = "Sık Sorulan Sorular: Kullanım, Çiçeklenme, Orkide ve Kaktüs | Çiçek Coşturan";
const DESC = "Çiçek Coşturan kaç günde bir kullanılır, sulamanın yerine geçer mi, çiçekliyken uygulanır mı? Orkide neden sap vermez, kaktüs ne sıklıkla sulanır? Tüm cevaplar tek sayfada.";

export const metadata: Metadata = {
  title: TITLE, description: DESC,
  alternates: { canonical: `${SITE}/sss` },
  openGraph: { type: "website", url: `${SITE}/sss`, title: TITLE, description: DESC, locale: "tr_TR", siteName: "Proverim Çiçek Coşturan", images: [{ url: "/img/set-3lu.webp" }] },
};

/* Ürün soruları ürün sayfalarından BİREBİR; bakım soruları sitenin kaynaklı bakım cevapları. */
const PRODUCT_Q = new Set(["Kaç günde bir kullanılmalıdır?", "Çiçekliyken kullanılabilir mi?", "Sulama yerine geçer mi?", "Toprağa mı yaprağa mı uygulanır?"]);
const GROUPS = [
  ...PRODUCTS.map((p) => ({ id: p.slug, title: p.name, faq: p.slug === "cicekli-bitkiler" ? FAQ : p.faq, prefix: `Çiçek Coşturan ${p.short}` })),
  { id: "orkide-bakimi", title: "Orkide bakımı", faq: ORCHID_FAQ.filter((f) => !PRODUCT_Q.has(f.q)), prefix: "" },
  { id: "kaktus-bakimi", title: "Kaktüs ve sukulent bakımı", faq: KAKTUS_FAQ.filter((f) => !PRODUCT_Q.has(f.q)), prefix: "" },
];

export default function SssPage() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "FAQPage", "@id": `${SITE}/sss#page`, url: `${SITE}/sss`, name: TITLE, inLanguage: "tr-TR",
        mainEntity: GROUPS.flatMap((g) => g.faq.map((f) => ({ "@type": "Question", name: g.prefix && !f.q.includes("Proverim") ? `${g.prefix}: ${f.q}` : f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Çiçek Coşturan", item: SITE },
        { "@type": "ListItem", position: 2, name: "Sık sorulan sorular", item: `${SITE}/sss` },
      ] },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav base="/" />
      <main className="hub">
        <div className="wrap hub__narrow">
          <nav className="crumbs" aria-label="Konum"><a href="/">Çiçek Coşturan</a><span aria-hidden>/</span><span aria-current="page">Sık sorulan sorular</span></nav>
          <header className="hub__head">
            <h1>Sık sorulan sorular</h1>
            <p>Ürün soruları proverim.com.tr ürün sayfalarından, bakım soruları sitedeki kaynaklı rehberlerden. Bitkine özel bir derdin varsa fotoğrafıyla WhatsApp&apos;tan yaz.</p>
          </header>
          <nav className="sss__jump" aria-label="Bölümler">{GROUPS.map((g) => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}</nav>
          {GROUPS.map((g) => (
            <section key={g.id} id={g.id} className="sss__group">
              <h2>{g.title}</h2>
              <div className="art__faq">
                {g.faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
              </div>
            </section>
          ))}
          <p className="hub__sss">Daha ayrıntılı bilgi için <a href="/rehber">bakım rehberine</a> göz atın.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

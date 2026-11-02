import type { Metadata } from "next";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Specimen from "@/components/Specimen";
import { GUIDES, GROUPS } from "@/lib/guides";
import { SITE } from "@/lib/content";

const TITLE = "Bitki Bakım Rehberi: Çiçek, Orkide, Kaktüs ve Sukulent | Çiçek Coşturan";
const DESC = "Sardunya, petunya, begonya, Afrika menekşesi, kelebek orkide, top kaktüs, yılbaşı kaktüsü, aloe ve eşeveryaya kadar 17 bitki için kaynaklı bakım rehberi; çiçek neden açmaz, sukulent neden uzar.";

export const metadata: Metadata = {
  title: TITLE, description: DESC,
  alternates: { canonical: `${SITE}/rehber` },
  openGraph: { type: "website", url: `${SITE}/rehber`, title: TITLE, description: DESC, locale: "tr_TR", siteName: "Proverim Çiçek Coşturan", images: [{ url: "/img/set-3lu.webp" }] },
};

export default function RehberPage() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${SITE}/rehber#page`, url: `${SITE}/rehber`, name: TITLE, description: DESC, inLanguage: "tr-TR", isPartOf: { "@id": `${SITE}#site` } },
      { "@type": "ItemList", itemListElement: GUIDES.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.title, url: `${SITE}/rehber/${g.slug}` })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Çiçek Coşturan", item: SITE },
        { "@type": "ListItem", position: 2, name: "Bakım rehberi", item: `${SITE}/rehber` },
      ] },
    ],
  };
  const order = ["konu", "cicekli", "orkide", "kaktus"] as const;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav base="/" />
      <main className="hub">
        <div className="wrap">
          <nav className="crumbs" aria-label="Konum"><a href="/">Çiçek Coşturan</a><span aria-hidden>/</span><span aria-current="page">Bakım rehberi</span></nav>
          <header className="hub__head">
            <h1>Bitki bakım rehberi</h1>
            <p>Çiçek neden açmaz, orkide neden sap vermez, sukulent neden uzar? Her rehber hakemli makalelere ve üniversite yayım kaynaklarına dayanır; kaynaklar sayfanın sonunda.</p>
          </header>
          {order.map((id) => {
            const gr = GROUPS.find((x) => x.id === id)!;
            const list = GUIDES.filter((g) => g.group === id);
            return (
              <section key={id} className="hub__group" aria-labelledby={`g-${id}`}>
                <div className="hub__ghead">
                  <h2 id={`g-${id}`}>{gr.title}</h2>
                  <p>{gr.lead}</p>
                </div>
                <ul className={`hub__list${id === "konu" ? " hub__list--topic" : ""}`}>
                  {list.map((g) => (
                    <li key={g.slug}>
                      <a href={`/rehber/${g.slug}`} className="hub__card">
                        <span className="hub__art"><Specimen kind={g.kind} size={id === "konu" ? 120 : 132} /></span>
                        <span className="hub__txt">
                          <strong>{id === "konu" ? g.title : g.name}</strong>
                          {g.latin ? <em>{g.latin}</em> : null}
                          <span className="hub__go">Rehberi oku <ArrowRight size={14} weight="bold" /></span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          <p className="hub__sss">Kısa cevaplar için <a href="/sss">sık sorulan sorular</a> sayfasına bakın.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

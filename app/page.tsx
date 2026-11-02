import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/shop/ProductGrid";
import Film from "@/components/film/Film";
import ChapterPlayer, { type Chapter } from "@/components/ChapterPlayer";
import Herbarium from "@/components/Herbarium";
import Usage from "@/components/Usage";
import Guide from "@/components/Guide";
import ChatFaq from "@/components/ChatFaq";
import Sources from "@/components/Sources";
import Footer from "@/components/Footer";
import { CAUSES, ROOT_STEPS, FAQ, HOME_SOURCE_IDS, SITE, STEPS } from "@/lib/content";
import { citations, faqLd, howToLd, productListLd, productLd } from "@/lib/schema";
import { guideSlug } from "@/lib/guides";
import { PLANTS } from "@/lib/content";
import { HOME_FILM } from "@/lib/films";
import { getPrices } from "@/lib/prices";

export const revalidate = 21600;

const WHY: Chapter[] = ["isik", "azot", "su", "kirec", "stres", "saksi"].map((id) => {
  const c = CAUSES.find((x) => x.id === id)!;
  return { icon: c.icon, title: c.title, text: c.text, refs: c.refs };
});
const ROOT_ICONS = ["Drop", "Dna", "Plant", "Flower"];
const ROOTS: Chapter[] = ROOT_STEPS.map((s, i) => ({ icon: ROOT_ICONS[i], kicker: s.kicker, title: s.title, text: s.text, refs: s.refs }));

export default async function Page() {
  const prices = await getPrices();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}#page`, url: SITE, name: "Çiçek Neden Açmaz? Çiçekli Bitkiler İçin Bitki Besini | Çiçek Coşturan", inLanguage: "tr-TR", isPartOf: { "@id": `${SITE}#site` },
        primaryImageOfPage: `${SITE}/img/urun-cicekli.webp`, about: { "@id": `${SITE}/urun/cicekli-bitkiler#product` }, citation: citations(HOME_SOURCE_IDS) },
      productLd("cicekli-bitkiler", prices["cicekli-bitkiler"] ?? { sell: 399, now: 285 }),
      productListLd(),
      howToLd("Çiçek Coşturan Çiçekli Bitkiler nasıl uygulanır?", STEPS),
      faqLd(FAQ, `${SITE}#sss`),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav current="cicekli" />
      <main>
        <Hero />
        <ProductGrid prices={prices} />
        <section id="film" className="sec filmsec">
          <div className="wrap">
            <div className="head">
              <h2>Otuz saniyede Çiçek Coşturan</h2>
              <p>Durdurmak ya da bir sahneye atlamak için alttaki çubuğu kullan.</p>
            </div>
            <Film shots={HOME_FILM} prices={prices} label="Çiçek Coşturan tanıtım filmi" />
          </div>
        </section>
        <ChapterPlayer id="neden" kind="why" title="Çiçek neden açmaz?" lead="Altı sebep, aynı saksıda tek tek canlanıyor. Bir başlığa dokun, o sahneye geç." chapters={WHY} />
        <ChapterPlayer id="kok" kind="roots" title="Kökte ne olur?" lead="Toprağın altında, kökün çevresindeki birkaç milimetrede olanlar. Büyüteçle bakıyoruz." chapters={ROOTS} dur={7} />
        <Herbarium />
        <Usage />
        <Guide hrefs={Object.fromEntries(PLANTS.map((p) => [p.id, `/rehber/${guideSlug(p.id)}`]))} />
        <ChatFaq faq={FAQ} />
        <Sources ids={HOME_SOURCE_IDS} />
      </main>
      <Footer />
    </>
  );
}

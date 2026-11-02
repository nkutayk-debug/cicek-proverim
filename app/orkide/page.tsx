import type { Metadata } from "next";
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
import { ORCHID_CAUSES, ORCHID_ROOTS, ORCHID_STUDIES, ORCHID_PLANTS, ORCHID_STEPS, ORCHID_FAQ, ORCHID_PLANT_TAGS, ORCHID_SOURCE_IDS, ORCHID_SHOP } from "@/lib/orchid";
import { ORCHID_FILM } from "@/lib/films";
import { getPrices } from "@/lib/prices";
import { SITE, wa } from "@/lib/content";
import { breadcrumbLd, citations, faqLd, howToLd, productLd } from "@/lib/schema";
import { guideSlug } from "@/lib/guides";

export const revalidate = 21600;

const TITLE = "Orkide Neden Çiçek Açmaz? Orkide Bakımı ve Orkide Besini | Çiçek Coşturan";
const DESC = "Orkideniz sap vermiyor mu? Işık, sıcaklık, sulama, kabuk harç ve tuz birikiminin çiçeklenmeye etkisi; kelebek orkide, Dendrobium, Cattleya ve Oncidium bakımı. Proverim Çiçek Coşturan Orkide 400 ml sprey bitki besini.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["orkide neden çiçek açmaz", "orkide sap vermiyor", "orkide bakımı", "orkide besini", "orkide gübresi sprey", "kelebek orkide bakımı", "phalaenopsis bakımı", "orkide kökleri", "velamen", "orkide sulama", "Çiçek Coşturan orkide"],
  alternates: { canonical: `${SITE}/orkide` },
  openGraph: { type: "website", url: `${SITE}/orkide`, title: TITLE, description: DESC, locale: "tr_TR", siteName: "Proverim Çiçek Coşturan", images: [{ url: "/img/urun-orkide.webp", width: 1024, height: 1536 }] },
};

const WHY: Chapter[] = ORCHID_CAUSES.map((c) => ({ icon: c.icon, title: c.title, text: c.text, refs: c.refs }));
const LABELS = ORCHID_CAUSES.map((c) => ({ problem: c.title.toLocaleLowerCase("tr-TR"), fix: c.fix }));
const ROOTS: Chapter[] = ORCHID_ROOTS.map((r) => ({ icon: r.icon, kicker: r.kicker, title: r.title, text: r.text, refs: r.refs }));

export default async function OrkidePage() {
  const prices = await getPrices();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}/orkide#page`, url: `${SITE}/orkide`, name: TITLE, description: DESC, inLanguage: "tr-TR", isPartOf: { "@id": `${SITE}#site` }, about: { "@id": `${SITE}/urun/orkide#product` }, citation: citations(ORCHID_SOURCE_IDS) },
      productLd("orkide", prices.orkide ?? { sell: 399, now: 285 }),
      howToLd("Çiçek Coşturan Orkide nasıl uygulanır?", ORCHID_STEPS),
      faqLd(ORCHID_FAQ, `${SITE}/orkide#sss`),
      breadcrumbLd([["Çiçek Coşturan", SITE], ["Orkide", `${SITE}/orkide`]]),
    ],
  };
  return (
    <div className="theme-orkide">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav current="orkide" shop={ORCHID_SHOP} />
      <main>
        <Hero
          scene="orkide"
          eyebrow="Proverim · Orkideler için"
          badge="Orkide"
          sub="Phalaenopsis, dendrobium ve ev/ofis orkidelerinde kök çevresini, yaprak canlılığını ve çiçek sapı gelişimini destekleyen 400 ml sprey."
          sr=": Orkide Bitki Besini Sprey"
          shop={ORCHID_SHOP}
          ask={wa("Merhaba, orkidem için Çiçek Coşturan Orkide hakkında bilgi almak istiyorum.")}
        />
        <ProductGrid prices={prices} featured="orkide" lead="Orkide için mor şişe. Evdeki diğer bitkiler için de birer formül var." />
        <section id="film" className="sec filmsec">
          <div className="wrap">
            <div className="head">
              <h2>Otuz saniyede orkide</h2>
              <p>Durdurmak ya da bir sahneye atlamak için alttaki çubuğu kullan.</p>
            </div>
            <Film shots={ORCHID_FILM} prices={prices} label="Çiçek Coşturan Orkide filmi" />
          </div>
        </section>
        <ChapterPlayer id="neden" kind="whyOrchid" title="Orkide neden çiçek açmaz?" lead="Altı sebep, aynı saksıda önce sorun sonra çözüm olarak canlanıyor. Bir başlığa dokun, o sahneye geç." chapters={WHY} labels={LABELS} dur={8} />
        <ChapterPlayer id="kok" kind="rootsOrchid" title="Orkide kökünde ne olur?" lead="Kabuk harcın içinde, gümüşi köklerin yüzeyinde olanlar. Büyüteçle bakıyoruz." chapters={ROOTS} dur={7} />
        <Herbarium studies={ORCHID_STUDIES} title="Orkide üzerine çalışmalar" lead="Orkidenin ışık, sıcaklık ve kök bakterileriyle ilişkisini inceleyen hakemli çalışmalardan seçtiklerimiz. Bakteri denemeleri farklı suşlarla yapıldı; Çiçek Coşturan'ın kendisiyle yapılmış çalışmalar değildir." />
        <Usage steps={ORCHID_STEPS} plants={ORCHID_PLANT_TAGS} title="15 günde bir, üç kural" lead="Ürün sayfasındaki 15 günlük bakım rutini, sırasıyla." plantsTitle="Hangi orkideler için kullanılır?" product="Çiçek Coşturan Orkide" />
        <Guide hrefs={Object.fromEntries(ORCHID_PLANTS.map((p) => [p.id, `/rehber/${guideSlug(p.id)}`]))} plants={ORCHID_PLANTS} title="Orkidene göre bakım" lead="Kelebek orkide ile Cattleya aynı ışığı istemez. Orkideni seç." product="Çiçek Coşturan Orkide" />
        <ChatFaq faq={ORCHID_FAQ} product="Çiçek Coşturan Orkide" note="İlk üç cevap ürün sayfasından, bakım cevapları kaynakçadaki yayınlardan. Orkidene özel bir derdin varsa fotoğrafıyla WhatsApp'tan yaz." />
        <Sources ids={ORCHID_SOURCE_IDS} />
      </main>
      <Footer />
    </div>
  );
}

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
import { KAKTUS_CAUSES, KAKTUS_ROOTS, KAKTUS_STUDIES, KAKTUS_PLANTS, KAKTUS_STEPS, KAKTUS_FAQ, KAKTUS_PLANT_TAGS, KAKTUS_SOURCE_IDS, KAKTUS_SHOP } from "@/lib/kaktus";
import { KAKTUS_FILM } from "@/lib/films";
import { getPrices } from "@/lib/prices";
import { SITE, wa } from "@/lib/content";
import { breadcrumbLd, citations, faqLd, howToLd, productLd } from "@/lib/schema";
import { guideSlug } from "@/lib/guides";

export const revalidate = 21600;

const TITLE = "Kaktüs ve Sukulent Bakımı: Neden Uzar, Neden Çiçek Açmaz? | Çiçek Coşturan";
const DESC = "Sukulentiniz uzuyor, kaktüsünüz çiçek açmıyor mu? Işık, sulama, toprak, kış dinlenmesi, güneş yanığı ve yılbaşı kaktüsü bakımı; aloe, eşeverya, haworthia ve para ağacı rehberi. Proverim Çiçek Coşturan Kaktüs & Sukulent 400 ml sprey bitki besini.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["kaktüs bakımı", "sukulent bakımı", "kaktüs neden çiçek açmaz", "sukulent neden uzar", "kaktüs sulama", "kaktüs toprağı", "yılbaşı kaktüsü bakımı", "aloe vera bakımı", "eşeverya bakımı", "kaktüs besini", "sukulent besini sprey", "Çiçek Coşturan kaktüs"],
  alternates: { canonical: `${SITE}/kaktus-sukulent` },
  openGraph: { type: "website", url: `${SITE}/kaktus-sukulent`, title: TITLE, description: DESC, locale: "tr_TR", siteName: "Proverim Çiçek Coşturan", images: [{ url: "/img/urun-kaktus.webp", width: 1024, height: 1536 }] },
};

const WHY: Chapter[] = KAKTUS_CAUSES.map((c) => ({ icon: c.icon, title: c.title, text: c.text, refs: c.refs }));
const LABELS = KAKTUS_CAUSES.map((c) => ({ problem: c.title.toLocaleLowerCase("tr-TR"), fix: c.fix }));
const ROOTS: Chapter[] = KAKTUS_ROOTS.map((r) => ({ icon: r.icon, kicker: r.kicker, title: r.title, text: r.text, refs: r.refs }));

export default async function KaktusPage() {
  const prices = await getPrices();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}/kaktus-sukulent#page`, url: `${SITE}/kaktus-sukulent`, name: TITLE, description: DESC, inLanguage: "tr-TR", isPartOf: { "@id": `${SITE}#site` }, about: { "@id": `${SITE}/urun/kaktus-sukulent#product` }, citation: citations(KAKTUS_SOURCE_IDS) },
      productLd("kaktus-sukulent", prices["kaktus-sukulent"] ?? { sell: 399, now: 285 }),
      howToLd("Çiçek Coşturan Kaktüs & Sukulent nasıl uygulanır?", KAKTUS_STEPS),
      faqLd(KAKTUS_FAQ, `${SITE}/kaktus-sukulent#sss`),
      breadcrumbLd([["Çiçek Coşturan", SITE], ["Kaktüs & Sukulent", `${SITE}/kaktus-sukulent`]]),
    ],
  };
  return (
    <div className="theme-kaktus">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav current="kaktus" shop={KAKTUS_SHOP} />
      <main>
        <Hero
          scene="kaktus"
          eyebrow="Proverim · Kaktüs ve sukulentler için"
          badge="Kaktüs & Sukulent"
          sub="Aloe, echeveria, haworthia, kaktüs ve sukulent koleksiyonları için pratik destek. Kök bölgesi canlılığını, dengeli gelişimi ve doğal formu destekleyen 400 ml sprey."
          sr=": Kaktüs & Sukulent Bitki Besini Sprey"
          shop={KAKTUS_SHOP}
          ask={wa("Merhaba, kaktüs/sukulentim için Çiçek Coşturan Kaktüs & Sukulent hakkında bilgi almak istiyorum.")}
        />
        <ProductGrid prices={prices} featured="kaktus-sukulent" lead="Kaktüs ve sukulentler için yeşil şişe. Evdeki diğer bitkiler için de birer formül var." />
        <section id="film" className="sec filmsec">
          <div className="wrap">
            <div className="head">
              <h2>Otuz saniyede kaktüs ve sukulent</h2>
              <p>Durdurmak ya da bir sahneye atlamak için alttaki çubuğu kullan.</p>
            </div>
            <Film shots={KAKTUS_FILM} prices={prices} label="Çiçek Coşturan Kaktüs & Sukulent filmi" />
          </div>
        </section>
        <ChapterPlayer id="neden" kind="whyKaktus" title="Sukulent neden uzar, kaktüs neden açmaz?" lead="Altı sebep, aynı saksıda önce sorun sonra çözüm olarak canlanıyor. Bir başlığa dokun, o sahneye geç." chapters={WHY} labels={LABELS} dur={8} />
        <ChapterPlayer id="kok" kind="rootsKaktus" title="Kaktüs kökünde ne olur?" lead="Çakıllı harcın içinde, kökle taşın buluştuğu yerde olanlar. Büyüteçle bakıyoruz." chapters={ROOTS} dur={7} />
        <Herbarium studies={KAKTUS_STUDIES} title="Kaktüs ve sukulent üzerine çalışmalar" lead="Kaktüs köklerindeki bakterileri, yağmur köklerini ve aloe yetiştiriciliğini inceleyen hakemli çalışmalardan seçtiklerimiz. Bakteri denemeleri farklı suşlarla yapıldı; Çiçek Coşturan'ın kendisiyle yapılmış çalışmalar değildir." />
        <Usage steps={KAKTUS_STEPS} plants={KAKTUS_PLANT_TAGS} title="15 günde bir, iki kural" lead="Ürün sayfasındaki 15 günlük bakım ritüeli, sırasıyla." plantsTitle="Hangi bitkiler için uygundur?" product="Çiçek Coşturan Kaktüs & Sukulent" />
        <Guide hrefs={Object.fromEntries(KAKTUS_PLANTS.map((p) => [p.id, `/rehber/${guideSlug(p.id)}`]))} plants={KAKTUS_PLANTS} title="Bitkine göre bakım" lead="Yılbaşı kaktüsü ile top kaktüs aynı ışığı, aynı kışı istemez. Bitkini seç." product="Çiçek Coşturan Kaktüs & Sukulent" />
        <ChatFaq faq={KAKTUS_FAQ} product="Çiçek Coşturan Kaktüs & Sukulent" note="İlk üç cevap ürün sayfasından, bakım cevapları kaynakçadaki yayınlardan. Bitkine özel bir derdin varsa fotoğrafıyla WhatsApp'tan yaz." />
        <Sources ids={KAKTUS_SOURCE_IDS} />
      </main>
      <Footer />
    </div>
  );
}

/* Yapay zekâ görünürlüğü (GEO): llms.txt (özet dizin) ve llms-full.txt (tam metin) üretimi.
   İçerik sitedeki veriden türetilir: ürün metinleri birebir, rehberler kaynaklı. */
import { SITE, SOURCES, PHONE } from "./content";
import { PRODUCTS, tl } from "./products";
import { GUIDES, GROUPS } from "./guides";
import type { Prices } from "./prices";

const priceLine = (slug: string, prices: Prices) => {
  const p = PRODUCTS.find((x) => x.slug === slug)!, pr = prices[slug] ?? p.fallback;
  return pr.sell > pr.now ? `${tl(pr.now)} (liste fiyatı ${tl(pr.sell)})` : tl(pr.now);
};

export function llmsTxt(prices: Prices) {
  const L: string[] = [];
  L.push("# Çiçek Coşturan (Proverim)");
  L.push("");
  L.push("> Çiçek Coşturan, Proverim'in ev, balkon ve ofis bitkileri için 400 ml sprey bitki besini serisidir: Çiçekli Bitkiler, Orkide ve Kaktüs & Sukulent formülleri ile 3'lü set. Ürünler 15 günde bir bitki yüzeyine ve toprak yüzeyine püskürtülür; sulamanın yerine geçmez. Bu site ürünleri ve kaynaklı bitki bakım rehberlerini (çiçek neden açmaz, orkide neden sap vermez, sukulent neden uzar) bir araya getirir.");
  L.push("");
  L.push(`Satın alma: ürünler resmî mağaza proverim.com.tr üzerinden satılır. İletişim: WhatsApp ${PHONE}. Site: ${SITE}`);
  L.push("Bilimsel bilgiler hakemli makalelere ve üniversite yayım (extension) kaynaklarına dayanır. Sitedeki bakteri çalışmaları farklı suşlarla yapılmıştır; Çiçek Coşturan'ın kendisiyle yapılmış çalışmalar değildir. Ürün bir zirai ilaç değildir, hastalık tedavisi için kullanılmaz ve çiçeklenmeyi garanti etmez.");
  L.push("");
  L.push("## Ürünler");
  for (const p of PRODUCTS) L.push(`- [${p.full.replace("®", "")}](${SITE}/urun/${p.slug}): ${p.tagline} Güncel fiyat: ${priceLine(p.slug, prices)}. Satın al: ${p.shop}`);
  L.push("");
  L.push("## Bitki grubu sayfaları");
  L.push(`- [Çiçekli bitkiler](${SITE}/): Çiçek neden açmaz; sardunya, petunya, begonya, Afrika menekşesi, saksı gülü, antoryum, barış çiçeği.`);
  L.push(`- [Orkide](${SITE}/orkide): Orkide neden çiçek açmaz, sap vermez; kelebek orkide, Dendrobium, Cattleya, Oncidium.`);
  L.push(`- [Kaktüs ve sukulent](${SITE}/kaktus-sukulent): Sukulent neden uzar, kaktüs neden açmaz; top kaktüs, yılbaşı kaktüsü, aloe, eşeverya, haworthia, para ağacı.`);
  L.push("");
  for (const id of ["konu", "cicekli", "orkide", "kaktus"] as const) {
    const g = GROUPS.find((x) => x.id === id)!;
    L.push(`## Bakım rehberi: ${g.title}`);
    for (const d of GUIDES.filter((x) => x.group === id)) L.push(`- [${d.title}](${SITE}/rehber/${d.slug}): ${d.desc}`);
    L.push("");
  }
  L.push("## Sık sorulanlar");
  L.push(`- [Sık sorulan sorular](${SITE}/sss): Kullanım sıklığı, sulama, çiçekliyken uygulama, orkide ve kaktüs bakımı.`);
  L.push("");
  L.push("## Optional");
  L.push(`- [Tam metin](${SITE}/llms-full.txt): Ürün açıklamaları ve tüm rehberlerin kaynaklı tam metni.`);
  L.push(`- [Site haritası](${SITE}/sitemap.xml)`);
  return L.join("\n") + "\n";
}

export function llmsFull(prices: Prices) {
  const L: string[] = [llmsTxt(prices), "", "---", "", "# Ürün ayrıntıları (proverim.com.tr ürün sayfalarından birebir)", ""];
  for (const p of PRODUCTS) {
    L.push(`## ${p.full.replace("®", "")}`, "", `URL: ${SITE}/urun/${p.slug} · Mağaza: ${p.shop} · Fiyat: ${priceLine(p.slug, prices)}`, "");
    L.push(...p.intro, "");
    L.push("Öne çıkanlar: " + p.features.map((f) => f.text).join(" · "), "");
    L.push(`### ${p.givesTitle}`, ...p.gives.map((x) => `- ${x}`), "");
    L.push(`### ${p.usageTitle}`, p.usage, "");
    L.push(`### ${p.plantsTitle}`, p.plants.join(", "), "");
    L.push("### Sık sorulanlar", ...p.faq.flatMap((f) => [`**${f.q}** ${f.a}`]), "");
  }
  L.push("---", "", "# Bakım rehberleri", "");
  for (const d of GUIDES) {
    L.push(`## ${d.title}`, "", `URL: ${SITE}/rehber/${d.slug}`, "", d.lead, "");
    if (d.facts) L.push(...d.facts.map((f) => `- ${f.k}: ${f.v}`), "");
    for (const s of d.sections) L.push(`### ${s.h}`, s.p + (s.refs?.length ? ` [${s.refs.join(", ")}]` : ""), "");
    if (d.studies) { L.push("### Çalışmalar ne diyor?"); for (const s of d.studies) L.push(`- ${s.plant} (${s.latin}): ${s.finding} [${s.ref}]`); L.push(""); }
    L.push("### Sık sorulanlar", ...d.faq.map((f) => `**${f.q}** ${f.a}`), "");
  }
  L.push("---", "", "# Kaynakça", "");
  for (const s of SOURCES) L.push(`[${s.n}] ${s.text} ${s.url}`);
  return L.join("\n") + "\n";
}

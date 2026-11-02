/* Bakım rehberi makaleleri (/rehber/[slug]). Metinler sitedeki kaynaklı içerikten derlenir:
   bitki kartları (content.ts PLANTS, orchid.ts, kaktus.ts), sebepler, kök bölümleri, çalışmalar ve SSS.
   Ürün cümleleri ürün sayfalarından birebir (products.ts). Yeni bilimsel iddia eklenmez. */
import { CAUSES, FAQ, PLANTS, ROOT_STEPS, STUDIES, type Study } from "./content";
import { ORCHID_CAUSES, ORCHID_FAQ, ORCHID_PLANTS, ORCHID_ROOTS, ORCHID_STUDIES } from "./orchid";
import { KAKTUS_CAUSES, KAKTUS_FAQ, KAKTUS_PLANTS, KAKTUS_ROOTS, KAKTUS_STUDIES } from "./kaktus";
import type { FlowerKind } from "./flora";

export type Group = "cicekli" | "orkide" | "kaktus" | "konu";
export const GROUPS: { id: Group; title: string; lead: string; page: string; product: string }[] = [
  { id: "cicekli", title: "Çiçekli bitkiler", lead: "Saksı, balkon ve salon çiçekleri: ışık, su, sıcaklık ve çiçek açmama sebepleri.", page: "/", product: "cicekli-bitkiler" },
  { id: "orkide", title: "Orkideler", lead: "Kelebek orkide, Dendrobium, Cattleya ve Oncidium: sap, kök ve kabuk harç.", page: "/orkide", product: "orkide" },
  { id: "kaktus", title: "Kaktüs ve sukulentler", lead: "Top kaktüs, yılbaşı kaktüsü, aloe, eşeverya, haworthia ve para ağacı.", page: "/kaktus-sukulent", product: "kaktus-sukulent" },
  { id: "konu", title: "Konu rehberleri", lead: "Çiçek neden açmaz, kökte ne olur ve bilimsel çalışmalar ne diyor.", page: "/rehber", product: "3lu-set" },
];

export type Section = { h: string; p: string; refs?: number[]; id?: string };
export type GuideDoc = {
  slug: string; group: Group; kind: FlowerKind; img?: string;
  title: string; metaTitle: string; desc: string; lead: string; name: string; latin?: string;
  facts?: { k: "Işık" | "Su" | "Sıcaklık" | "Çiçek dönemi"; v: string }[];
  sections: Section[]; studies?: Study[];
  faq: { q: string; a: string }[]; refs: number[]; product: string; related: string[];
};

const lower = (s: string) => s.toLocaleLowerCase("tr-TR");
const tc = (s: string) => s.split(" ").map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1)).join(" ");
const uniq = (a: number[]) => [...new Set(a)].sort((x, y) => x - y);
type AnyPlant = { id: string; name: string; latin: string; img?: string; flower: string; light: string; water: string; temp: string; season: string; why: string; tip: string; refs: number[] };

const SLUGS: Record<string, string> = {
  sardunya: "sardunya-bakimi", petunya: "petunya-bakimi", begonya: "begonya-bakimi", menekse: "afrika-menekse-bakimi", gul: "saksi-gulu-bakimi", antoryum: "antoryum-bakimi", baris: "baris-cicegi-bakimi",
  kelebek: "kelebek-orkide-bakimi", dendrobium: "dendrobium-bakimi", cattleya: "cattleya-bakimi", oncidium: "oncidium-bakimi",
  top: "top-kaktus-bakimi", yilbasi: "yilbasi-kaktusu-bakimi", aloe: "aloe-vera-bakimi", eseverya: "eseverya-bakimi", haworthia: "zebra-haworthia-bakimi", para: "para-agaci-bakimi",
};
export const guideSlug = (plantId: string) => SLUGS[plantId];
const NO_BLOOM = new Set(["aloe", "eseverya", "haworthia"]);

const PRODUCT_OF: Record<Exclude<Group, "konu">, string> = { cicekli: "cicekli-bitkiler", orkide: "orkide", kaktus: "kaktus-sukulent" };
const TOPIC_OF: Record<Exclude<Group, "konu">, string> = { cicekli: "cicek-neden-acmaz", orkide: "orkide-neden-cicek-acmaz", kaktus: "sukulent-neden-uzar-kaktus-neden-acmaz" };

function plantGuide(p: AnyPlant, group: Exclude<Group, "konu">, all: AnyPlant[]): GuideDoc {
  const bloom = !NO_BLOOM.has(p.id);
  const n = p.name, nm = p.latin.startsWith(p.name) ? p.latin : `${p.name} (${p.latin})`;
  const title = bloom ? `${n} bakımı: neden çiçek açmaz, nasıl coşar?` : `${n} bakımı: neden uzar, nasıl diri kalır?`;
  return {
    slug: SLUGS[p.id], group, kind: p.flower as FlowerKind, img: p.img, name: n, latin: p.latin,
    title,
    metaTitle: `${tc(n)} Bakımı ve ${bloom ? "Çiçeklenme" : "Form"} Rehberi | Çiçek Coşturan`,
    desc: `${nm} bakımı: ${lower(p.light)}; sulama, sıcaklık, ${bloom ? "çiçek dönemi ve neden çiçek açmadığı" : "uzama ve solma sebepleri"}. Kaynaklı rehber ve Çiçek Coşturan ile 15 günlük bakım.`,
    lead: `${nm} için ışık, sulama, sıcaklık ve ${bloom ? "çiçek dönemi" : "büyüme dönemi"}; ${bloom ? "neden çiçek açmadığı" : "neden formunu kaybettiği"} ve bakım rutininde dikkat edilecekler.`,
    facts: [{ k: "Işık", v: p.light }, { k: "Su", v: p.water }, { k: "Sıcaklık", v: p.temp }, { k: "Çiçek dönemi", v: p.season }],
    sections: [
      { id: "neden", h: bloom ? `${n} neden çiçek açmaz?` : `${n} neden formunu kaybeder?`, p: p.why, refs: p.refs },
      { id: "puf", h: "Püf noktası", p: p.tip },
    ],
    faq: [
      { q: bloom ? `${n} neden çiçek açmaz?` : `${n} neden uzar ya da solar?`, a: p.why },
      { q: `${n} ne kadar ışık ister?`, a: `${p.light}.` },
      { q: `${n} nasıl sulanır?`, a: `${p.water}.` },
      { q: `${n} hangi sıcaklıkta iyi gelişir?`, a: `${p.temp}.` },
      { q: bloom ? `${n} ne zaman çiçek açar?` : `${n} ne zaman büyür?`, a: `${p.season}.` },
    ],
    refs: uniq(p.refs), product: PRODUCT_OF[group],
    related: [TOPIC_OF[group], ...all.filter((x) => x.id !== p.id).map((x) => SLUGS[x.id])],
  };
}

const causeSections = (cs: { id: string; title: string; text: string; refs: number[] }[]): Section[] => cs.map((c) => ({ id: c.id, h: c.title, p: c.text, refs: c.refs }));
const rootSections = (rs: { kicker: string; title: string; text: string; refs: number[] }[]): Section[] => rs.map((r) => ({ h: `${r.kicker}: ${r.title}`, p: r.text, refs: r.refs }));
const allRefs = (secs: Section[], st: Study[] = []) => uniq([...secs.flatMap((s) => s.refs ?? []), ...st.map((s) => s.ref)]);

const topicCicekli = (() => {
  const sections = [...causeSections(CAUSES), ...rootSections(ROOT_STEPS)];
  return {
    slug: "cicek-neden-acmaz", group: "konu" as const, kind: "geranium" as FlowerKind, name: "Çiçek neden açmaz?",
    title: "Çiçek neden açmaz? Altı sebep ve kökte olanlar",
    metaTitle: "Çiçek Neden Açmaz? 6 Sebep ve Çözümü | Çiçek Coşturan",
    desc: "Saksı çiçeğiniz yaprak verip çiçek vermiyor mu? Işık, azot, fazla su, stres, kireçli su ve saksının çiçeklenmeye etkisi; kök bölgesinde neler olduğu ve hakemli çalışmalar.",
    lead: "Yaprak var, çiçek yok. Saksı ve balkon çiçeklerinde çiçeklenmeyi durduran en sık altı sebep, kök bölgesinde olanlar ve çiçekli bitkilerle yapılmış hakemli çalışmalar.",
    sections, studies: STUDIES, faq: FAQ, refs: allRefs(sections, STUDIES), product: "cicekli-bitkiler",
    related: ["kok-bakterileri-ve-bitki-gelisimi", ...PLANTS.map((p) => SLUGS[p.id])],
  } satisfies GuideDoc;
})();
const topicOrkide = (() => {
  const sections = [...causeSections(ORCHID_CAUSES), ...rootSections(ORCHID_ROOTS)];
  return {
    slug: "orkide-neden-cicek-acmaz", group: "konu" as const, kind: "orchid" as FlowerKind, name: "Orkide neden çiçek açmaz?",
    title: "Orkide neden çiçek açmaz, sapı neden gelmez?",
    metaTitle: "Orkide Neden Çiçek Açmaz? Sap Vermiyorsa 6 Sebep | Çiçek Coşturan",
    desc: "Orkideniz sap vermiyor mu? Işık, sürekli sıcak ortam, sulama, eskiyen kabuk harç, tuz birikimi ve sap kesimi; velamen kökler ve orkide kök bakterileri üzerine hakemli çalışmalar.",
    lead: "Çiçeği bitti, sapı gelmiyor. Kelebek orkide başta olmak üzere ev orkidelerinde sap ve çiçeklenmeyi durduran altı sebep, velamen köklerde olanlar ve hakemli çalışmalar.",
    sections, studies: ORCHID_STUDIES, faq: ORCHID_FAQ, refs: allRefs(sections, ORCHID_STUDIES), product: "orkide",
    related: ["kok-bakterileri-ve-bitki-gelisimi", ...ORCHID_PLANTS.map((p) => SLUGS[p.id])],
  } satisfies GuideDoc;
})();
const topicKaktus = (() => {
  const sections = [...causeSections(KAKTUS_CAUSES), ...rootSections(KAKTUS_ROOTS)];
  return {
    slug: "sukulent-neden-uzar-kaktus-neden-acmaz", group: "konu" as const, kind: "mammillaria" as FlowerKind, name: "Sukulent neden uzar, kaktüs neden açmaz?",
    title: "Sukulent neden uzar, kaktüs neden çiçek açmaz?",
    metaTitle: "Sukulent Neden Uzar, Kaktüs Neden Çiçek Açmaz? | Çiçek Coşturan",
    desc: "Işık eksikliği, fazla su, su tutan toprak, kış dinlenmesi, güneş yanığı ve yılbaşı kaktüsü; yağmur kökleri ve kaktüs kök bakterileri üzerine hakemli çalışmalar.",
    lead: "Uzadı, soldu, formu bozuldu. Kaktüs ve sukulentlerde formu bozan ve çiçeklenmeyi durduran altı sebep, çakıllı harçta köklerin yaptıkları ve hakemli çalışmalar.",
    sections, studies: KAKTUS_STUDIES, faq: KAKTUS_FAQ, refs: allRefs(sections, KAKTUS_STUDIES), product: "kaktus-sukulent",
    related: ["kok-bakterileri-ve-bitki-gelisimi", ...KAKTUS_PLANTS.map((p) => SLUGS[p.id])],
  } satisfies GuideDoc;
})();
const topicBakteri = (() => {
  const studies = [...STUDIES, ...ORCHID_STUDIES, ...KAKTUS_STUDIES];
  const sections: Section[] = [
    ...rootSections(ROOT_STEPS.slice(0, 3)),
    ...rootSections(ORCHID_ROOTS.slice(0, 3)),
    ...rootSections(KAKTUS_ROOTS.slice(0, 3)),
  ];
  return {
    slug: "kok-bakterileri-ve-bitki-gelisimi", group: "konu" as const, kind: "petunia" as FlowerKind, name: "Kök bakterileri ve bitki gelişimi",
    title: "Kök bakterileri çiçeğe, orkideye ve kaktüse ne yapar?",
    metaTitle: "Kök Bakterileri ve Bitki Gelişimi: Çalışmalar Ne Diyor? | Çiçek Coşturan",
    desc: "Petunya, kadife çiçeği, zambak, orkide, kaktüs ve aloe ile yapılmış hakemli çalışmalarda bitki gelişimini destekleyen kök bakterileri ne yaptı? Kaynaklarıyla özet.",
    lead: "Kök salgıları, kök yüzeyine yerleşen faydalı bakteriler ve çözülen besinler. Çiçekli bitkiler, orkideler ve kaktüslerle yapılmış hakemli çalışmalardan seçtiklerimiz. Bakteri denemeleri farklı suşlarla yapıldı; Çiçek Coşturan'ın kendisiyle yapılmış çalışmalar değildir.",
    sections, studies, refs: allRefs(sections, studies), product: "3lu-set",
    faq: [
      { q: "Bu çalışmalar Çiçek Coşturan ile mi yapıldı?", a: "Hayır. Buradaki çalışmalar farklı bakteri suşlarıyla yapılmış hakemli yayınlardır; Çiçek Coşturan'ın kendisiyle yapılmış çalışmalar değildir." },
      { q: "Kök bakterileri ne yapar?", a: "Çalışmalarda bazı kök bakterileri toprakta bağlı fosforu çözdü, oksin üretti, kök yüzeyine ve iç dokusuna yerleşti; kaktüslerde kayadan mineral çözdü ve havadaki azotu bağladı. Etki suşa, bitkiye ve koşullara göre değişir." },
      { q: "Bakteri gübrenin yerini tutar mı?", a: "Çalışmalar bakterilerin besin kullanımını destekleyebildiğini gösteriyor; ışık, su, sıcaklık ve toprak gibi temel bakım koşullarının yerini tutmaz." },
    ],
    related: ["cicek-neden-acmaz", "orkide-neden-cicek-acmaz", "sukulent-neden-uzar-kaktus-neden-acmaz"],
  } satisfies GuideDoc;
})();

export const GUIDES: GuideDoc[] = [
  topicCicekli, topicOrkide, topicKaktus, topicBakteri,
  ...PLANTS.map((p) => plantGuide(p, "cicekli", PLANTS)),
  ...ORCHID_PLANTS.map((p) => plantGuide(p as AnyPlant, "orkide", ORCHID_PLANTS as AnyPlant[])),
  ...KAKTUS_PLANTS.map((p) => plantGuide(p as AnyPlant, "kaktus", KAKTUS_PLANTS as AnyPlant[])),
];
export const guideBySlug = (s: string) => GUIDES.find((g) => g.slug === s);
export const GUIDE_DATE = { published: "2026-10-03", modified: "2026-10-03" };

/* Film kurguları (sunucu-güvenli veri). Her film: kesmelerle akan kısa sahneler.
   Metinler ürün sayfalarındaki ifadelerden; bilimsel iddia içermez. */
import type { FlowerKind } from "./flora";
import { bySlug } from "./products";

export type Shot =
  | { type: "words"; lines: string[]; script?: number[]; dur: number }
  | { type: "strobe"; items: { text: string; icon: string }[]; each: number }
  | { type: "bloom"; caption: string; sub?: string; kinds: FlowerKind[]; dur: number }
  | { type: "spray"; text: string; slug: string; dur: number }
  | { type: "roots"; captions: string[]; dur: number; lens?: "orchid" | "kaktus" }
  | { type: "photos"; imgs: string[]; caption: string; dur: number }
  | { type: "product"; slug: string; callouts: { icon: string; text: string }[]; dur: number }
  | { type: "steps"; steps: { icon: string; title: string }[]; dur: number }
  | { type: "end"; slug: string };

export const shotDur = (s: Shot) => (s.type === "strobe" ? s.items.length * s.each : s.type === "end" ? Infinity : s.dur);

const PINK: FlowerKind[] = ["geranium", "petunia", "rose", "begonia", "petunia2", "violet", "lily"];

const productShot = (slug: string): Shot => ({ type: "product", slug, callouts: bySlug(slug)!.features.map((f) => ({ icon: f.icon, text: f.text.split(":")[0] })), dur: 5.4 });

export const HOME_FILM: Shot[] = [
  { type: "words", lines: ["Yaprak var.", "Çiçek yok."], script: [1], dur: 2.8 },
  { type: "strobe", items: [{ text: "Az ışık", icon: "Sun" }, { text: "Fazla su", icon: "Drop" }, { text: "Kireçli su", icon: "Flask" }, { text: "Yorgun kök", icon: "Plant" }], each: 0.78 },
  { type: "words", lines: ["Çoğu zaman", "sorun kökte."], script: [1], dur: 2.6 },
  { type: "roots", captions: ["Kök çevresi desteklenir", "Biyolojik süreç canlanır", "Kök daha çok toprağa dokunur", "Su ve besin daha dengeli kullanılır"], dur: 7 },
  { type: "spray", text: "15 günde bir fıs.", slug: "cicekli-bitkiler", dur: 3.8 },
  { type: "bloom", caption: "Tomurcuk ve çiçeklenme desteği", sub: "Daha canlı renk görünümüne katkı sağlar", kinds: PINK, dur: 5 },
  { type: "photos", imgs: ["/img/yasam-1.webp", "/img/yasam-2.webp", "/img/yasam-3.webp"], caption: "Salon, balkon, ofis.", dur: 4.4 },
  productShot("cicekli-bitkiler"),
  { type: "end", slug: "cicekli-bitkiler" },
];

export const ORCHID_FILM: Shot[] = [
  { type: "words", lines: ["Çiçeği bitti,", "sapı gelmiyor."], script: [1], dur: 2.8 },
  { type: "strobe", items: [{ text: "Az ışık", icon: "Sun" }, { text: "Hep sıcak", icon: "Thermometer" }, { text: "Fazla su", icon: "Drop" }, { text: "Eski kabuk", icon: "PottedPlant" }], each: 0.78 },
  { type: "words", lines: ["Cevap", "kökte."], script: [1], dur: 2.4 },
  { type: "roots", lens: "orchid", captions: ["Velamen suyu saniyeler içinde emer", "Kök çevresi desteklenir", "Yeni kök uçları", "Çiçek sapı gelişimine destek"], dur: 7 },
  { type: "spray", text: "15 günde bir fıs.", slug: "orkide", dur: 3.8 },
  { type: "bloom", caption: "Çiçek sapı ve çiçeklenme desteği", sub: "Yaprakların daha canlı görünmesine yardımcı olur", kinds: ["orchid", "orchidW", "catt", "dendro", "orchid", "onci", "orchidW"], dur: 5 },
  { type: "photos", imgs: ["/img/orkide-1.webp", "/img/orkide-2.webp", "/img/orkide-3.webp"], caption: "Ev ve ofis orkideleri.", dur: 4.4 },
  productShot("orkide"),
  { type: "end", slug: "orkide" },
];

export const KAKTUS_FILM: Shot[] = [
  { type: "words", lines: ["Uzadı, soldu,", "formu bozuldu."], script: [1], dur: 2.8 },
  { type: "strobe", items: [{ text: "Az ışık", icon: "Sun" }, { text: "Fazla su", icon: "Drop" }, { text: "Sıkı toprak", icon: "PottedPlant" }, { text: "Sıcak kış", icon: "Thermometer" }], each: 0.78 },
  { type: "words", lines: ["Cevap", "kökte."], script: [1], dur: 2.4 },
  { type: "roots", lens: "kaktus", captions: ["Su gelince yağmur kökleri uyanır", "Kök çevresi canlılığı desteklenir", "Dengeli gelişim", "Diri doku, doğal form"], dur: 7 },
  { type: "spray", text: "15 günde bir fıs.", slug: "kaktus-sukulent", dur: 3.8 },
  { type: "bloom", caption: "Renk canlılığı ve doğal form", sub: "Yaprak ve gövde dokusunun diri görünmesine yardımcı olur", kinds: ["mammillaria", "echeveria", "cactusflower", "aloe", "cactusflower", "haworthia", "echeveria"], dur: 5 },
  { type: "photos", imgs: ["/img/kaktus-1.webp", "/img/kaktus-2.webp", "/img/kaktus-3.webp"], caption: "Aloe, echeveria, haworthia.", dur: 4.4 },
  productShot("kaktus-sukulent"),
  { type: "end", slug: "kaktus-sukulent" },
];

export const PRODUCT_FILMS: Record<string, Shot[]> = {
  "cicekli-bitkiler": [
    { type: "words", lines: ["Çiçek açmakta", "zorlanıyorsa"], script: [1], dur: 2.6 },
    { type: "strobe", items: [{ text: "Solgun yaprak", icon: "Leaf" }, { text: "Az tomurcuk", icon: "Flower" }, { text: "Durgun gelişim", icon: "ClockCountdown" }], each: 0.8 },
    { type: "spray", text: "Kökten destek.", slug: "cicekli-bitkiler", dur: 3.8 },
    { type: "bloom", caption: "Daha diri, daha canlı", sub: "Tomurcuklanma ve çiçeklenme performansına katkı sağlayabilir", kinds: PINK, dur: 5 },
    { type: "photos", imgs: ["/img/yasam-1.webp", "/img/yasam-2.webp", "/img/yasam-3.webp"], caption: "Ev, balkon, teras, ofis.", dur: 4.4 },
    productShot("cicekli-bitkiler"),
    { type: "steps", steps: [{ icon: "ArrowsClockwise", title: "Çalkala" }, { icon: "CalendarDots", title: "15 günde bir" }, { icon: "SprayBottle", title: "Eşit püskürt" }, { icon: "SunHorizon", title: "Serin saatte" }], dur: 4.6 },
    { type: "end", slug: "cicekli-bitkiler" },
  ],
  orkide: [
    { type: "words", lines: ["Orkiden", "dinlenmede mi?"], script: [1], dur: 2.6 },
    { type: "strobe", items: [{ text: "Hassas kök", icon: "Plant" }, { text: "Solgun yaprak", icon: "Leaf" }, { text: "Çiçek sapı yok", icon: "Flower" }], each: 0.8 },
    { type: "spray", text: "Hassas köke bakım.", slug: "orkide", dur: 3.8 },
    { type: "bloom", caption: "Çiçek sapı ve çiçeklenme desteği", sub: "Yaprakların daha canlı görünmesine yardımcı olur", kinds: ["orchid", "orchidW", "orchid", "orchidW"], dur: 5 },
    { type: "photos", imgs: ["/img/orkide-1.webp", "/img/orkide-2.webp", "/img/orkide-3.webp"], caption: "Ev ve ofis orkideleri.", dur: 4.4 },
    productShot("orkide"),
    { type: "steps", steps: [{ icon: "CalendarDots", title: "15 günde bir" }, { icon: "SprayBottle", title: "Yaprak ve ortama" }, { icon: "SunHorizon", title: "Serin saatte" }], dur: 3.8 },
    { type: "end", slug: "orkide" },
  ],
  "kaktus-sukulent": [
    { type: "words", lines: ["Az su ister,", "özen ister."], script: [1], dur: 2.6 },
    { type: "strobe", items: [{ text: "Durgun büyüme", icon: "ClockCountdown" }, { text: "Formunu kaybeden yaprak", icon: "Leaf" }, { text: "Hassas kök", icon: "Plant" }], each: 0.85 },
    { type: "spray", text: "Diri form, canlı renk.", slug: "kaktus-sukulent", dur: 3.8 },
    { type: "bloom", caption: "Doğal form ve diri görünüm", sub: "Renk canlılığı ve doğal formun korunmasını destekler", kinds: ["echeveria", "cactusflower", "echeveria", "echeveria"], dur: 5 },
    { type: "photos", imgs: ["/img/kaktus-1.webp", "/img/kaktus-2.webp", "/img/kaktus-3.webp"], caption: "Aloe, echeveria, haworthia.", dur: 4.4 },
    productShot("kaktus-sukulent"),
    { type: "steps", steps: [{ icon: "CalendarDots", title: "15 günde bir" }, { icon: "SprayBottle", title: "Yüzeye ve toprağa" }, { icon: "SunHorizon", title: "Serin saatte" }], dur: 3.8 },
    { type: "end", slug: "kaktus-sukulent" },
  ],
  "3lu-set": [
    { type: "words", lines: ["Her bitkinin", "derdi başka."], script: [1], dur: 2.6 },
    { type: "strobe", items: [{ text: "Çiçek", icon: "Flower" }, { text: "Orkide", icon: "Crown" }, { text: "Kaktüs", icon: "Cactus" }], each: 0.8 },
    { type: "spray", text: "Üç formül, tek kutu.", slug: "3lu-set", dur: 3.8 },
    { type: "bloom", caption: "Evinizin her köşesi için", sub: "Saksı çiçekleri, orkideler, kaktüs ve sukulentler", kinds: ["geranium", "orchid", "echeveria", "petunia", "orchidW", "rose", "cactusflower"], dur: 5 },
    { type: "photos", imgs: ["/img/yasam-1.webp", "/img/orkide-2.webp", "/img/kaktus-2.webp"], caption: "Çiçekli, orkide, sukulent.", dur: 4.4 },
    productShot("3lu-set"),
    { type: "end", slug: "3lu-set" },
  ],
};

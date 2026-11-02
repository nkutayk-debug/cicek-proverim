/* Çiçek Coşturan ürünleri. Metinler proverim.com.tr ürün sayfalarından BİREBİR (3 Ekim 2026).
   Sunucu ve istemci ikisi de import edebilir (React yok). */
import { URUN_PARAGRAFLAR, URUN_NE_SAGLAR, URUN_KULLANIM, URUN_BITKILER, FAQ, SHOP_URL, SET_URL, ORKIDE_URL, KAKTUS_URL } from "./content";

export type Line = "pink" | "purple" | "green" | "set";
export type Product = {
  slug: string;
  line: Line;
  short: string;
  name: string;
  full: string;
  tagline: string;
  bottle: string;
  ratio: number;
  nozzle: [number, number];
  cover: string;
  gallery: string[];
  shop: string;
  ikasPath: string;
  fallback: { sell: number; now: number };
  intro: string[];
  features: { icon: string; text: string }[];
  givesTitle: string;
  gives: string[];
  usageTitle: string;
  usage: string;
  plantsTitle: string;
  plants: string[];
  faq: { q: string; a: string }[];
};

export const LINE_COLOR: Record<Line, { main: string; deep: string; soft: string; mist: string }> = {
  pink: { main: "#d4246c", deep: "#8f1648", soft: "#fdf1f6", mist: "246,206,224" },
  purple: { main: "#7a3fd1", deep: "#4a2581", soft: "#f6f1fd", mist: "222,206,248" },
  green: { main: "#2f9a55", deep: "#1d5e35", soft: "#effaf2", mist: "200,240,210" },
  set: { main: "#d4246c", deep: "#8f1648", soft: "#fdf1f6", mist: "246,206,224" },
};

export const PRODUCTS: Product[] = [
  {
    slug: "cicekli-bitkiler",
    line: "pink",
    short: "Çiçekli Bitkiler",
    name: "Çiçekli Bitkiler İçin Bitki Besini Sprey",
    full: "Proverim® Çiçekli Bitkiler İçin Bitki Besini Sprey 400 ml",
    tagline: "Salon çiçekleri, balkon bitkileri ve saksı çiçekleri için bakım desteği.",
    bottle: "/img/sise-cicekli.webp", ratio: 261 / 1085, nozzle: [0.123, 0.036],
    cover: "/img/urun-cicekli.webp",
    gallery: ["/img/urun-cicekli.webp", "/img/yasam-1.webp", "/img/yasam-2.webp", "/img/yasam-3.webp"],
    shop: SHOP_URL, ikasPath: "/cicekli-bitkiler-bitki-besini-sprey-400-ml-proverim-cicek-costuran",
    fallback: { sell: 399, now: 285 },
    intro: URUN_PARAGRAFLAR,
    features: [
      { icon: "Flower", text: "Tomurcuk ve çiçeklenme desteği" },
      { icon: "Plant", text: "Kök ve yaprak gelişimini destekler" },
      { icon: "Sparkle", text: "Daha canlı renk görünümüne katkı sağlar" },
      { icon: "ClockCountdown", text: "Düzenli bakımda çiçeklenme performansını destekler" },
    ],
    givesTitle: "Proverim Çiçekli Bitkiler Sprey Ne Sağlar?",
    gives: URUN_NE_SAGLAR,
    usageTitle: "Kullanım Şekli",
    usage: URUN_KULLANIM,
    plantsTitle: "Hangi Bitkilerde Kullanılır?",
    plants: URUN_BITKILER,
    faq: FAQ,
  },
  {
    slug: "orkide",
    line: "purple",
    short: "Orkide",
    name: "Orkide Bitki Besini Sprey",
    full: "Proverim® Orkide Bitki Besini Sprey 400 ml",
    tagline: "Phalaenopsis, dendrobium ve ev/ofis orkideleri için hassas bakım desteği.",
    bottle: "/img/sise-orkide.webp", ratio: 319 / 1072, nozzle: [0.245, 0.031],
    cover: "/img/urun-orkide.webp",
    gallery: ["/img/urun-orkide.webp", "/img/orkide-1.webp", "/img/orkide-2.webp", "/img/orkide-3.webp"],
    shop: ORKIDE_URL, ikasPath: "/orkide-bitki-besini-sprey-400-ml-proverim-cicek-costuran",
    fallback: { sell: 399, now: 285 },
    intro: [
      "Proverim Orkide Bitki Besini Sprey, orkidelerde kök çevresi dengesini, yaprak canlılığını, çiçek sapı gelişimini ve genel bitki görünümünü desteklemek amacıyla geliştirilmiş pratik kullanımlı bir bakım ürünüdür.",
      "Köklerin sağlıklı çalışmadığı durumlarda bitki suyu ve besinleri yeterince kullanamayabilir. Proverim, düzenli kullanımda orkidenin daha canlı ve güçlü görünmesine yardımcı olur.",
      "Kullanım alanı: Phalaenopsis, dendrobium, cattleya, oncidium ve ev/ofis orkideleri.",
    ],
    features: [
      { icon: "Crown", text: "Çiçeklenme performansını destekler" },
      { icon: "Plant", text: "Kök ve yaprak canlılığına katkı sağlar" },
      { icon: "Sparkle", text: "Canlı görünüm ve dengeli gelişim sunar" },
      { icon: "House", text: "Ev ve ofis orkide bakımına uygundur" },
    ],
    givesTitle: "Proverim Orkide Sprey Ne Sağlar?",
    gives: [
      "Kök çevresi dengesini ve bitki gelişimini destekler.",
      "Yaprakların daha canlı görünmesine yardımcı olur.",
      "Çiçek sapı gelişimi ve çiçeklenmeyi destekler.",
      "Su ve besinlerden dengeli yararlanmaya katkı sağlar.",
    ],
    usageTitle: "15 Günlük Bakım Rutini",
    usage: "Ürünü 15 günde bir yapraklara ve yetiştirme ortamına eşit şekilde püskürtünüz. Sabah erken saatlerde veya akşam serinliğinde uygulayınız. Direkt güneş altında püskürtmeyiniz.",
    plantsTitle: "Hangi Orkideler İçin Kullanılır?",
    plants: ["Phalaenopsis", "Kelebek Orkide", "Dendrobium", "Cattleya", "Oncidium", "Ev orkideleri"],
    faq: [
      { q: "Kaç günde bir kullanılmalıdır?", a: "Ürün 15 günde bir püskürtme yöntemiyle uygulanabilir." },
      { q: "Çiçekliyken kullanılabilir mi?", a: "Yapraklara ve ortama kontrollü uygulanabilir. Çiçeklerin üzerine doğrudan yoğun püskürtülmemelidir." },
      { q: "Sulama yerine geçer mi?", a: "Hayır, sulama yerine geçmez. Orkide sulaması ayrıca planlanmalıdır." },
    ],
  },
  {
    slug: "kaktus-sukulent",
    line: "green",
    short: "Kaktüs & Sukulent",
    name: "Kaktüs & Sukulent Bitki Besini Sprey",
    full: "Proverim® Kaktüs & Sukulent Bitki Besini Sprey 400 ml",
    tagline: "Aloe, echeveria, haworthia, kaktüs ve sukulent koleksiyonları için pratik destek.",
    bottle: "/img/sise-kaktus.webp", ratio: 334 / 1189, nozzle: [0.251, 0.024],
    cover: "/img/urun-kaktus.webp",
    gallery: ["/img/urun-kaktus.webp", "/img/kaktus-1.webp", "/img/kaktus-2.webp", "/img/kaktus-3.webp"],
    shop: KAKTUS_URL, ikasPath: "/kaktus-ve-sukulent-bitki-besini-sprey-400-ml-proverim-cicek-costuran",
    fallback: { sell: 399, now: 285 },
    intro: [
      "Proverim Kaktüs & Sukulent Bitki Besini Sprey, kaktüs ve sukulentlerde kök bölgesi canlılığını, dengeli gelişimi, yaprak-doku formunu ve genel bitki görünümünü desteklemek amacıyla geliştirilmiş pratik kullanımlı bir bakım ürünüdür.",
      "Proverim, düzenli kullanımda bitkinin daha diri, canlı ve sağlıklı görünüm kazanmasına yardımcı olur. Yavaşlayan veya formunu kaybetmeye başlayan sukulentlerde dengeli gelişim sunar.",
      "Kullanım alanı: Kaktüsler, sukulentler, aloe türleri, echeveria, haworthia, crassula, sedum ve ev/ofis koleksiyon bitkileri.",
    ],
    features: [
      { icon: "Cactus", text: "Düzenli bakım desteği" },
      { icon: "Leaf", text: "Canlı görünüm ve doğal form gelişimi" },
      { icon: "SprayBottle", text: "400 ml pratik sprey formu" },
      { icon: "House", text: "Ev, balkon ve ofis bitkilerine uygun" },
    ],
    givesTitle: "Proverim Kaktüs & Sukulent Sprey Ne Sağlar?",
    gives: [
      "Kök çevresi canlılığını ve dengeli gelişimi destekler.",
      "Yaprak ve gövde dokusunun diri görünmesine yardımcı olur.",
      "Renk canlılığı ve doğal formun korunmasını destekler.",
      "Az su seven bitkilerde pratik bakım sunar.",
    ],
    usageTitle: "15 Günlük Bakım Ritüeli",
    usage: "Ürünü 15 günde bir bitki yüzeyine ve toprak yüzeyine eşit şekilde püskürtünüz. Sabah erken saatlerde veya akşam serinliğinde uygulayınız.",
    plantsTitle: "Hangi Bitkiler İçin Uygundur?",
    plants: ["Aloe", "Echeveria", "Haworthia", "Crassula", "Sedum", "Kaktüs türleri"],
    faq: [
      { q: "Kaç günde bir kullanılmalıdır?", a: "Ürün 15 günde bir püskürtme yöntemiyle uygulanabilir." },
      { q: "Toprağa mı yaprağa mı uygulanır?", a: "Bitki yüzeyine, etli yapraklara ve toprak yüzeyine eşit şekilde püskürtülebilir." },
      { q: "Sulama yerine geçer mi?", a: "Hayır, sulama yerine geçmez. Sulama düzeni ayrıca takip edilmelidir." },
    ],
  },
  {
    slug: "3lu-set",
    line: "set",
    short: "3'lü Set",
    name: "Çiçek Coşturucu 3’lü Bitki Besini Sprey Seti",
    full: "Proverim® Çiçek Coşturucu 3’lü Bitki Besini Sprey Seti (3 x 400 ml)",
    tagline: "Çiçekli bitkiler, orkideler, kaktüsler ve sukulentler için 3 farklı bakım desteği tek pakette.",
    bottle: "/img/sise-cicekli.webp", ratio: 261 / 1085, nozzle: [0.123, 0.036],
    cover: "/img/set-3lu.webp",
    gallery: ["/img/set-3lu.webp", "/img/yasam-1.webp", "/img/orkide-2.webp", "/img/kaktus-2.webp"],
    shop: SET_URL, ikasPath: "/proverim-cicek-costurucu-bitki-besini-sprey-3lu-set-3x400-ml-ciceklenme-ve-canlilik-destegi",
    fallback: { sell: 1197, now: 799 },
    intro: [
      "Proverim 3’lü Bitki Besini Sprey Seti; farklı ihtiyaçlara sahip iç mekân bitkileri için pratik bir bakım çözümü sunar. Çiçekli bitkilerde canlılık ve çiçeklenme, orkidelerde hassas kök ve çiçek sapı, kaktüs ve sukulentlerde ise kontrollü gelişim ve doğal form desteği sağlar.",
      "Her bitki aynı bakım ihtiyacına sahip değildir. Orkideler hassas kök ve ortam isterken, kaktüs ve sukulentler az su dengesine ihtiyaç duyar. Bu set, üç farklı bakım ürününü tek pakette birleştirerek ev, balkon ve ofis bitkileri için düzenli bakım kolaylığı sağlar.",
    ],
    features: [
      { icon: "Diamond", text: "3’ü 1 Arada Avantaj: Farklı bitki grupları için ekonomik ve pratik set." },
      { icon: "Dna", text: "Mikrobiyal Destek: Kök çevresi dengesini ve biyolojik süreci destekler." },
      { icon: "Flower", text: "Çiçeklenme Desteği: Tomurcuklanma ve canlı görünüm programına katkı sağlar." },
      { icon: "SprayBottle", text: "Kolay Uygulama: 400 ml sprey formuyla evde pratik kullanım sunar." },
    ],
    givesTitle: "3’lü Set Ne Sağlar?",
    gives: [
      "Çiçekli bitkilerde canlı görünüm ve çiçeklenmeyi destekler.",
      "Orkidelerde kök çevresi, yaprak ve çiçek sapı gelişimine katkı sağlar.",
      "Kaktüs ve sukulentlerde doğal form ve diri görünümü destekler.",
      "3 x 400 ml sprey formuyla uzun süreli bakım rutini sunar.",
    ],
    usageTitle: "Pratik Uygulama Reçetesi",
    usage: "Kullanmadan önce iyice çalkalayınız. Ürünleri 15 günde bir püskürtme yöntemiyle ilgili bitki grubuna göre uygulayınız. Bitki yüzeyine ve yapraklara kontrollü şekilde püskürtünüz. En uygun uygulama sabah erken saatlerde veya akşam serinliğinde yapılır. Direkt yakıcı güneş altında uygulama yapmayınız.",
    plantsTitle: "Evinizin Her Köşesi İçin",
    plants: ["Saksı çiçekleri", "Salon bitkileri", "Orkideler", "Kaktüs ve sukulentler", "Balkon ve teras", "Ofis bitkileri"],
    faq: [
      { q: "Bu 3’lü sette hangi ürünler bulunur?", a: "Çiçekli bitkiler, orkideler ve kaktüs-sukulentler için özel 3 adet 400 ml sprey bulunur (Toplam 3x400 ml)." },
      { q: "Kaç günde bir kullanılmalıdır?", a: "Ürünler genel bakım rutini olarak 15 günde bir püskürtme yöntemiyle uygulanabilir." },
      { q: "Sulama yerine geçer mi?", a: "Hayır, sulama yerine geçmez. Sulama bitki ihtiyacına göre ayrıca yapılmalıdır." },
    ],
  },
];

export const bySlug = (s: string) => PRODUCTS.find((p) => p.slug === s);
export const SET_BOTTLES = PRODUCTS.filter((p) => p.line !== "set");
export const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;

/* Orkide sayfası içeriği. Ürün metinleri proverim.com.tr orkide ürün sayfasından BİREBİR;
   bakım ve bilim metinleri content.ts SOURCES listesine dayanır ([n]). */
import type { Cause, Plant, Study } from "./content";
import type { FlowerKind } from "./flora";

export const ORCHID_SHOP = "https://proverim.com.tr/orkide-bitki-besini-sprey-400-ml-proverim-cicek-costuran";

/* Neden açmaz: her bölüm önce sorunu, sonra çözümü canlandırır (lib/orchidScene.ts). */
export const ORCHID_CAUSES: (Cause & { fix: string })[] = [
  {
    id: "isik", side: "l", icon: "Sun", refs: [19, 24], fix: "tül perdeli doğu penceresi",
    title: "Işık yetmiyor",
    text: "Kelebek orkide doğrudan güneş istemez ama karanlığı da sevmez; tül perdeli doğu penceresi idealdir. Bir çalışmada en az ışıkta büyüyen genç orkidelerin yalnızca %2'si çiçek açtı, bol ışık alanlarda bu oran %98'e çıktı.",
  },
  {
    id: "sicak", side: "l", icon: "Thermometer", refs: [18, 19], fix: "birkaç hafta 26 °C altı",
    title: "Ortam hep çok sıcak",
    text: "Kelebek orkide 27-29 °C'nin üzerinde sürekli kalırsa çiçek sapı başlatmaz. Sap için birkaç hafta boyunca gündüz sıcaklığının 26 °C'nin altına inmesi gerekir. Sonbaharda serin ve aydınlık bir pencere önü çoğu zaman sapı tetikler.",
  },
  {
    id: "su", side: "l", icon: "Drop", refs: [24, 20], fix: "kökler gümüşiyken sula",
    title: "Kök boğuluyor",
    text: "Orkide kökü havayla nefes alır. Saksı dibinde su bekler ya da harç hep ıslak kalırsa kökler kahverengileşip yumuşar. Kökler gümüşi-gri görünüp harç neredeyse kuruduğunda bolca sulayın, fazlası akıp gitsin.",
  },
  {
    id: "harc", side: "r", icon: "PottedPlant", refs: [], fix: "taze kabuk, çiçek bitince",
    title: "Kabuk harç eskidi",
    text: "Kabuk zamanla ufalanır, toprak gibi sıkışır ve havasız kalır; kökler bu çamurlaşan harçta çürür. Ufalanmış harcı çiçeklenme bittikten sonra taze kabukla değiştirmek kökleri yeniden nefes aldırır.",
  },
  {
    id: "tuz", side: "r", icon: "Flask", refs: [24], fix: "ayda bir bol sade su",
    title: "Tuz birikti",
    text: "Gübre ve kireçli su zamanla kabukta tuz bırakır, kök uçları yanar. Ayda bir kez saksıdan bol, sade su geçirmek biriken tuzu yıkar.",
  },
  {
    id: "sap", side: "r", icon: "Scissors", refs: [], fix: "ikinci boğumun üstünden kes",
    title: "Çiçek bitti, sap ne olacak?",
    text: "Çiçekler döküldükten sonra sap yeşilse ikinci boğumun üstünden kesilebilir; bazı orkideler buradan yan sap verir. Sap kuruduysa dibinden kesin, bitki dinlenmeye geçer. Çiçek Coşturan Orkide bu toparlanma döneminde de bakım rutinine eklenebilir.",
  },
];

export const ORCHID_ROOTS = [
  { icon: "Drop", kicker: "Velamen", title: "Kökün süngeri", text: "Orkide köklerinin dışı velamen denen süngerimsi bir katmanla kaplıdır. Kuruyken gümüşi görünür, ıslanınca yeşile döner. Velamen suyu ve içindeki besini saniyeler içinde emer, buharlaşması ise saatler sürer.", refs: [20] },
  { icon: "Dna", kicker: "Faydalı bakteriler", title: "Bakteriler velamene yerleşir", text: "Faydalı kök bakterileri orkide köklerinde velamene ve kökün iç dokusuna hızla yerleşebilir. Doğada orkideler kök çevresindeki mikroplarla sıkı bir ortaklık içinde yaşar.", refs: [21] },
  { icon: "Plant", kicker: "Oksin", title: "Yeni kök uçları", text: "Orkide köklerinden ayrılan bakterilerin bir kısmı oksin (IAA) üretir. Bir çalışmada orkideden ayrılan bir Bacillus suşu köklere yerleşti ve aşılanan fideler kontrol grubundan daha iyi gelişti.", refs: [22, 21] },
  { icon: "Flower", kicker: "Sap ve çiçek", title: "Güçlü kök, güçlü sap", text: "Kök sağlıklı çalıştığında bitki su ve besinlerden daha dengeli yararlanır. Yaprak canlılığı ve çiçek sapı gelişimi bu temel üzerine kurulur.", refs: [] },
];

export const ORCHID_STUDIES: Study[] = [
  { plant: "Kelebek orkide", latin: "Phalaenopsis", species: "orchid", big: "%2 → %98", bigLabel: "ışığa göre çiçek açan genç orkide", finding: "Genç kelebek orkidelerde en az ışıkta büyüyenlerin %2'si, orta ışıkta %77'si, bol ışıkta %98'i çiçek açtı.", ref: 19 },
  { plant: "Kelebek orkide, sıcaklık", latin: "Phalaenopsis", species: "orchidW", big: "29 °C", bigLabel: "sabit sıcaklıkta 20 haftada hiç sap yok", finding: "Sürekli 29 °C'de tutulan orkidelerin hiçbiri 20 hafta içinde çiçek sapı vermedi; gündüzü 23 °C ve altında olanların en az %80'i sap çıkardı. En çok tomurcuk 14-17 °C ortalamada sayıldı.", ref: 18 },
  { plant: "Epifit orkideler", latin: "Orchidaceae, velamen", species: "dendro", big: "Saniyeler", bigLabel: "velamen suyu bu sürede emer", finding: "Çok sayıda orkide türünde velamen çözeltiyi saniyeler içinde emdi, buharlaşması saatler sürdü. Velamen besin iyonlarını da tutuyor.", ref: 20 },
  { plant: "Dendrobium", latin: "Dendrobium nobile", species: "dendro", big: "Velamen", bigLabel: "faydalı bakteriler buraya yerleşti", finding: "Faydalı kök bakterileri Dendrobium köklerinde velamene ve iç dokuya hızla yerleşti, oksin üretti ve tohum çimlenmesini artırdı.", ref: 21 },
  { plant: "Vanda", latin: "Vanda cristata", species: "vanda", big: "Bacillus", bigLabel: "orkideden ayrılan faydalı suş", finding: "Orkideden ayrılan Bacillus PVL1 suşu köklere yerleşti ve oksin üretti; aşılanan fideler kontrol grubundan daha iyi büyüdü.", ref: 22 },
  { plant: "Oncidium", latin: "Oncidium", species: "onci", big: "Kök", bigLabel: "daha güçlü kök gelişimi", finding: "Kök mantarı Piriformospora indica ile ortaklık kuran Oncidium fidelerinde büyümenin hızlandığı ve köklerin güçlü geliştiği gözlendi.", ref: 23 },
];

export const ORCHID_PLANTS: (Omit<Plant, "img" | "flower"> & { img?: string; flower: FlowerKind })[] = [
  {
    id: "kelebek", name: "Kelebek orkide", latin: "Phalaenopsis", flower: "orchid",
    light: "Parlak ama dolaylı; tül perdeli doğu penceresi", water: "Kökler gümüşi olunca, harç neredeyse kuruyunca bol su", temp: "Gece en az 18 °C; sap için birkaç hafta 26 °C altı gündüz", season: "Çoğunlukla kış sonu ve ilkbahar; çiçekler haftalarca açık kalır",
    why: "Sürekli 27-29 °C üzerindeki sıcak ortam ve az ışık sap oluşumunu durdurur. Fazla su kökü boğar.",
    tip: "Çiçekler bitince sapı ikinci boğumun üstünden kesin. Spreyi yapraklara ve kabuğa verin; yaprak koltuklarında su bırakmayın.",
    refs: [18, 19, 24],
  },
  {
    id: "dendrobium", name: "Dendrobium", latin: "Dendrobium nobile", flower: "dendro",
    light: "Parlak ışık, sabah güneşi alabilir; öğle güneşi yok", water: "Büyüme döneminde düzenli, kışın azaltılır", temp: "Gece en az 11 °C", season: "Sonbahar ve kış; çiçekler 3-4 hafta açık kalır",
    why: "Az ışık ve serin bir dinlenme döneminin olmaması. Eski kamışlar kesilirse gelecek çiçekler de gider.",
    tip: "Çiçek vermiş eski kamışları kesmeyin; yeniden çiçeklenebilirler. Spreyi yapraklara ve kamış diplerine verin.",
    refs: [24],
  },
  {
    id: "cattleya", name: "Cattleya", latin: "Cattleya", flower: "catt",
    light: "Kelebek orkidenin iki katı ışık; tül perdeli güney ya da batı penceresi", water: "Büyürken haftada bir; aralarda biraz kurusun", temp: "Gece en az 16 °C", season: "Yılda bir kez, ilkbahar ya da sonbahar; çiçekler 2-6 hafta açık kalır",
    why: "En sık sebep az ışık. Koyu yeşil, yumuşak yapraklar ışığın yetmediğini gösterir.",
    tip: "Çiçek kını içindeki tomurcuklara püskürtmeyin; spreyi yapraklara ve kabuğa verin.",
    refs: [24],
  },
  {
    id: "oncidium", name: "Oncidium", latin: "Oncidium (dans eden kız)", flower: "onci",
    light: "Bol ışık; çiçek açarken hafif gölge", water: "İnce kökleri kurumaya dayanıksız; harç hafif nemli kalsın", temp: "Gündüz 19-24 °C, gece 13-18 °C", season: "Çoğunlukla sonbahar",
    why: "Az ışık ve harcın tamamen kuruması. Sıkışmış eski harçta ince kökler çabuk bozulur.",
    tip: "Sarı çiçek dallarına değil, yapraklara ve harç yüzeyine ince sis verin.",
    refs: [24],
  },
];

/* Kullanım: ürün sayfasındaki "15 GÜNLÜK BAKIM RUTİNİ" cümleleri, sırasıyla. */
export const ORCHID_STEPS = [
  { icon: "CalendarDots", title: "15 günde bir", text: "Ürünü 15 günde bir yapraklara ve yetiştirme ortamına eşit şekilde püskürtünüz." },
  { icon: "SunHorizon", title: "Serin saatte", text: "Sabah erken saatlerde veya akşam serinliğinde uygulayınız." },
  { icon: "Sun", title: "Güneşte değil", text: "Direkt güneş altında püskürtmeyiniz." },
];

export const ORCHID_FAQ = [
  { q: "Kaç günde bir kullanılmalıdır?", a: "Ürün 15 günde bir püskürtme yöntemiyle uygulanabilir." },
  { q: "Çiçekliyken kullanılabilir mi?", a: "Yapraklara ve ortama kontrollü uygulanabilir. Çiçeklerin üzerine doğrudan yoğun püskürtülmemelidir." },
  { q: "Sulama yerine geçer mi?", a: "Hayır, sulama yerine geçmez. Orkide sulaması ayrıca planlanmalıdır." },
  { q: "Orkide neden çiçek sapı vermiyor?", a: "Kelebek orkide ortam sürekli 27-29 °C'nin üzerindeyse sap başlatmaz; birkaç hafta 26 °C'nin altında gündüzler ister. Işığın az olması da sapı engeller. Sonbaharda serin ve aydınlık bir pencere önü çoğu zaman yardımcı olur." },
  { q: "Orkideye ne zaman su verilir?", a: "Kökler gümüşi-gri göründüğünde ve harç neredeyse kuruduğunda. Yeşil kök hâlâ nemlidir. Saksıdan akıp gidecek kadar bol verin, tabakta su bekletmeyin." },
  { q: "Çiçek bitince sapı keseyim mi?", a: "Sap yeşilse ikinci boğumun hemen üstünden kesebilirsiniz; bazı bitkiler buradan yan sap verir. Sap sararıp kuruduysa dibinden kesin." },
  { q: "Hava kökleri kesilir mi?", a: "Sert ve sağlıklı hava köklerini kesmeyin; nem ve besin alırlar. Yalnız kurumuş, içi boşalmış ya da çürümüş kökleri temiz bir makasla alın." },
  { q: "Saksıyı ne zaman değiştirmeliyim?", a: "Kabuk ufalanıp toprak gibi sıkıştığında ya da kökler saksıyı tamamen doldurduğunda. En uygun zaman çiçeklenme bittikten sonradır." },
];

export const ORCHID_PLANT_TAGS = ["Phalaenopsis", "Kelebek Orkide", "Dendrobium", "Cattleya", "Oncidium", "Ev orkideleri"];
export const ORCHID_SOURCE_IDS = [18, 19, 20, 21, 22, 23, 24];

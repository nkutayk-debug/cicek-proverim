/* Çiçek Coşturan · Çiçekli Bitkiler sayfasının tüm metinleri.
   - URUN_* : proverim.com.tr ürün sayfasından BİREBİR (3 Ekim 2026'da çekildi).
   - Bilim / rehber metinleri: aşağıdaki SOURCES listesine dayanır, [n] = kaynak numarası. */

export const SITE = "https://cicekcosturan.proverim.com.tr";
export const SHOP_URL = "https://proverim.com.tr/cicekli-bitkiler-bitki-besini-sprey-400-ml-proverim-cicek-costuran";
export const SET_URL = "https://proverim.com.tr/proverim-cicek-costurucu-bitki-besini-sprey-3lu-set-3x400-ml-ciceklenme-ve-canlilik-destegi";
export const HOME_SOURCE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
export const ORKIDE_URL = "https://proverim.com.tr/orkide-bitki-besini-sprey-400-ml-proverim-cicek-costuran";
export const KAKTUS_URL = "https://proverim.com.tr/kaktus-ve-sukulent-bitki-besini-sprey-400-ml-proverim-cicek-costuran";
export const PHONE = "0553 184 45 96";
export const wa = (text: string) => `https://wa.me/905531844596?text=${encodeURIComponent(text)}`;
export const WA_DEFAULT = wa("Merhaba, Çiçek Coşturan hakkında bilgi almak istiyorum. Bitkim:");

/* ---------- Ürün sayfası metinleri (birebir) ---------- */
export const URUN_AD = "Proverim® Çiçekli Bitkiler İçin Bitki Besini Sprey 400 ml";
export const URUN_PARAGRAFLAR = [
  "Proverim Çiçekli Bitkiler İçin Bitki Besini Sprey, saksı çiçeklerinde kök çevresi canlılığını, yaprak görünümünü, tomurcuklanma sürecini ve çiçeklenme performansını desteklemek amacıyla geliştirilmiş pratik kullanımlı bir bakım ürünüdür. Çiçekli bitkilerde sağlıklı gelişim için en önemli alan kök bölgesidir. Kök ne kadar güçlü ve aktif çalışırsa, bitki suyu ve besin maddelerini o kadar dengeli kullanabilir.",
  "Proverim, kök çevresindeki biyolojik yapının desteklenmesine yardımcı olur. Düzenli kullanımda yaprakların daha canlı görünmesine, gövde gelişiminin desteklenmesine, tomurcuk oluşumunun teşvik edilmesine ve çiçeklenme performansının bakım rutini içinde daha dengeli ilerlemesine katkı sağlayabilir.",
  "Özellikle gelişimi yavaşlamış, çiçek açmakta zorlanan, canlılığını kaybetmiş veya bulunduğu saksı ortamında yeterince güçlü gelişemeyen çiçekli bitkilerde düzenli bakım programının tamamlayıcı parçası olarak kullanılabilir.",
];
export const URUN_DORTLU = [
  { icon: "Flower", text: "Tomurcuk ve çiçeklenme desteği" },
  { icon: "Plant", text: "Kök ve yaprak gelişimini destekler" },
  { icon: "Sparkle", text: "Daha canlı renk görünümüne katkı sağlar" },
  { icon: "ClockCountdown", text: "Düzenli bakımda çiçeklenme performansını destekler" },
] as const;
export const URUN_NE_SAGLAR = [
  "Kök çevresi dengesini ve bitki gelişim sürecini destekleyebilir.",
  "Yaprakların daha canlı ve parlak görünmesine yardımcı olabilir.",
  "Tomurcuklanma ve çiçeklenme performansına katkı sağlayabilir.",
  "Bitkinin su ve besinlerden daha dengeli yararlanmasına destek olur.",
  "Saksı çiçeklerinde düzenli bakım rutininin tamamlayıcısıdır.",
  "Solgun görünüm ve durgun gelişim dönemlerinde bakım desteği sağlar.",
  "Ev, balkon, teras ve ofis bitkilerinde pratik kullanım sunar.",
  "Çiçekli bitkilerin daha diri ve canlı görünmesini destekleyebilir.",
];
export const URUN_KULLANIM =
  "Kullanmadan önce iyice çalkalayınız. Ürünü 15 günde bir püskürtme yöntemiyle uygulayınız. Çiçekli bitkilerin bitki yüzeyine, yapraklarına ve toprak yüzeyine eşit şekilde püskürtünüz. En uygun uygulama sabah erken saatlerde veya akşam serinliğinde yapılır. Direkt yakıcı güneş altında uygulama yapmayınız ve aşırı uygulamadan kaçınınız.";
export const URUN_BITKILER = [
  "Saksı çiçekleri", "Balkon bitkileri", "Teras bitkileri", "İç mekân süs bitkileri",
  "Salon çiçekleri", "Ev bitkileri", "Ofis bitkileri", "Çiçekli süs bitkileri",
];

/* Kullanım adımları: ürün sayfasındaki KULLANIM ŞEKLİ cümleleri, sırayla bölündü. */
export const STEPS = [
  { icon: "ArrowsClockwise", title: "Çalkala", text: "Kullanmadan önce iyice çalkalayınız." },
  { icon: "CalendarDots", title: "15 günde bir", text: "Ürünü 15 günde bir püskürtme yöntemiyle uygulayınız." },
  { icon: "SprayBottle", title: "Eşit püskürt", text: "Çiçekli bitkilerin bitki yüzeyine, yapraklarına ve toprak yüzeyine eşit şekilde püskürtünüz." },
  { icon: "SunHorizon", title: "Serin saatte", text: "En uygun uygulama sabah erken saatlerde veya akşam serinliğinde yapılır. Direkt yakıcı güneş altında uygulama yapmayınız ve aşırı uygulamadan kaçınınız." },
] as const;

/* ---------- Çiçek neden açmaz? (kaynaklı) ---------- */
export type Cause = { id: string; icon: string; title: string; text: string; refs: number[]; side: "l" | "r" };
export const CAUSES: Cause[] = [
  {
    id: "isik", side: "l", icon: "Sun", refs: [10, 12, 13],
    title: "Işık yetmiyor",
    text: "Çiçeğin enerjisi ışıktan gelir. Sardunya, petunya ve gül günde en az 6 saat doğrudan güneş ister. Afrika menekşesi ve barış çiçeği ise parlak ama dolaylı ışıkta açar; karanlık köşede yaprak verir, çiçek vermez.",
  },
  {
    id: "azot", side: "l", icon: "Leaf", refs: [11],
    title: "Yaprak var, çiçek yok",
    text: "Azotu yüksek besinle sık beslenen bitki gücünü yeşil aksama verir. Sonuç gür, parlak yapraklar ve neredeyse hiç tomurcuk.",
  },
  {
    id: "su", side: "l", icon: "Drop", refs: [10, 15],
    title: "Kök boğuluyor",
    text: "Sürekli ıslak toprakta hava boşlukları suyla dolar, kök nefes alamaz. Kökü zayıflayan bitki hayatta kalmak için önce çiçekten vazgeçer. Toprak ıslakken solan yaprak bunun işaretidir.",
  },
  {
    id: "stres", side: "r", icon: "Thermometer", refs: [7],
    title: "Stres, tomurcuğu düşürür",
    text: "Sıcak, kuraklık ya da yer değişikliği gibi streslerde bitki etilen üretir. Etilen, açmak üzere olan tomurcuğun ve çiçeğin dökülmesini hızlandırır.",
  },
  {
    id: "kirec", side: "r", icon: "Flask", refs: [14, 16],
    title: "Kireçli su, kilitli besin",
    text: "Musluk suyundaki bikarbonat her sulamada saksıya biraz daha kireç bırakır. pH yükseldikçe demir alımı zorlaşır; yeni yapraklar damar arası sararır. Petunya buna en hassas olanlardan biridir. Toprak yüzeyindeki beyaz kabuk da aynı birikimin izidir.",
  },
  {
    id: "saksi", side: "r", icon: "PottedPlant", refs: [10, 12],
    title: "Saksı, yaş ve budama",
    text: "Kocaman saksıya yeni şaşırtılan bitki önce kök yapar, çiçeği bekletir. Solan çiçeği yerinde bırakmak da yeni tomurcuğu geciktirir; sardunya ve petunyada solanı koparmak açmayı sürdürür.",
  },
];

/* ---------- Kök bölgesi hikâyesi (kaydırmalı) ---------- */
export const ROOT_STEPS = [
  {
    kicker: "Kök salgıları",
    title: "Bitki kökten davet gönderir",
    text: "Bitki fotosentezle bağladığı karbonun yaklaşık %5 ile %21'ini şeker, amino asit ve organik asit olarak kökten toprağa bırakır. Kökün hemen çevresindeki bu ince kuşağa rizosfer denir ve topraktaki en canlı bölgedir.",
    refs: [9],
  },
  {
    kicker: "Faydalı bakteriler",
    title: "Davete yararlı misafirler gelir",
    text: "Bacillus gibi faydalı bakteriler bu salgılarla beslenip kök yüzeyine yerleşir. Kökle aralarında bir alışveriş başlar: bitki karbon verir, bakteri karşılığında besini ve büyümeyi kolaylaştıran maddeler üretir.",
    refs: [8, 1],
  },
  {
    kicker: "Kök tüyleri",
    title: "Kök daha çok toprağa dokunur",
    text: "Bacillus türlerinin önemli bir kısmı bitki büyüme hormonu oksin (IAA) üretir. Oksin kök tüylerini ve yan kökleri çoğaltır. Daha fazla kök yüzeyi, aynı saksıdan daha fazla su ve besin demektir.",
    refs: [8],
  },
  {
    kicker: "Besin ve denge",
    title: "Kilitli besin çözülür, stres azalır",
    text: "Bu bakteriler toprakta bağlı fosforu çözebilir, demiri yakalayan sideroforlar üretebilir. Bazı kök bakterileri ACC deaminaz enzimiyle stres etilenini düşürür. Kök rahatladığında bitki enerjisini yeniden tomurcuğa ayırabilir.",
    refs: [8, 7, 2],
  },
];

/* ---------- Herbaryum: saksıda denenen sonuçlar ---------- */
export type Study = {
  plant: string; latin: string; species: import("./flora").FlowerKind;
  finding: string; big: string; bigLabel: string; ref: number;
};
export const STUDIES: Study[] = [
  {
    plant: "Kadife çiçeği", latin: "Tagetes erecta", species: "marigold",
    big: "%14-24", bigLabel: "daha fazla çiçek",
    finding: "Bacillus subtilis ile aşılanan bitkiler, aşılanmayanlara göre %14 ile %24 arasında daha fazla çiçek verdi; çiçekler daha ağır ve daha parlak sarıydı.",
    ref: 4,
  },
  {
    plant: "Petunya", latin: "Petunia × hybrida", species: "petunia",
    big: "14", bigLabel: "suş çiçeği artırdı",
    finding: "Az gübreyle yetiştirilen petunyalarda 14 kök bakterisi çiçek ve tomurcuk sayısını artırdı. En iyi suşla beslenen bitki, iki kat azotla gübrelenen bitkiye denk performans gösterdi.",
    ref: 1,
  },
  {
    plant: "Petunya, kuraklıkta", latin: "Petunia × hybrida", species: "petunia2",
    big: "+5", bigLabel: "çiçek / bitki (ortalama)",
    finding: "Su stresi altındaki petunyalarda yedi kök bakterisi çiçek sayısını anlamlı biçimde artırdı; ortalama artış bitki başına 5, en iyi suşta en az 8 çiçekti.",
    ref: 2,
  },
  {
    plant: "Zambak", latin: "Lilium", species: "lily",
    big: "Erken", bigLabel: "tomurcuk ve uzun çiçeklenme",
    finding: "Soğanları Bacillus subtilis ile ön işleme alınan zambaklar en erken tomurcuklandı, en erken çiçek açtı ve çiçeklenme süresi uzadı.",
    ref: 5,
  },
  {
    plant: "Muş lalesi", latin: "Tulipa sintenisii", species: "tulip",
    big: "Muş, 2021", bigLabel: "Türkiye'den bir saha denemesi",
    finding: "Bacillus uygulanan Muş laleleri kontrol grubuna göre daha uzun boylu oldu ve bitki başına daha fazla soğan verdi. Deneme gübresiz yürütüldü.",
    ref: 6,
  },
];

/* ---------- Bitki rehberi ---------- */
export type Plant = {
  id: string; name: string; latin: string; img: string; flower: string;
  light: string; water: string; temp: string; season: string;
  why: string; tip: string; refs: number[];
};
export const PLANTS: Plant[] = [
  {
    id: "sardunya", name: "Sardunya", latin: "Pelargonium × hortorum", img: "/img/tur-sardunya.webp", flower: "geranium",
    light: "Günde en az 6 saat doğrudan güneş", water: "Üst 2-3 cm kuruyunca, bol ve seyrek", temp: "Gece 10 °C altına düşmesin", season: "İlkbahardan ilk dona kadar",
    why: "Gölgede kalması ve solan çiçek saplarının yerinde bırakılması. Sıcak havada fazla sulama kökü yorar.",
    tip: "Solan çiçeği sapıyla birlikte koparın. Spreyi yapraklara ve toprak yüzeyine eşit verin, çiçek topunu ıslatmayın.",
    refs: [12],
  },
  {
    id: "petunya", name: "Petunya", latin: "Petunia × hybrida", img: "/img/tur-petunya.webp", flower: "petunia",
    light: "Tam güneş, en az 6 saat", water: "Toprak nemli kalsın, su birikmesin", temp: "Sıcağı sever, dondan korkar", season: "Mayıs'tan sonbahara",
    why: "Kireçli suyla yükselen pH demiri kilitler; yeni yapraklar sararır, çiçek azalır. Uzayıp seyrelen dallar da çiçeği keser.",
    tip: "Yazın ortasında uzayan dalları üçte bir kısaltın. Mümkünse dinlendirilmiş ya da yağmur suyu kullanın.",
    refs: [14, 16],
  },
  {
    id: "begonya", name: "Begonya", latin: "Begonia", img: "/img/tur-begonya.webp", flower: "begonia",
    light: "Parlak, dolaylı ışık; sabah güneşi", water: "Üstü kuruyunca; ıslak toprağı hiç sevmez", temp: "18-24 °C ideal", season: "Bahardan sonbahara",
    why: "Fazla su. Begonya kökü havasız toprakta hızla çürür ve bitki tomurcuklarını döker.",
    tip: "Sulamayı azaltın, saksı tabağında su bekletmeyin. Spreyi yaprak altlarına da ince sis olarak verin.",
    refs: [15],
  },
  {
    id: "menekse", name: "Afrika menekşesi", latin: "Saintpaulia", img: "/img/tur-afrika-menekse.webp", flower: "violet",
    light: "Parlak ama dolaylı; tül perdeli doğu penceresi", water: "Sıkılmış sünger nemi; ılık suyla", temp: "Oda sıcaklığı", season: "Uygun ışıkta yıl boyu",
    why: "Az ışık, büyük saksı ve kökün aşırı ıslak kalması. Her gece en az 8 saat karanlık da çiçek için gerekir.",
    tip: "Saksı, bitki çapının üçte birinden büyük olmasın. Tüylü yapraklar soğuk sudan lekelenir: karışımı oda sıcaklığında, çok ince sis halinde ve ağırlıklı toprak yüzeyine verin.",
    refs: [10],
  },
  {
    id: "gul", name: "Saksı gülü", latin: "Rosa", img: "/img/tur-gul.webp", flower: "rose",
    light: "Günde 6 saat ve üzeri güneş", water: "Derin ve düzenli, yaprağı ıslatmadan", temp: "Serin gece, ılık gündüz", season: "İlkbahardan sonbahara dalgalar halinde",
    why: "Işık eksikliği ve solan çiçeklerin dalda kalması. Saksıda kök sıkışırsa yeni sürgün zayıflar.",
    tip: "Solan çiçeği ilk beşli yaprağın üstünden kesin. Uygulamayı akşam serinliğinde yapın.",
    refs: [11],
  },
  {
    id: "antoryum", name: "Antoryum", latin: "Anthurium andraeanum", img: "/img/tur-antoryum.webp", flower: "anthurium",
    light: "Parlak, dolaylı ışık; direkt güneşte yaprak solar", water: "Üstü kuruyunca, havadar toprakta", temp: "21-29 °C, soğuk cereyan yok", season: "İyi ışıkta yıl boyu",
    why: "Düşük nem ve havasız, sıkışmış toprak. Çok parlak ışık yaprak rengini soldurur.",
    tip: "Nemi sever: yapraklara ince püskürtme hem tozu alır hem nemi artırır. Kabuk karışımlı, havadar toprak kullanın.",
    refs: [13],
  },
  {
    id: "baris", name: "Barış çiçeği", latin: "Spathiphyllum", img: "/img/tur-baris-cicegi.webp", flower: "peacelily",
    light: "Orta-parlak dolaylı ışık", water: "Hafif nemli; sarkınca sulanır", temp: "Oda sıcaklığı", season: "Genellikle bahar ve yaz",
    why: "En sık sebep az ışık: çok karanlıkta yaşar ama çiçek vermez. Satın alırken açık olan bitki üretimde çoğu zaman hormonla çiçeğe getirilir; sonra kendi çiçeğini açması için olgunlaşması ve iyi ışık alması gerekir.",
    tip: "Bitkiyi pencereye bir adım yaklaştırın. Sprey yapraklara ve toprak yüzeyine; beyaz çiçek kınına yoğun vermeyin.",
    refs: [13, 17],
  },
];

/* ---------- SSS (ürün sayfasından birebir) ---------- */
export const FAQ = [
  { q: "Proverim Çiçekli Bitkiler Sprey ne işe yarar?", a: "Çiçekli bitkilerde kök çevresi dengesini, yaprak canlılığını, tomurcuklanma sürecini, çiçeklenme performansını ve genel bitki görünümünü destekleyen pratik bakım ürünüdür." },
  { q: "Kaç günde bir kullanılmalıdır?", a: "Ürün 15 günde bir püskürtme yöntemiyle uygulanabilir. Bitkinin türü, ortam sıcaklığı, ışık miktarı, saksı yapısı ve toprağın nem durumuna göre uygulama kontrollü yapılmalıdır." },
  { q: "Toprağa mı yaprağa mı uygulanır?", a: "Çiçekli bitkilerde bitki yüzeyine, yapraklara ve toprak yüzeyine eşit şekilde püskürtülebilir. Toprağı gereğinden fazla ıslatacak kadar yoğun uygulama yapılmamalıdır." },
  { q: "Çiçekliyken kullanılabilir mi?", a: "Çiçekli dönemde kontrollü uygulanabilir. Çiçeklerin üzerine çok yoğun püskürtme yapılması önerilmez. Yapraklara ve toprak yüzeyine hafif uygulama tercih edilmelidir." },
  { q: "Sulama yerine geçer mi?", a: "Hayır. Proverim Çiçekli Bitkiler Sprey sulama yerine geçmez. Sulama; bitki türü, mevsim, ortam sıcaklığı, saksı ve toprak yapısına göre ayrıca planlanmalıdır." },
  { q: "Çiçeklenmeyi garanti eder mi?", a: "Hayır. Çiçeklenme; ışık, sıcaklık, sulama, kök sağlığı, bitkinin yaşı, türü ve bakım koşullarıyla birlikte şekillenir. Proverim doğru bakım programıyla birlikte çiçeklenme performansını destekler." },
  { q: "Aşırı kullanılırsa ne olur?", a: "Gereğinden fazla uygulama yaprak yüzeyinde ve toprakta fazla nem oluşturabilir. Bu durum bazı bitkilerde strese neden olabilir. Bu nedenle 15 günlük kontrollü rutin önerilir." },
  { q: "Hastalık tedavisi için kullanılır mı?", a: "Hayır. Bu ürün bir zirai ilaç değildir ve hastalık tedavisi amacıyla kullanılmaz. Çiçekli bitkilerde bakım, canlılık, kök çevresi, yaprak görünümü ve çiçeklenme performansı desteği için kullanılır." },
];

/* ---------- Kaynakça ---------- */
export type Source = { n: number; text: string; url: string };
export const SOURCES: Source[] = [
  { n: 1, text: "South KA, Nordstedt NP, Jones ML (2021). Identification of plant growth promoting rhizobacteria that improve the performance of greenhouse-grown petunias under low fertility conditions. Plants 10(7):1410.", url: "https://doi.org/10.3390/plants10071410" },
  { n: 2, text: "Nordstedt NP, Jones ML (2020). Isolation of rhizosphere bacteria that improve quality and water stress tolerance in greenhouse ornamentals. Frontiers in Plant Science 11:826.", url: "https://doi.org/10.3389/fpls.2020.00826" },
  { n: 3, text: "Nordstedt NP, Chapin LJ, Taylor CG, Jones ML (2019). Identification of Pseudomonas spp. that increase ornamental crop quality during abiotic stress. Frontiers in Plant Science 10:1754.", url: "https://doi.org/10.3389/fpls.2019.01754" },
  { n: 4, text: "Flores AC, Estrada Luna AA, Olalde Portugal V (2007). Yield and quality enhancement of marigold flowers by inoculation with Bacillus subtilis and Glomus fasciculatum. Journal of Sustainable Agriculture 31(1):21-31.", url: "https://doi.org/10.1300/J064v31n01_04" },
  { n: 5, text: "Reut A, Biglova A, Allayarova I, Aliniaeifard S, Gruda NS, Lastochkina O (2024). Alteration of growth, phenology, and yield of lily flowers through the synergetic effect of light spectra and endophytic bacterial priming. South African Journal of Botany 167:597-611.", url: "https://doi.org/10.1016/j.sajb.2024.03.001" },
  { n: 6, text: "Yenikalaycı A (2024). Impact of different strains of Bacillus spp. on the bulb production of Tulipa sintenisii Baker. Frontiers in Plant Science 15:1456919.", url: "https://doi.org/10.3389/fpls.2024.1456919" },
  { n: 7, text: "Gamalero E, Lingua G, Glick BR (2023). Ethylene, ACC, and the plant growth-promoting enzyme ACC deaminase. Biology 12(8):1043.", url: "https://doi.org/10.3390/biology12081043" },
  { n: 8, text: "Wagi S, Ahmed A (2019). Bacillus spp.: potent microfactories of bacterial IAA. PeerJ 7:e7258.", url: "https://doi.org/10.7717/peerj.7258" },
  { n: 9, text: "Badri DV, Vivanco JM (2009). Regulation and function of root exudates. Plant, Cell & Environment 32:666-681.", url: "https://doi.org/10.1111/j.1365-3040.2009.01926.x" },
  { n: 10, text: "Feather S (2025). Why isn't my African violet flowering? Penn State Extension.", url: "https://extension.psu.edu/why-isnt-my-african-violet-flowering" },
  { n: 11, text: "Lerner R (2005). Why plants fail to bloom. Purdue University, Yard & Garden.", url: "https://www.purdue.edu/hla/sites/yardandgarden/why-plants-fail-to-bloom/" },
  { n: 12, text: "University of Illinois Extension. Geraniums: growing and care.", url: "https://extension.illinois.edu/flowers/geranium" },
  { n: 13, text: "University of Florida IFAS, Mid-Florida REC. Anthurium and Spathiphyllum production guides.", url: "https://mrec.ifas.ufl.edu/Foliage/folnotes/anthuriu.htm" },
  { n: 14, text: "Šrámek F, Dubský M (2009). Occurrence and correction of chlorosis in young petunia plants. Horticultural Science (Prague) 36(4):147-153.", url: "https://doi.org/10.17221/6/2009-HORTSCI" },
  { n: 15, text: "Montana State University Extension. Proper watering of container and garden plants.", url: "https://exponent.montana.edu/extension/flathead/documents/ag/yard-garden/Proper%20Watering.pdf" },
  { n: 16, text: "Michigan State University Extension. Understanding alkalinity and managing it in soilless substrates.", url: "https://bluedynamo.msu.edu/uploads/resources/pdfs/understanding_alkalinity_and_managing_it_in_soilless_substrates.pdf" },
  { n: 17, text: "University of Florida IFAS. Spathiphyllum production guide.", url: "https://mrec.ifas.ufl.edu/foliage/folnotes/spathiph.htm" },
  { n: 18, text: "Blanchard MG, Runkle ES (2006). Temperature during the day, but not during the night, controls flowering of Phalaenopsis orchids. Journal of Experimental Botany 57(15):4043-4049.", url: "https://doi.org/10.1093/jxb/erl176" },
  { n: 19, text: "Lopez RG, Runkle ES (2005). Environmental physiology of growth and flowering of orchids. HortScience 40(7):1969-1973.", url: "https://doi.org/10.21273/HORTSCI.40.7.1969" },
  { n: 20, text: "Zotz G, Winkler U (2013). Aerial roots of epiphytic orchids: the velamen radicum and its role in water and nutrient uptake. Oecologia 171:733-741.", url: "https://doi.org/10.1007/s00442-012-2575-6" },
  { n: 21, text: "Pavlova AS, Leontieva MR, Smirnova TA, Kolomeitseva GL, Netrusov AI, Tsavkelova EA (2017). Colonization strategy of the endophytic plant growth-promoting strains of Pseudomonas fluorescens and Klebsiella oxytoca on the seeds, seedlings and roots of the epiphytic orchid, Dendrobium nobile. Journal of Applied Microbiology.", url: "https://doi.org/10.1111/jam.13481" },
  { n: 22, text: "Shah S, Chand K, Rekadwad B, Shouche YS, Sharma J, Pant B (2021). A prospectus of plant growth promoting endophytic bacterium from orchid (Vanda cristata). BMC Biotechnology.", url: "https://doi.org/10.1186/s12896-021-00676-9" },
  { n: 23, text: "Ye W, Shen CH, Lin Y, Chen PJ, Xu X, Oelmüller R, Yeh KW, Lai Z (2014). Growth promotion-related miRNAs in Oncidium orchid roots colonized by the endophytic fungus Piriformospora indica. PLoS ONE 9(1):e84920.", url: "https://doi.org/10.1371/journal.pone.0084920" },
  { n: 24, text: "Clemson Cooperative Extension, Home & Garden Information Center. Orchids (HGIC 1560).", url: "https://hgic.clemson.edu/factsheet/orchids/" },
  { n: 25, text: "Puente ME, Li CY, Bashan Y (2004). Microbial populations and activities in the rhizoplane of rock-weathering desert plants. II. Growth promotion of cactus seedlings. Plant Biology 6(5):643-650.", url: "https://doi.org/10.1055/s-2004-821101" },
  { n: 26, text: "Puente ME, Bashan Y, Li CY, Lebsky VK (2004). Microbial populations and activities in the rhizoplane of rock-weathering desert plants. I. Root colonization and weathering of igneous rocks. Plant Biology 6(5):629-642.", url: "https://doi.org/10.1055/s-2004-821100" },
  { n: 27, text: "Lopez BR, Bashan Y, Bacilio M (2011). Endophytic bacteria of Mammillaria fraileana, an endemic rock-colonizing cactus of the southern Sonoran Desert. Archives of Microbiology 193(7):527-541.", url: "https://doi.org/10.1007/s00203-011-0695-8" },
  { n: 28, text: "Bashan Y, Salazar B, Puente ME, Bacilio M, Linderman R (2009). Enhanced establishment and growth of giant cardon cactus in an eroded field in the Sonoran Desert using native legume trees as nurse plants aided by plant growth-promoting microorganisms and compost. Biology and Fertility of Soils 45(6):585-594.", url: "https://doi.org/10.1007/s00374-009-0367-x" },
  { n: 29, text: "Snyman HA (2006). A greenhouse study on root dynamics of cactus pears, Opuntia ficus-indica and O. robusta. Journal of Arid Environments 65(4):529-542.", url: "https://doi.org/10.1016/j.jaridenv.2005.10.004" },
  { n: 30, text: "Khajeeyan R, Salehi A, Movahhedi Dehnavi M, Hamidian M, Hazrati S (2024). Evaluation of the benefits of plant growth-promoting rhizobacteria and mycorrhizal fungi on biochemical and morphophysiological traits of Aloe barbadensis Mill under water deficit stress. Scientific Reports 14.", url: "https://doi.org/10.1038/s41598-024-64878-9" },
  { n: 31, text: "Russ K, Pertuit A; rev. Smith BH (2015). Indoor cacti. Clemson Cooperative Extension, Home & Garden Information Center.", url: "https://hgic.clemson.edu/factsheet/indoor-cacti/" },
  { n: 32, text: "Iowa State University Extension and Outreach, Yard and Garden. Growing succulents indoors.", url: "https://yardandgarden.extension.iastate.edu/how-to/growing-succulents-indoors" },
  { n: 33, text: "New York Botanical Garden, Plant Information. Why isn't my Christmas cactus blooming?", url: "https://libanswers.nybg.org/faq/222848" },
  { n: 34, text: "University of Maryland Extension (2025). Q&A: How can I fix flowering issues with my Christmas cactus?", url: "https://marylandgrows.umd.edu/2025/12/19/qa-how-can-i-fix-flowering-issues-with-my-christmas-cactus/" },
];

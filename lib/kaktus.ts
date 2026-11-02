/* Kaktüs & Sukulent sayfası içeriği. Ürün metinleri proverim.com.tr kaktüs & sukulent ürün sayfasından BİREBİR
   (lib/products.ts); bakım ve bilim metinleri content.ts SOURCES listesine dayanır ([n]). */
import type { Cause, Plant, Study } from "./content";
import type { FlowerKind } from "./flora";
import { KAKTUS_URL } from "./content";

export const KAKTUS_SHOP = KAKTUS_URL;

/* Neden formunu kaybeder / neden açmaz: her bölüm önce sorunu, sonra çözümü canlandırır (lib/kaktusScene.ts). */
export const KAKTUS_CAUSES: (Cause & { fix: string })[] = [
  {
    id: "isik", side: "l", icon: "Sun", refs: [31, 32], fix: "güney ya da batı penceresi",
    title: "Işık yetmiyor",
    text: "Kaktüs için en iyi yer, günde birkaç saat doğrudan güneş alan güney ya da batı penceresidir; sukulentler de günde on saatten fazla parlak ışık ister. Az ışıkta bitki soluklaşır ve ışığa doğru uzar, rozetler açılıp seyrekleşir. Uzayan kısım geri toplanmaz ama ışığa alınan bitkinin yeni büyümesi yine sıkı gelir.",
  },
  {
    id: "su", side: "l", icon: "Drop", refs: [31, 32], fix: "toprak tamamen kuruyunca bol su",
    title: "Kök çürüyor",
    text: "Kaktüs ve sukulentler en çok fazla sudan kaybedilir. Toprak hep nemli kalırsa kök ve gövde dipten çürür, doku yumuşar. Sularken toprağı baştan sona ıslatın, fazlası delikten akıp gitsin; toprak tamamen kurumadan yeniden sulamayın. Saksı asla suyun içinde beklememeli.",
  },
  {
    id: "toprak", side: "l", icon: "PottedPlant", refs: [32, 31], fix: "kum, ponza, perlit ve delikli saksı",
    title: "Toprak suyu bırakmıyor",
    text: "Sıradan saksı toprağı suyu günlerce tutar. Kaktüs harcının yarısı ya da daha fazlası iri kum, ponza veya perlit gibi mineral malzeme olmalı. Saksının dibinde mutlaka delik bulunmalı; deliksiz saksının dibine çakıl sermek toprağı kurutmaz, kökler yine ıslak kalır.",
  },
  {
    id: "kis", side: "r", icon: "Snowflake", refs: [31], fix: "kışın serin, aydınlık, az su",
    title: "Kışın dinlenemedi",
    text: "Çöl kaktüsleri kışı 7-13 °C arası serin ve aydınlık bir yerde, çok az suyla geçirmek ister. Kalorifer yanında sıcak tutulup sulanan kaktüs dinlenemez ve ilkbaharda tomurcuk vermez. Ocak ve şubatta 4-6 hafta sulamaya ara vermek ilkbahar çiçeklenmesini teşvik eder.",
  },
  {
    id: "gunes", side: "r", icon: "Fire", refs: [32, 31], fix: "önce yarı gölge, sonra güneş",
    title: "Güneşte yandı",
    text: "İçeride ya da gölgede duran bitki birden yakıcı güneşe çıkarılırsa yaprak ve gövdede beyaz ya da kahverengi lekeler oluşur. Yazın balkona taşıdığınız kaktüs ve sukulentleri önce yarı gölgeye koyun. Yanık izi geçmez ama yeni büyüme temiz gelir.",
  },
  {
    id: "yilbasi", side: "r", icon: "Moon", refs: [33, 34, 31], fix: "13 saat karanlık, serin gece",
    title: "Yılbaşı kaktüsü açmıyor",
    text: "Yılbaşı kaktüsü bir yağmur ormanı kaktüsüdür; tomurcuk için sonbaharda uzun, kesintisiz geceler ister. Akşamları lamba yanan, 20 °C'nin üzerindeki sıcak bir odada tomurcuk bağlamaz. 13 saat kesintisiz karanlık ya da 10-13 °C serin geceler tomurcuğu başlatır. Tomurcuklar oluşurken saksının yerini değiştirmeyin; dökülebilirler.",
  },
];

export const KAKTUS_ROOTS = [
  { icon: "Drop", kicker: "Yağmur kökleri", title: "Su gelince saatler içinde uyanır", text: "Kaktüs kurak dönemde ince emici köklerini kaybeder. Toprak ıslandığında ilk saatler içinde yeni ince \"yağmur kökleri\" çıkarır ve suyu hızla alır; toprak kurudukça bu köklerin büyümesi birkaç gün içinde durur. Seyrek ama bol sulamanın mantığı budur.", refs: [29] },
  { icon: "Mountains", kicker: "Taştaki bakteriler", title: "Kökün yüzeyi kalabalık", text: "Toprağı olmayan çıplak kayalarda yetişen kaktüslerin kök yüzeyinde yoğun bakteri katmanları bulundu. Baskın gruplar floresan pseudomonaslar ve basillerdi; bu topluluk on ay süren kurak mevsimde de köklerde yaşamaya devam etti.", refs: [26] },
  { icon: "Flask", kicker: "Mineraller", title: "Kayadaki besin serbest kalır", text: "Bu bakteriler kayayı çözerek fosfor, potasyum, magnezyum ve demir gibi mineralleri açığa çıkardı, havadaki azotu bağladı. Bakterilerle aşılanan kaktüs fideleri hiç besin eklenmeden toz lav taşında en az 12 ay normal büyüdü; aşılanmayanlar daha zayıf kaldı, bir kısmı öldü.", refs: [25, 26, 27] },
  { icon: "Cactus", kicker: "Doku ve form", title: "Diri doku, doğal form", text: "Kök bölgesi canlı çalıştığında bitki suyu ve besini daha dengeli kullanır. Çiçek Coşturan Kaktüs & Sukulent kök çevresi canlılığını ve dengeli gelişimi destekler; yaprak ve gövde dokusunun diri görünmesine yardımcı olur.", refs: [] },
];

export const KAKTUS_STUDIES: Study[] = [
  { plant: "Kardon kaktüsü", latin: "Pachycereus pringlei", species: "cereus", big: "12 ay", bigLabel: "besin eklenmeden, toz lav taşında büyüme", finding: "Kayada yaşayan kaktüslerin köklerinden ayrılan dört bakteri türüyle aşılanan kardon tohumları, hiç besin eklenmeden toz lav taşı ve perlit karışımında en az 12 ay normal büyüdü. Aşılanmayan fideler daha zayıf kaldı, bir kısmı öldü.", ref: 25 },
  { plant: "Çıplak kayadaki kaktüsler", latin: "Pachycereus, Stenocereus, Opuntia", species: "opuntia", big: "10 ay", bigLabel: "kurak mevsim boyunca köklerde yaşayan topluluk", finding: "Topraksız kayalarda yetişen üç kaktüs türünün kök yüzeyinde yoğun bakteri katmanları görüldü; baskın gruplar floresan pseudomonaslar ve basillerdi. Bakteriler kayadan fosfor, potasyum, demir ve çinko gibi mineralleri çözdü.", ref: 26 },
  { plant: "Top kaktüs", latin: "Mammillaria fraileana", species: "mammillaria", big: "14", bigLabel: "kökte bulunan iç bakteri izolatı", finding: "Kayaya ilk yerleşen bu küçük kaktüsün kök ve gövdesinde bol miktarda iç bakteri bulundu. Bacillus megaterium dahil bazı izolatlar fosfat çözdü ve kaya parçalarını ufaladı; aşılanan fidelere 105 gün sonra yeniden yerleşti.", ref: 27 },
  { plant: "Hint inciri", latin: "Opuntia ficus-indica", species: "opuntia", big: "Saatler", bigLabel: "yağmur köklerinin çıkması için geçen süre", finding: "Sera denemesinde toprak yeniden ıslatıldıktan sonraki ilk saatlerde ince yağmur kökleri çıktı ve suyu hızla aldı; toprak kurudukça büyümeleri birkaç gün içinde durdu.", ref: 29 },
  { plant: "Aloe vera", latin: "Aloe barbadensis", species: "aloe", big: "%19+", bigLabel: "daha fazla yaş sürgün ağırlığı", finding: "Pseudomonas putida ve Pantoea agglomerans bakterileri mikoriza mantarıyla birlikte verilen aloelerde yaş sürgün ağırlığı kontrol grubuna göre %19'dan fazla arttı. Aşılama farklı sulama seviyelerinde hayatta kalmayı ve besin alımını da artırdı.", ref: 30 },
  { plant: "Kardon, çölde dikim", latin: "Pachycereus pringlei", species: "cereus", big: "30 ay", bigLabel: "sahada izlenen genç kardonlar", finding: "Erozyona uğramış çöl arazisine tek başına dikilen genç kardonlarda kompost, mikoriza ve tüm uygulamaların birlikte verilmesi hayatta kalmayı artırdı. İlk 3 aydan sonra mikoriza dışındaki tüm uygulamalar, Azospirillum ve Paenibacillus bakterileri dahil, büyümeyi de artırdı.", ref: 28 },
];

export const KAKTUS_PLANTS: (Omit<Plant, "img" | "flower"> & { img?: string; flower: FlowerKind })[] = [
  {
    id: "top", name: "Top kaktüs", latin: "Mammillaria", flower: "mammillaria",
    light: "Güney ya da batı penceresi; günde birkaç saat doğrudan güneş", water: "Büyürken toprak tamamen kuruyunca bol; kışın yalnız büzüşmeyecek kadar", temp: "Büyürken 18-29 °C; kışın 7-13 °C serin dinlenme", season: "İlkbahar; tepede taç gibi halka çiçekler",
    why: "Sıcak ve sulanan bir kış. Dinlenemeyen kaktüs ilkbaharda tomurcuk vermez; az ışık da çiçeği keser.",
    tip: "Ocak-şubatta 4-6 hafta sulamaya ara verin. Spreyi bitki yüzeyine ve toprak yüzeyine eşit verin.",
    refs: [31],
  },
  {
    id: "yilbasi", name: "Yılbaşı kaktüsü", latin: "Schlumbergera", flower: "schlum",
    light: "Parlak ama dolaylı; doğrudan güneşte yanabilir", water: "İlkbahar ve yazda tamamen kurumasın; çiçekten sonra azaltın", temp: "Sonbaharda geceler 10-13 °C; 20 °C üzerinde tomurcuk bağlamaz", season: "Kış; aralık ve ocak",
    why: "Akşam yanan lamba 13 saatlik karanlığı bölüyor ya da oda çok sıcak. Tomurcukluyken yer değiştirmek tomurcuk döktürür.",
    tip: "Sonbaharda akşam lambası yanmayan serin bir odaya alın, tomurcuklar görününce yerini değiştirmeyin.",
    refs: [33, 34, 31],
  },
  {
    id: "aloe", name: "Aloe vera", latin: "Aloe barbadensis", flower: "aloe",
    light: "Bol ışık; güney ya da batı penceresi", water: "Toprak tamamen kuruyunca bol; kışın seyrek", temp: "13-24 °C", season: "Evde nadiren çiçek açar; yaprakları için yetiştirilir",
    why: "Az ışıkta yapraklar yatar ve incelir; sürekli nemli toprakta dipten çürür.",
    tip: "Spreyi etli yapraklara ve toprak yüzeyine eşit verin; yaprak diplerinde su birikmesin.",
    refs: [32, 30],
  },
  {
    id: "eseverya", name: "Eşeverya", latin: "Echeveria", flower: "echeveria",
    light: "Bol ışık; ışık azsa rozet açılır, gövde uzar", water: "Toprak kuruyunca toprağa verin; rozetin ortasında su bırakmayın", temp: "13-24 °C", season: "İlkbahar ve yaz; uzun sap üzerinde çan çiçekler",
    why: "Az ışıkta renkler solar, rozet seyrekleşir ve gövde ışığa doğru uzar.",
    tip: "Yaprak uçlarındaki pembe ve kırmızı tonlar bol ışıkta belirginleşir. Spreyi rozete ve toprak yüzeyine eşit verin.",
    refs: [32],
  },
  {
    id: "haworthia", name: "Zebra haworthia", latin: "Haworthia", flower: "haworthia",
    light: "Parlak, dolaylı ışık; yakıcı öğle güneşinden koruyun", water: "Toprak kuruyunca; kışın seyrek", temp: "13-24 °C", season: "Yaz; ince sap üzerinde küçük beyaz çiçekler",
    why: "Fazla su ve sıkışmış toprak. Yakıcı güneşte yapraklar kızarıp kahverengileşir.",
    tip: "Küçük saksılarda da iyi durur; harcı çakıllı ve süzek tutun.",
    refs: [32],
  },
  {
    id: "para", name: "Para ağacı", latin: "Crassula ovata", flower: "crassula",
    light: "Bol ışık; bol ışıkta yaprak kenarları kızarır", water: "Toprak kuruyunca; kışın azaltın", temp: "13-24 °C", season: "Olgun bitkilerde kışın beyaz-pembe yıldız çiçekler",
    why: "Az ışık ve kışın bol su. Genç bitkiler uzun yıllar çiçek açmayabilir.",
    tip: "Ağırlaşan dalları budayarak formunu koruyun. Spreyi yapraklara ve toprak yüzeyine eşit verin.",
    refs: [32],
  },
];

/* Kullanım: ürün sayfasındaki "15 Günlük Bakım Ritüeli" cümleleri, sırasıyla. */
export const KAKTUS_STEPS = [
  { icon: "CalendarDots", title: "15 günde bir", text: "Ürünü 15 günde bir bitki yüzeyine ve toprak yüzeyine eşit şekilde püskürtünüz." },
  { icon: "SunHorizon", title: "Serin saatte", text: "Sabah erken saatlerde veya akşam serinliğinde uygulayınız." },
];

export const KAKTUS_FAQ = [
  { q: "Kaç günde bir kullanılmalıdır?", a: "Ürün 15 günde bir püskürtme yöntemiyle uygulanabilir." },
  { q: "Toprağa mı yaprağa mı uygulanır?", a: "Bitki yüzeyine, etli yapraklara ve toprak yüzeyine eşit şekilde püskürtülebilir." },
  { q: "Sulama yerine geçer mi?", a: "Hayır, sulama yerine geçmez. Sulama düzeni ayrıca takip edilmelidir." },
  { q: "Kaktüs ne sıklıkla sulanır?", a: "Takvime göre değil, toprağa göre. Büyüme döneminde toprak baştan sona kuruyunca bolca sulayın ve fazlasının delikten akmasını bekleyin. Başlangıç için 2-3 haftada bir uygundur; kışın dinlenmede yalnızca büzüşmeyecek kadar su verin." },
  { q: "Sukulentim neden uzuyor?", a: "Işık yetmiyor. Az ışıkta gövde ışığa doğru uzar, yapraklar seyrekleşir ve renk solar. Bitkiyi daha aydınlık bir pencereye alın; uzayan kısım geri toplanmaz ama yeni büyüme sıkı gelir." },
  { q: "Kaktüsüm neden çiçek açmıyor?", a: "Çoğu zaman kış dinlenmesi eksiktir. Çöl kaktüsleri kışı 7-13 °C'de, aydınlık ve neredeyse kuru geçirdiğinde ilkbaharda tomurcuk verir. Az ışık ve sürekli sıcak oda çiçeklenmeyi engeller." },
  { q: "Yılbaşı kaktüsü neden tomurcuk döküyor?", a: "Tomurcuklanırken saksının yerinin değiştirilmesi, ani sıcaklık değişimleri, cereyan ve düzensiz sulama en sık sebeplerdir. Tomurcuklar görününce bitkiyi yerinden oynatmayın." },
  { q: "Kaktüs için nasıl bir toprak gerekir?", a: "Hızlı süzülen bir harç. Saksı toprağına en az aynı miktarda iri kum, ponza ya da perlit karıştırın ve mutlaka delikli saksı kullanın." },
];

export const KAKTUS_PLANT_TAGS = ["Aloe", "Echeveria", "Haworthia", "Crassula", "Sedum", "Kaktüs türleri"];
export const KAKTUS_SOURCE_IDS = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34];

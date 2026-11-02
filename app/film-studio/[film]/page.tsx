import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Studio from "@/components/Studio";
import { getPrices } from "@/lib/prices";
import { bySlug } from "@/lib/products";

export const metadata: Metadata = { title: "Film stüdyosu", robots: { index: false, follow: false } };
export const dynamicParams = false;
export function generateStaticParams() { return [{ film: "cicekli" }, { film: "orkide" }, { film: "kaktus" }]; }

export default async function FilmStudio({ params }: { params: Promise<{ film: string }> }) {
  const { film } = await params;
  if (film !== "cicekli" && film !== "orkide" && film !== "kaktus") notFound();
  const prices = await getPrices();
  if (film === "kaktus") {
    const o = bySlug("kaktus-sukulent")!;
    return (
      <Studio
        theme="kaktus"
        bottle={o.bottle} ratio={o.ratio} nozzle={o.nozzle}
        photos={["/img/kaktus-1.webp", "/img/kaktus-2.webp", "/img/kaktus-3.webp"]}
        copy={{
          hook: ["Uzadı, soldu,", "formu bozuldu."],
          causes: ["Az ışık", "Fazla su", "Sıkı toprak", "Sıcak kış"],
          root: ["Cevap", "kökte."],
          captions: ["Su gelince yağmur kökleri uyanır", "Kök çevresi canlılığı desteklenir", "Dengeli gelişim", "Diri doku, doğal form"],
          bloom: ["Renk canlılığı ve", "doğal form", "Yaprak ve gövde dokusunun diri görünmesine yardımcı olur"],
          photos: "Aloe, echeveria, haworthia.",
          product: "Kaktüs & Sukulent · 400 ml",
          price: prices["kaktus-sukulent"] ?? o.fallback,
          url: "proverim.com.tr",
        }}
      />
    );
  }
  if (film === "orkide") {
    const o = bySlug("orkide")!;
    return (
      <Studio
        theme="orkide"
        bottle={o.bottle} ratio={o.ratio} nozzle={o.nozzle}
        photos={["/img/orkide-1.webp", "/img/orkide-2.webp", "/img/orkide-3.webp"]}
        copy={{
          hook: ["Çiçeği bitti,", "sapı gelmiyor."],
          causes: ["Az ışık", "Hep sıcak", "Fazla su", "Eski kabuk"],
          root: ["Cevap", "kökte."],
          captions: ["Velamen suyu saniyeler içinde emer", "Kök çevresi desteklenir", "Yeni kök uçları", "Çiçek sapı gelişimine destek"],
          bloom: ["Çiçek sapı ve", "çiçeklenme desteği", "Yaprakların daha canlı görünmesine yardımcı olur"],
          photos: "Ev ve ofis orkideleri.",
          product: "Orkide · 400 ml",
          price: prices.orkide ?? o.fallback,
          url: "proverim.com.tr",
        }}
      />
    );
  }
  const p = bySlug("cicekli-bitkiler")!;
  const pr = prices[p.slug] ?? p.fallback;
  return (
    <Studio
      bottle={p.bottle}
      ratio={p.ratio}
      nozzle={p.nozzle}
      photos={["/img/yasam-1.webp", "/img/yasam-2.webp", "/img/yasam-3.webp"]}
      copy={{
        hook: ["Yaprak var.", "Çiçek yok."],
        causes: ["Az ışık", "Fazla su", "Kireçli su", "Yorgun kök"],
        root: ["Çoğu zaman", "sorun kökte."],
        captions: ["Kök çevresi desteklenir", "Biyolojik süreç canlanır", "Kök daha çok toprağa dokunur", "Su ve besin dengeli kullanılır"],
        bloom: ["Tomurcuk ve", "çiçeklenme desteği", "Daha canlı renk görünümüne katkı sağlar"],
        photos: "Salon, balkon, ofis.",
        product: "Çiçekli Bitkiler · 400 ml",
        price: pr,
        url: "proverim.com.tr",
      }}
    />
  );
}

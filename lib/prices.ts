/* Mağazadaki güncel fiyatı ikas ürün sayfasından okur (sunucuda, 6 saatlik önbellek).
   Okunamazsa ürün verisindeki son bilinen fiyat kullanılır. */
import { PRODUCTS } from "./products";

export type Price = { sell: number; now: number };
export type Prices = Record<string, Price>;

async function fetchOne(path: string): Promise<Price | null> {
  try {
    const r = await fetch(`https://proverim.com.tr${path}`, { next: { revalidate: 21600 }, headers: { "user-agent": "Mozilla/5.0 cicek.proverim" } });
    if (!r.ok) return null;
    const h = await r.text();
    const raw = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!raw) return null;
    // Sayfanın kendi ürünü (pageSpecificData) — yan ürün listelerindeki fiyatlara bakma
    const page = JSON.parse(raw[1])?.props?.pageProps?.pageSpecificData;
    let price: { sellPrice?: number; discountPrice?: number | null } | null = null;
    const walk = (o: unknown) => {
      if (price || !o || typeof o !== "object") return;
      const x = o as Record<string, unknown>;
      if (Array.isArray(x.variants) && x.variants.length) {
        const v = x.variants[0] as { prices?: { sellPrice?: number; discountPrice?: number | null }[] };
        if (v.prices?.[0]?.sellPrice) { price = v.prices[0]; return; }
      }
      for (const k in x) walk(x[k]);
    };
    walk(page);
    const p = price as { sellPrice?: number; discountPrice?: number | null } | null;
    if (!p?.sellPrice) return null;
    const sell = Number(p.sellPrice);
    const now = p.discountPrice ? Number(p.discountPrice) : sell;
    return { sell, now };
  } catch {
    return null;
  }
}

export async function getPrices(): Promise<Prices> {
  const res = await Promise.all(PRODUCTS.map((p) => fetchOne(p.ikasPath)));
  const out: Prices = {};
  PRODUCTS.forEach((p, i) => { out[p.slug] = res[i] ?? p.fallback; });
  return out;
}

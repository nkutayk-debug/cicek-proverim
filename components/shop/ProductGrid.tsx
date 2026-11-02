import ProductCard from "./ProductCard";
import { PRODUCTS } from "@/lib/products";
import type { Prices } from "@/lib/prices";

/* Ürün vitrini: çiçekli bitkiler büyük kart, orkide + kaktüs üstte, set altta geniş. */
export default function ProductGrid({ prices, exclude, featured, title = "Çiçek Coşturan ailesi", lead = "Her bitki grubunun kendi formülü var. Şişenin üstüne gel, bir fıs sıksın." }: { prices: Prices; exclude?: string; featured?: string; title?: string; lead?: string }) {
  const base = PRODUCTS.filter((p) => p.slug !== exclude);
  const list = featured ? [...base.filter((p) => p.slug === featured), ...base.filter((p) => p.slug !== featured)] : base;
  return (
    <section id="urunler" className="sec pgr">
      <div className="wrap">
        <div className="head">
          <h2>{title}</h2>
          <p>{lead}</p>
        </div>
        <div className={`pgr__grid pgr__grid--${list.length}`}>
          {list.map((p, i) => <ProductCard key={p.slug} p={p} price={prices[p.slug] ?? p.fallback} i={i} feature={!exclude && i === 0} />)}
        </div>
      </div>
    </section>
  );
}

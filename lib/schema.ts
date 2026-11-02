/* JSON-LD yardımcıları (schema.org). Site geneli: Organization + WebSite (layout). Sayfalar kendi grafiğini ekler. */
import { SITE, SOURCES } from "./content";
import { PRODUCTS, bySlug } from "./products";
import type { Price } from "./prices";

export const ORG_ID = `${SITE}#org`, SITE_ID = `${SITE}#site`, BRAND_ID = `${SITE}#brand`;

const nextMonth = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10); };

export function productLd(slug: string, price: Price, id = `${SITE}/urun/${slug}#product`) {
  const p = bySlug(slug)!;
  return {
    "@type": "Product", "@id": id, name: p.full.replace("®", ""), url: `${SITE}/urun/${slug}`,
    brand: { "@id": BRAND_ID }, manufacturer: { "@id": ORG_ID }, category: "Bitki besini",
    image: [`${SITE}${p.cover}`, `${SITE}${p.bottle}`, ...p.gallery.slice(1).map((g) => `${SITE}${g}`)],
    description: p.intro.join(" "),
    size: "400 ml",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Kullanım sıklığı", value: "15 günde bir" },
      { "@type": "PropertyValue", name: "Form", value: "Sprey" },
      { "@type": "PropertyValue", name: "Uygun bitkiler", value: p.plants.join(", ") },
    ],
    offers: {
      "@type": "Offer", url: p.shop, priceCurrency: "TRY", price: price.now, priceValidUntil: nextMonth(),
      availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition", seller: { "@id": ORG_ID },
      shippingDetails: KARGO, hasMerchantReturnPolicy: IADE,
    },
  };
}

/* Proverim mağaza koşulları (proverim.com.tr ile aynı): ücretsiz kargo, 0-1 gün hazırlık, 1-3 gün teslim, 14 gün ücretsiz iade */
export const KARGO = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "TRY" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "TR" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
  },
};
export const IADE = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "TR",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
  merchantReturnLink: "https://proverim.com.tr/pages/iade-ve-degisim",
};

export const breadcrumbLd = (items: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
});

export const faqLd = (faq: { q: string; a: string }[], id?: string) => ({
  "@type": "FAQPage", ...(id ? { "@id": id } : {}),
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const howToLd = (name: string, steps: readonly { title: string; text: string }[]) => ({
  "@type": "HowTo", name, totalTime: "PT2M", tool: { "@type": "HowToTool", name: "400 ml sprey şişe" },
  step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
});

export const citations = (ids: number[]) => SOURCES.filter((s) => ids.includes(s.n)).map((s) => ({ "@type": "CreativeWork", name: s.text, url: s.url }));

export const productListLd = () => ({
  "@type": "ItemList", name: "Çiçek Coşturan ürünleri",
  itemListElement: PRODUCTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/urun/${p.slug}`, name: p.full.replace("®", "") })),
});

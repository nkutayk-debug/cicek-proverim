import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";
import { PRODUCTS } from "@/lib/products";
import { GUIDES, GUIDE_DATE } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const g = new Date(GUIDE_DATE.modified);
  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1, images: [`${SITE}/img/urun-cicekli.webp`] },
    { url: `${SITE}/orkide`, lastModified: now, changeFrequency: "weekly", priority: 0.95, images: [`${SITE}/img/urun-orkide.webp`] },
    { url: `${SITE}/kaktus-sukulent`, lastModified: now, changeFrequency: "weekly", priority: 0.95, images: [`${SITE}/img/urun-kaktus.webp`] },
    ...PRODUCTS.map((p) => ({ url: `${SITE}/urun/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9, images: [`${SITE}${p.cover}`] })),
    { url: `${SITE}/rehber`, lastModified: g, changeFrequency: "monthly", priority: 0.85 },
    ...GUIDES.map((x) => ({ url: `${SITE}/rehber/${x.slug}`, lastModified: g, changeFrequency: "monthly" as const, priority: x.group === "konu" ? 0.85 : 0.75, ...(x.img ? { images: [`${SITE}${x.img}`] } : {}) })),
    { url: `${SITE}/sss`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}

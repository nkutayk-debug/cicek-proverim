import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ProductIntro from "@/components/shop/ProductIntro";
import ProductDetails from "@/components/shop/ProductDetails";
import ProductGrid from "@/components/shop/ProductGrid";
import Film from "@/components/film/Film";
import ChatFaq from "@/components/ChatFaq";
import Footer from "@/components/Footer";
import { PRODUCTS, bySlug } from "@/lib/products";
import { PRODUCT_FILMS } from "@/lib/films";
import { getPrices } from "@/lib/prices";
import { SITE } from "@/lib/content";
import { breadcrumbLd, faqLd, productLd } from "@/lib/schema";

export const revalidate = 21600;
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  const title = `${p.full.replace("®", "")} | Çiçek Coşturan`;
  const description = `${p.tagline} ${p.intro[0].slice(0, 120)}…`;
  return {
    title, description,
    alternates: { canonical: `${SITE}/urun/${slug}` },
    openGraph: { type: "website", url: `${SITE}/urun/${slug}`, title, description, locale: "tr_TR", images: [{ url: p.cover, width: 1024, height: 1536 }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  const prices = await getPrices();
  const price = prices[slug] ?? p.fallback;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      productLd(slug, price),
      faqLd(p.faq, `${SITE}/urun/${slug}#sss`),
      breadcrumbLd([["Çiçek Coşturan", SITE], ["Ürünler", `${SITE}/#urunler`], [p.short, `${SITE}/urun/${slug}`]]),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav base="/" shop={p.shop} />
      <main>
        <ProductIntro p={p} price={price} />
        <section id="film" className="sec filmsec filmsec--product">
          <div className="wrap">
            <Film shots={PRODUCT_FILMS[slug]} prices={prices} label={`${p.short} filmi`} here={slug} />
          </div>
        </section>
        <ProductDetails p={p} />
        <ChatFaq faq={p.faq} product={`Çiçek Coşturan ${p.short}`} />
        <ProductGrid prices={prices} exclude={slug} title="Diğer Çiçek Coşturan ürünleri" lead="Evdeki öteki bitkiler için." />
      </main>
      <Footer />
    </>
  );
}

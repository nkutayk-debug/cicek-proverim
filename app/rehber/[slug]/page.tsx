import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShoppingBagOpen, ArrowRight, WhatsappLogo, Sun, Drop, Thermometer, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Refs from "@/components/Refs";
import Specimen from "@/components/Specimen";
import { GUIDES, GROUPS, GUIDE_DATE, guideBySlug, type GuideDoc } from "@/lib/guides";
import { bySlug, tl } from "@/lib/products";
import { getPrices } from "@/lib/prices";
import { SITE, SOURCES, wa } from "@/lib/content";

export const revalidate = 21600;
export const dynamicParams = false;
export function generateStaticParams() { return GUIDES.map((g) => ({ slug: g.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  const url = `${SITE}/rehber/${slug}`, image = g.img ?? bySlug(g.product)!.cover;
  return {
    title: g.metaTitle, description: g.desc,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: g.metaTitle, description: g.desc, locale: "tr_TR", siteName: "Proverim Çiçek Coşturan", images: [{ url: image }], publishedTime: GUIDE_DATE.published, modifiedTime: GUIDE_DATE.modified },
    twitter: { card: "summary_large_image", title: g.metaTitle, description: g.desc, images: [image] },
  };
}

const THEME: Record<string, string> = { "cicekli-bitkiler": "", orkide: "theme-orkide", "kaktus-sukulent": "theme-kaktus", "3lu-set": "" };
const ICON = { "Işık": Sun, "Su": Drop, "Sıcaklık": Thermometer, "Çiçek dönemi": CalendarBlank } as const;

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const prices = await getPrices();
  const p = bySlug(g.product)!;
  const price = prices[p.slug] ?? p.fallback;
  const group = GROUPS.find((x) => x.id === g.group)!;
  const url = `${SITE}/rehber/${slug}`;
  const sources = SOURCES.filter((s) => g.refs.includes(s.n));
  const related = g.related.map((s) => guideBySlug(s)).filter(Boolean) as GuideDoc[];
  const image = `${SITE}${g.img ?? p.cover}`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": `${url}#article`, headline: g.title, description: g.desc, inLanguage: "tr-TR", url, mainEntityOfPage: url, image,
        datePublished: GUIDE_DATE.published, dateModified: GUIDE_DATE.modified,
        author: { "@type": "Organization", name: "Proverim", url: "https://proverim.com.tr" }, publisher: { "@id": `${SITE}#org` },
        about: g.latin ? { "@type": "Thing", name: g.name, alternateName: g.latin } : { "@type": "Thing", name: g.name },
        mentions: { "@id": `${SITE}/urun/${p.slug}#product`, name: p.full.replace("®", ""), url: `${SITE}/urun/${p.slug}` },
        citation: sources.map((s) => ({ "@type": "CreativeWork", name: s.text, url: s.url })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Çiçek Coşturan", item: SITE },
        { "@type": "ListItem", position: 2, name: "Bakım rehberi", item: `${SITE}/rehber` },
        { "@type": "ListItem", position: 3, name: g.name, item: url },
      ] },
      { "@type": "FAQPage", "@id": `${url}#sss`, mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  const topic = g.group === "konu";
  return (
    <div className={THEME[p.slug]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav base="/" shop={p.shop} />
      <main className="art">
        <div className="wrap">
          <nav className="crumbs" aria-label="Konum">
            <a href="/">Çiçek Coşturan</a><span aria-hidden>/</span><a href="/rehber">Bakım rehberi</a><span aria-hidden>/</span><span aria-current="page">{g.name}</span>
          </nav>
          <header className="art__head">
            <div className="art__intro">
              <p className="art__eyebrow">{group.title}</p>
              <h1>{g.title}</h1>
              {g.latin ? <p className="art__latin">{g.latin}</p> : null}
              <p className="art__lead">{g.lead}</p>
              <p className="art__meta">Proverim · Güncelleme: 3 Ekim 2026 · {sources.length} kaynak</p>
            </div>
            <figure className={`art__fig${g.img ? "" : " art__fig--drawn"}`}>
              {g.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.img} alt={`${g.name} bakımı`} width={1024} height={1536} />
              ) : (
                <Specimen kind={g.kind} size={320} label={`${g.name} çizimi`} />
              )}
            </figure>
          </header>
          {g.facts ? (
            <dl className="art__facts">
              {g.facts.map((f) => { const I = ICON[f.k]; return <div key={f.k}><dt><I size={18} weight="duotone" /> {f.k}</dt><dd>{f.v}</dd></div>; })}
            </dl>
          ) : null}
          <div className="art__grid">
            <article className="art__body">
              {topic ? (
                <nav className="art__toc" aria-label="İçindekiler">
                  <p>İçindekiler</p>
                  <ol>{g.sections.map((s, i) => <li key={i}><a href={`#b-${i}`}>{s.h}</a></li>)}{g.studies ? <li><a href="#calismalar">Çalışmalar ne diyor?</a></li> : null}<li><a href="#sss">Sık sorulanlar</a></li></ol>
                </nav>
              ) : null}
              {g.sections.map((s, i) => (
                <section key={i} id={`b-${i}`}>
                  <h2>{s.h}</h2>
                  <p>{s.p}<Refs ns={s.refs ?? []} /></p>
                </section>
              ))}
              {!topic ? (
                <section>
                  <h2>Çiçek Coşturan ile bakım</h2>
                  <p>{p.usage}</p>
                  <p className="art__note">Ürün sulamanın yerine geçmez; ışık, su ve sıcaklık koşullarıyla birlikte bakım rutininin tamamlayıcısıdır.</p>
                </section>
              ) : null}
              {g.studies ? (
                <section id="calismalar">
                  <h2>Çalışmalar ne diyor?</h2>
                  <ul className="art__studies">
                    {g.studies.map((s, i) => (
                      <li key={i}><span className="art__big">{s.big}</span><div><strong>{s.plant}</strong> <em>{s.latin}</em><p>{s.finding}<Refs ns={[s.ref]} /></p></div></li>
                    ))}
                  </ul>
                  <p className="art__note">Bakteri denemeleri farklı suşlarla yapıldı; Çiçek Coşturan&apos;ın kendisiyle yapılmış çalışmalar değildir.</p>
                </section>
              ) : null}
              <section id="sss">
                <h2>Sık sorulanlar</h2>
                <div className="art__faq">
                  {g.faq.map((f) => (
                    <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
                  ))}
                </div>
              </section>
              {sources.length ? (
                <section id="kaynaklar" className="art__src">
                  <h2>Kaynaklar</h2>
                  <ol>{sources.map((s) => <li key={s.n} id={`kaynak-${s.n}`}><span>{s.n}</span><a href={s.url} target="_blank" rel="noopener noreferrer">{s.text}</a></li>)}</ol>
                </section>
              ) : null}
            </article>
            <aside className="art__aside">
              <div className="art__prod">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.bottle} alt={p.full} width={120} height={Math.round(120 / p.ratio)} loading="lazy" />
                <div>
                  <p className="art__prodk">Bu bitki için</p>
                  <h3>{p.name}</h3>
                  <p className="art__tag">{p.tagline}</p>
                  <p className="art__price">{price.sell > price.now ? <s>{tl(price.sell)}</s> : null} <b>{tl(price.now)}</b></p>
                  <div className="art__btns">
                    <a className="btn btn--pink" href={p.shop} target="_blank" rel="noopener noreferrer"><ShoppingBagOpen size={18} weight="bold" /> Satın Al</a>
                    <a className="btn btn--ghost" href={`/urun/${p.slug}`}>İncele <ArrowRight size={16} weight="bold" /></a>
                  </div>
                  <a className="art__wa" href={wa(`Merhaba, ${g.name.toLocaleLowerCase("tr-TR")} hakkında sormak istiyorum.`)} target="_blank" rel="noopener noreferrer"><WhatsappLogo size={18} weight="fill" /> Bitkimi sor</a>
                </div>
              </div>
              {related.length ? (
                <div className="art__rel">
                  <h3>İlgili rehberler</h3>
                  <ul>{related.slice(0, 8).map((r) => <li key={r.slug}><a href={`/rehber/${r.slug}`}>{r.title}</a></li>)}</ul>
                  <a className="art__all" href={group.page}>{group.id === "konu" ? "Tüm rehberler" : `${group.title} sayfası`} <ArrowRight size={14} weight="bold" /></a>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

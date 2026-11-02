import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, Caveat, Great_Vibes } from "next/font/google";
import { SITE } from "@/lib/content";
import "./globals.css";

/* Tipografi: Bricolage (başlık) + Manrope (gövde) + Caveat (botanikçi notu) + Great Vibes (yalnız "Coşturan" logotipi). */
const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700", "800"], variable: "--font-display", display: "swap" });
const sans = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" });
const hand = Caveat({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"], variable: "--font-hand", display: "swap" });
const script = Great_Vibes({ subsets: ["latin", "latin-ext"], weight: ["400"], variable: "--font-script", display: "swap" });

const TITLE = "Çiçek Neden Açmaz? Çiçekli Bitkiler İçin Bitki Besini | Çiçek Coşturan";
const DESC = "Saksı ve balkon çiçeğiniz tomurcuk vermiyor mu? Işık, kök, kireçli su ve stresin çiçeklenmeye etkisi; sardunya, petunya, begonya, Afrika menekşesi, gül, antoryum ve barış çiçeği bakımı. Proverim Çiçek Coşturan 400 ml sprey bitki besini.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  keywords: [
    "çiçek neden açmaz", "saksı çiçeği çiçek açmıyor", "çiçekli bitkiler için bitki besini", "çiçek besini sprey", "sardunya neden çiçek açmaz",
    "petunya bakımı", "begonya bakımı", "afrika menekşesi çiçek açmıyor", "barış çiçeği çiçek açmıyor", "antoryum bakımı", "saksı gülü bakımı",
    "Çiçek Coşturan", "Proverim", "kök bakterisi", "Bacillus",
  ],
  alternates: { canonical: SITE },
  applicationName: "Çiçek Coşturan",
  authors: [{ name: "Proverim", url: "https://proverim.com.tr" }],
  publisher: "Proverim",
  category: "Bitki bakımı",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: {
    type: "website", url: SITE, title: TITLE, description: DESC, locale: "tr_TR", siteName: "Proverim Çiçek Coşturan",
    images: [{ url: "/img/urun-cicekli.webp", width: 1024, height: 1536, alt: "Proverim Çiçek Coşturan çiçekli bitkiler 400 ml sprey" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/img/urun-cicekli.webp"] },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE}#org`, name: "Proverim", url: "https://proverim.com.tr", logo: `${SITE}/proverim-logo.webp`,
      sameAs: ["https://www.instagram.com/proverim_official", "https://www.facebook.com/proverimgubre", "https://www.youtube.com/@ProverimTV", "https://www.linkedin.com/company/proverimmikrobiyalbiogubre/"],
      contactPoint: { "@type": "ContactPoint", telephone: "+90-553-184-45-96", contactType: "customer service", availableLanguage: "Turkish" } },
    { "@type": "Brand", "@id": `${SITE}#brand`, name: "Çiçek Coşturan", alternateName: "Proverim Çiçek Coşturan", logo: `${SITE}/proverim-logo.webp`, url: SITE,
      description: "Proverim'in çiçekli bitkiler, orkideler ve kaktüs-sukulentler için 400 ml sprey bitki besini serisi." },
    { "@type": "WebSite", "@id": `${SITE}#site`, url: SITE, name: "Çiçek Coşturan", alternateName: "Proverim Çiçek Coşturan", inLanguage: "tr-TR", publisher: { "@id": `${SITE}#org` },
      about: { "@id": `${SITE}#brand` } },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${sans.variable} ${hand.variable} ${script.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}

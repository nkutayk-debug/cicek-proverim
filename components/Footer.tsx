import { WhatsappLogo, InstagramLogo, FacebookLogo, YoutubeLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { WA_DEFAULT, PHONE } from "@/lib/content";
import { PRODUCTS } from "@/lib/products";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot__grid">
        <div className="foot__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/proverim-logo.webp" alt="Proverim" width={140} height={40} loading="lazy" />
          <p>Proverim Çiçek Coşturan; saksı çiçekleri, balkon bitkileri ve iç mekân süs bitkilerinde kök çevresi dengesini, yaprak canlılığını ve çiçeklenme performansını destekleyen sprey bitki besinidir.</p>
        </div>
        <div className="foot__col">
          <h3>Ürünler</h3>
          {PRODUCTS.map((p) => <a key={p.slug} href={`/urun/${p.slug}`}>{p.short}</a>)}
        </div>
        <div className="foot__col">
          <h3>Rehber</h3>
          <a href="/rehber">Bakım rehberi</a>
          <a href="/rehber/cicek-neden-acmaz">Çiçek neden açmaz?</a>
          <a href="/rehber/orkide-neden-cicek-acmaz">Orkide neden açmaz?</a>
          <a href="/rehber/sukulent-neden-uzar-kaktus-neden-acmaz">Sukulent neden uzar?</a>
          <a href="/sss">Sık sorulan sorular</a>
        </div>
        <div className="foot__col">
          <h3>İletişim</h3>
          <a className="foot__wa" href={WA_DEFAULT} target="_blank" rel="noopener noreferrer"><WhatsappLogo size={20} weight="fill" /> {PHONE}</a>
          <a href="https://proverim.com.tr" target="_blank" rel="noopener noreferrer">proverim.com.tr</a>
          <div className="foot__social">
            <a href="https://www.instagram.com/proverim_official" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramLogo size={22} /></a>
            <a href="https://www.facebook.com/proverimgubre" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookLogo size={22} /></a>
            <a href="https://www.youtube.com/@ProverimTV" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><YoutubeLogo size={22} /></a>
            <a href="https://www.linkedin.com/company/proverimmikrobiyalbiogubre/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedinLogo size={22} /></a>
          </div>
        </div>
      </div>
      <div className="wrap foot__bottom">
        <span>© {new Date().getFullYear()} Proverim</span>
        <span>Çiçek Coşturan · çiçek, orkide, kaktüs ve sukulent bakım rehberi</span>
      </div>
    </footer>
  );
}

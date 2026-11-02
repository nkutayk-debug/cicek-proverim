import { Check } from "@phosphor-icons/react/dist/ssr";
import CareCalendar from "../CareCalendar";
import { LINE_COLOR, type Product } from "@/lib/products";

/* Ürün açıklaması (ürün sayfasından birebir) + ne sağlar + kullanım + takvim. */
export default function ProductDetails({ p }: { p: Product }) {
  const c = LINE_COLOR[p.line];
  return (
    <section className="sec pd" style={{ ["--line" as string]: c.main, ["--soft" as string]: c.soft, ["--deep" as string]: c.deep }}>
      <div className="wrap pd__grid">
        <div className="pd__about">
          <h2>Ürün hakkında</h2>
          {p.intro.map((t) => <p key={t.slice(0, 24)}>{t}</p>)}
        </div>
        <div className="pd__gives">
          <h3>{p.givesTitle}</h3>
          <ul>{p.gives.map((g) => <li key={g}><Check size={18} weight="bold" />{g}</li>)}</ul>
        </div>
      </div>
      <div className="wrap pd__use">
        <div className="pd__useText">
          <h3>{p.usageTitle}</h3>
          <p>{p.usage}</p>
          <h4>{p.plantsTitle}</h4>
          <ul className="pd__plants">{p.plants.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <CareCalendar product={`Çiçek Coşturan ${p.short}`} />
      </div>
    </section>
  );
}

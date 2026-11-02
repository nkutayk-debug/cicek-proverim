import type { Metadata } from "next";
import Film from "@/components/film/Film";
import { ORCHID_FILM } from "@/lib/films";
import { getPrices } from "@/lib/prices";

/* Instagram Reels / Hikâye kaydı için 9:16 orkide filmi (dizine eklenmez). */
export const metadata: Metadata = { title: "Çiçek Coşturan Orkide filmi (dikey)", robots: { index: false, follow: false } };

const PRELOAD = ["/img/orkide-1.webp", "/img/orkide-2.webp", "/img/orkide-3.webp", "/img/sise-orkide.webp"];

export default async function FilmDikeyOrkide() {
  const prices = await getPrices();
  return (
    <div className="story-wrap theme-orkide">
      <Film shots={ORCHID_FILM} prices={prices} label="Çiçek Coşturan Orkide dikey film" story />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {PRELOAD.map((s) => <img key={s} src={s} alt="" className="story-pre" />)}
    </div>
  );
}

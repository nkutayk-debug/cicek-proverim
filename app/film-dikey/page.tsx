import type { Metadata } from "next";
import Film from "@/components/film/Film";
import { HOME_FILM } from "@/lib/films";
import { getPrices } from "@/lib/prices";

/* Instagram Reels / Hikâye kaydı için 9:16 film (dizine eklenmez). */
export const metadata: Metadata = { title: "Çiçek Coşturan filmi (dikey)", robots: { index: false, follow: false } };

const PRELOAD = ["/img/yasam-1.webp", "/img/yasam-2.webp", "/img/yasam-3.webp", "/img/sise-cicekli.webp"];

export default async function FilmDikey() {
  const prices = await getPrices();
  return (
    <div className="story-wrap">
      <Film shots={HOME_FILM} prices={prices} label="Çiçek Coşturan dikey film" story />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {PRELOAD.map((s) => <img key={s} src={s} alt="" className="story-pre" />)}
    </div>
  );
}

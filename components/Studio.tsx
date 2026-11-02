"use client";

import { useEffect, useRef, useState } from "react";
import { createCicekliFilm, type FilmCopy } from "@/lib/studio/cicekliFilm";
import type { Fonts } from "@/lib/studio/fx";

/* Dikey film stüdyosu: kareyi zamana göre çizer. Kayıt betiği window.__render(t) ile kare kare alır;
   tarayıcıda ▶ ile gerçek zamanlı önizlenir. */
const load = (src: string) => new Promise<HTMLImageElement>((res) => { const i = new Image(); i.onload = () => i.decode().then(() => res(i), () => res(i)); i.src = src; });

export default function Studio({ copy, bottle, ratio, nozzle, photos, theme = "cicekli" }: { copy: FilmCopy; bottle: string; ratio: number; nozzle: [number, number]; photos: string[]; theme?: "cicekli" | "orkide" | "kaktus" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState("hazırlanıyor…");
  const play = useRef<() => void>(() => {});
  useEffect(() => {
    let raf = 0, alive = true;
    (async () => {
      const cs = getComputedStyle(document.documentElement);
      const F: Fonts = { display: cs.getPropertyValue("--font-display").trim(), script: cs.getPropertyValue("--font-script").trim(), hand: cs.getPropertyValue("--font-hand").trim(), sans: cs.getPropertyValue("--font-sans").trim() };
      await Promise.all([`800 100px ${F.display}`, `400 100px ${F.script}`, `700 100px ${F.sans}`, `600 40px ${F.hand}`].map((f) => document.fonts.load(f, "ÇçŞşĞğİıÖöÜü")));
      await document.fonts.ready;
      const [b, ...ph] = await Promise.all([load(bottle), ...photos.map(load)]);
      if (!alive) return;
      const film = createCicekliFilm(ref.current!, F, { bottle: b, bottleRatio: ratio, nozzle, photos: ph }, copy, theme);
      (window as unknown as { __render: (t: number) => void; __ready: boolean; __duration: number }).__render = film.render;
      (window as unknown as { __duration: number }).__duration = film.duration;
      film.render(0.6);
      (window as unknown as { __ready: boolean }).__ready = true;
      setState("hazır");
      play.current = () => {
        cancelAnimationFrame(raf);
        const t0 = performance.now();
        const loop = () => { const t = (performance.now() - t0) / 1000; film.render(t % film.duration); raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
      };
    })();
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [copy, bottle, ratio, nozzle, photos, theme]);
  return (
    <div className="studio">
      <canvas ref={ref} className="studio__cv" />
      <button className="studio__play" onClick={() => play.current()}>▶ Önizle ({state})</button>
    </div>
  );
}

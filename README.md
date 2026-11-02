# Çiçek Coşturan — cicekcosturan.proverim.com.tr

Next.js 16 sitesi (saf CSS, `app/globals.css`).

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3120
```

Yayın öncesi kontrol: `npm run build` ve `npm run typecheck`.

## Nerede ne var

- `app/` — sayfalar (`/`, `/orkide`, `/kaktus-sukulent`, `/urun/[slug]`, `/rehber`, `/sss`, sitemap, robots, llms.txt)
- `components/` — bölümler (Hero, ürün vitrini, film, SSS…)
- `lib/` — metinler ve veriler: `content.ts`, `products.ts`, `guides.ts` (rehber makaleleri), `orchid.ts`, `kaktus.ts`; çizimler `flora.ts`
- `public/img/` — görseller

Fiyatlar ikas ürün sayfalarından canlı çekilir (`lib/prices.ts`).

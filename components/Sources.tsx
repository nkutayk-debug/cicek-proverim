import { SOURCES } from "@/lib/content";

export default function Sources({ ids }: { ids?: number[] }) {
  const list = ids ? SOURCES.filter((s) => ids.includes(s.n)) : SOURCES;
  return (
    <section id="kaynaklar" className="refs">
      <div className="wrap">
        <h2>Kaynakça</h2>
        <p className="refs__note">Sayfadaki bilimsel bilgiler aşağıdaki hakemli makalelere ve üniversite yayım (extension) kaynaklarına dayanır. Metindeki küçük numaralar bu listeye bağlanır.</p>
        <ol>
          {list.map((s) => (
            <li key={s.n} id={`kaynak-${s.n}`}>
              <span className="refs__n">{s.n}</span>
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.text}</a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Kaynak üst simgeleri: [1, 7] → ¹·⁷ (her biri kaynakçaya bağlanır). */
export default function Refs({ ns }: { ns: number[] }) {
  if (!ns.length) return null;
  return (
    <sup className="ref">
      {ns.map((n, i) => (
        <a key={n} href={`#kaynak-${n}`} aria-label={`Kaynak ${n}`}>{i ? "," : ""}{n}</a>
      ))}
    </sup>
  );
}

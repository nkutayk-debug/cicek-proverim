"use client";

import { useMemo, useState } from "react";
import { CalendarPlus } from "@phosphor-icons/react";

const DAY = 86400000;
const fmt = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" });
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ics = (d: Date) => iso(d).replace(/-/g, "");

/** 15 günlük bakım takvimi: tarihleri dizer, .ics olarak telefona eklenir. */
export default function CareCalendar({ product = "Çiçek Coşturan" }: { product?: string }) {
  const [start, setStart] = useState(() => iso(new Date()));
  const [plant, setPlant] = useState("");
  const dates = useMemo(() => {
    const [y, m, d] = start.split("-").map(Number);
    const s = new Date(y, (m || 1) - 1, d || 1);
    return Array.from({ length: 8 }, (_, i) => new Date(s.getTime() + i * 15 * DAY));
  }, [start]);

  const download = () => {
    const name = plant.trim() ? `${product}: ${plant.trim()}` : `${product} uygulaması`;
    const body = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Proverim//Cicek Costuran//TR", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:cicek-${Date.now()}@proverim.com.tr`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${ics(dates[0])}`,
      `DTEND;VALUE=DATE:${ics(new Date(dates[0].getTime() + DAY))}`,
      "RRULE:FREQ=DAILY;INTERVAL=15;COUNT=24",
      `SUMMARY:${name}`,
      "DESCRIPTION:Çalkalayın. Bitki yüzeyine\\, yapraklara ve toprak yüzeyine eşit püskürtün. Sabah erken ya da akşam serinliğinde uygulayın.",
      "BEGIN:VALARM", "TRIGGER:PT9H", "ACTION:DISPLAY", `DESCRIPTION:${name}`, "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "cicek-costuran-takvim.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <div className="cal">
      <div className="cal__form">
        <h3>Bakım takvimin</h3>
        <p>İlk uygulama gününü seç; sonraki tarihler 15 gün arayla dizilsin, istersen telefonunun takvimine ekle.</p>
        <label className="cal__field"><span>İlk uygulama</span><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label className="cal__field"><span>Bitkinin adı (isteğe bağlı)</span><input type="text" value={plant} placeholder="ör. balkon sardunyası" onChange={(e) => setPlant(e.target.value)} maxLength={40} /></label>
        <button className="btn btn--pink" onClick={download}><CalendarPlus size={20} weight="bold" /> Takvimime ekle</button>
      </div>
      <ul className="cal__dates" aria-label="Sonraki uygulama tarihleri">
        {dates.map((d, i) => (
          <li key={d.getTime()} className={i === 0 ? "is-first" : ""} style={{ animationDelay: `${i * 0.06}s` }}>
            <span className="cal__dn">{i === 0 ? "İlk" : `${i * 15}. gün`}</span>
            <span className="cal__dd">{fmt(d)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

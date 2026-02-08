"use client";

type Props = {
  date: string;
  journalText?: string;
  plOverride?: number | null;
  realizedPnl?: number;
  trades?: any[];
};

export default function DayClient({
  date,
  journalText = "",
  plOverride = null,
  realizedPnl = 0,
  trades = [],
}: Props) {
  return (
    <div>
      <h1>{date}</h1>

      <section>
        <h2>Journal</h2>
        <textarea
          placeholder="Skriv notater for dagen..."
          defaultValue={journalText}
          style={{ width: "100%", minHeight: 120 }}
        />
      </section>

      <section>
        <h2>P/L</h2>
        <p>Realized P/L: {realizedPnl}</p>
        {plOverride !== null && <p>Override: {plOverride}</p>}
      </section>

      <section>
        <h2>Trades</h2>
        {trades.length === 0 ? (
          <p>Ingen trades</p>
        ) : (
          <ul>
            {trades.map((t, i) => (
              <li key={i}>{JSON.stringify(t)}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

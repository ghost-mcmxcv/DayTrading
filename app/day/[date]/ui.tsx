"use client";

import { useMemo, useState } from "react";

function formatPnL(n: number) {
  if (!isFinite(n)) return "0";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}`;
}

export default function DayClient(props: {
  date: string;
  journalText: string;
  manualOverride: number | null;
  computedPnL: number;
  tradeCount: number;
}) {
  const [journal, setJournal] = useState(props.journalText);
  const [override, setOverride] = useState<string>(
    props.manualOverride === null ? "" : String(props.manualOverride)
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const displayPnL = useMemo(() => {
    const o = override.trim() === "" ? null : Number(override);
    if (o !== null && isFinite(o)) return o;
    return props.computedPnL;
  }, [override, props.computedPnL]);

  async function save(pl_override: number | null) {
    setSaving(true);
    setMsg("");

    const res = await fetch("/api/daily-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        date: props.date,
        journal_text: journal,
        pl_override
      })
    });

    const j = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMsg(j?.error ?? "Kunne ikke lagre.");
      return;
    }

    setMsg("Lagret.");
  }

  function parseOverride(): number | null {
    const t = override.trim();
    if (t === "") return null;
    const n = Number(t);
    if (!isFinite(n)) return null;
    return n;
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0 }}>{props.date}</h1>
          <div className="muted" style={{ marginTop: 6 }}>
            Auto: {formatPnL(props.computedPnL)} ({props.tradeCount} trades)
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <a className="btn" href="/calendar">
            Kalender
          </a>
          <button className="btn" onClick={() => save(parseOverride())} disabled={saving}>
            {saving ? "Lagrer..." : "Lagre"}
          </button>
        </div>
      </div>

      <div className="row">
        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Notat</div>
          <textarea
            className="textarea"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Hva skjedde i dag? Plan, feil, psyke, setup..."
          />
        </div>

        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>P/L</div>

          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            {formatPnL(displayPnL)}
          </div>

          <div className="muted" style={{ marginBottom: 10 }}>
            Hvis du fyller inn manuell P/L, overstyrer den auto fra trades på kalenderen.
          </div>

          <label className="muted">Manuell overstyring</label>
          <input
            className="input"
            value={override}
            onChange={(e) => setOverride(e.target.value)}
            placeholder="f.eks 1084.25 eller -320"
          />

          <div style={{ height: 10 }} />

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={() => save(parseOverride())} disabled={saving}>
              Bruk manuell
            </button>
            <button
              className="btn"
              onClick={() => {
                setOverride("");
                save(null);
              }}
              disabled={saving}
            >
              Fjern manuell
            </button>
          </div>

          {msg ? <div style={{ marginTop: 12 }}>{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}

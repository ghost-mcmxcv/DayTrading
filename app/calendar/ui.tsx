"use client";

import { useEffect, useMemo, useState } from "react";

type DayInfo = { pl: number; source: "manual" | "trades" | "none"; trades: number; hasNote: boolean };
type ApiResp = { month: string; start: string; end: string; days: Record<string, DayInfo> };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toMonthString(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function addMonths(month: string, delta: number) {
  const [y, m] = month.split("-").map((x) => parseInt(x, 10));
  const d = new Date(y, m - 1 + delta, 1);
  return toMonthString(d);
}

function buildCalendarGrid(month: string) {
  const [y, m] = month.split("-").map((x) => parseInt(x, 10));
  const first = new Date(y, m - 1, 1);
  const startDow = (first.getDay() + 6) % 7; // mandag=0
  const start = new Date(y, m - 1, 1 - startDow);

  const cells: { date: string; inMonth: boolean; dayNum: number }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const inMonth = d.getMonth() === (m - 1);
    cells.push({ date, inMonth, dayNum: d.getDate() });
  }
  return cells;
}

function formatPnL(n: number) {
  if (!isFinite(n)) return "0";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}`;
}

export default function CalendarClient() {
  const [month, setMonth] = useState<string>(() => toMonthString(new Date()));
  const [data, setData] = useState<ApiResp | null>(null);
  const [err, setErr] = useState<string>("");

  const grid = useMemo(() => buildCalendarGrid(month), [month]);

  useEffect(() => {
    let cancelled = false;
    setErr("");
    setData(null);

    fetch(`/api/calendar?month=${month}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j?.error) setErr(String(j.error));
        else setData(j);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(String(e?.message ?? e));
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const dows = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

  return (
    <div>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn" onClick={() => setMonth(addMonths(month, -1))}>
            Forrige
          </button>
          <div className="card" style={{ padding: "10px 12px" }}>
            <div style={{ fontWeight: 800 }}>{month}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Klikk en dag for notat og manuell P/L
            </div>
          </div>
          <button className="btn" onClick={() => setMonth(addMonths(month, 1))}>
            Neste
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn"
            onClick={() => (window.location.href = "/day/" + new Date().toISOString().slice(0, 10))}
          >
            I dag
          </button>
          <button className="btn" onClick={logout}>
            Logg ut
          </button>
        </div>
      </div>

      {err ? <div className="card">{err}</div> : null}

      <div className="calendar" style={{ marginBottom: 8 }}>
        {dows.map((d) => (
          <div key={d} className="dow">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar">
        {grid.map((cell) => {
          const info = data?.days?.[cell.date];
          const pl = info?.pl ?? 0;
          const cls = pl > 0 ? "day green" : pl < 0 ? "day red" : "day";

          return (
            <a
              key={cell.date}
              href={`/day/${cell.date}`}
              className={cls}
              style={{ opacity: cell.inMonth ? 1 : 0.45 }}
            >
              <div className="dayTop">
                <div className="dayNum">{cell.dayNum}</div>
                {info?.source === "manual" ? <span className="badge">Manuell</span> : null}
                {info?.hasNote ? <span className="badge">Notat</span> : null}
              </div>

              <div>
                <div className="pnl">{formatPnL(pl)}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {info ? `${info.trades} trades` : "0 trades"}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

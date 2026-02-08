import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function monthRange(month: string) {
  const [y, m] = month.split("-").map((x) => parseInt(x, 10));
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toISODate(start), end: toISODate(end) };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const { start, end } = monthRange(month);

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        }
      }
    }
  );

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: summaries, error: sErr } = await supabase
    .from("daily_trade_summaries")
    .select("day,pnl,trade_count")
    .gte("day", start)
    .lt("day", end);

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const { data: logs, error: lErr } = await supabase
    .from("daily_logs")
    .select("date,pl_override,journal_text")
    .gte("date", start)
    .lt("date", end);

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  const map: Record<
    string,
    { pl: number; source: "manual" | "trades" | "none"; trades: number; hasNote: boolean }
  > = {};

  for (const s of summaries ?? []) {
    map[s.day] = {
      pl: Number(s.pnl ?? 0),
      source: "trades",
      trades: Number(s.trade_count ?? 0),
      hasNote: false
    };
  }

  for (const l of logs ?? []) {
    const key = l.date;
    const existing = map[key] ?? { pl: 0, source: "none" as const, trades: 0, hasNote: false };

    const hasNote = (l.journal_text ?? "").trim().length > 0;
    const hasOverride = l.pl_override !== null && l.pl_override !== undefined;

    map[key] = {
      pl: hasOverride ? Number(l.pl_override) : existing.pl,
      source: hasOverride ? "manual" : existing.source,
      trades: existing.trades,
      hasNote
    };
  }

  return NextResponse.json({ month, start, end, days: map });
}

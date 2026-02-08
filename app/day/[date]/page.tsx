import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import DayClient from "./ui";

export default async function DayPage({ params }: { params: { date: string } }) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const date = params.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect("/calendar");

  const { data: log } = await supabase
    .from("daily_logs")
    .select("date,journal_text,pl_override")
    .eq("date", date)
    .maybeSingle();

  const { data: summary } = await supabase
    .from("daily_trade_summaries")
    .select("day,pnl,trade_count,fees")
    .eq("day", date)
    .maybeSingle();

  const computedPnL = Number(summary?.pnl ?? 0);
  const tradeCount = Number(summary?.trade_count ?? 0);

  const manualOverride =
    log?.pl_override === null || log?.pl_override === undefined ? null : Number(log.pl_override);

  return (
    <DayClient
      date={date}
      journalText={log?.journal_text ?? ""}
      manualOverride={manualOverride}
      computedPnL={computedPnL}
      tradeCount={tradeCount}
    />
  );
}

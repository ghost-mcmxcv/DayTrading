import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import DayClient from "./ui";

export default async function DayPage({ params }: { params: { date: string } }) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return <DayClient date={params.date} />;
}

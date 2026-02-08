import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";
import CalendarClient from "./ui";

export default async function CalendarPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return <CalendarClient />;
}

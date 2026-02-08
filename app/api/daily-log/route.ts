import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Body = {
  date: string;
  journal_text?: string;
  pl_override?: number | null;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (!body?.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: "Ugyldig dato." }, { status: 400 });
  }

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

  const payload = {
    user_id: user.id,
    date: body.date,
    journal_text: body.journal_text ?? "",
    pl_override: body.pl_override === undefined ? null : body.pl_override
  };

  const { error } = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "user_id,date" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

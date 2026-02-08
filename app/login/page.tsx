"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../lib/supabase/browser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else setMsg("Bruker opprettet. Du kan logge inn.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else window.location.href = "/calendar";
  }

  return (
    <div>
      <h1>Logg inn</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Passord" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">{mode === "signin" ? "Logg inn" : "Opprett bruker"}</button>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          Bytt modus
        </button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

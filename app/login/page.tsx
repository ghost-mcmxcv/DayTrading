"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!email || !password) {
      setMsg("Skriv inn e-post og passord.");
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else setMsg("Brukeren er opprettet. Du kan logge inn nå.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      return;
    }

    window.location.href = "/calendar";
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "60px auto" }}>
      <h1 style={{ marginTop: 0 }}>Logg inn</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        En enkel MVP: kalender + dagbok + manuell P/L (og senere sync).
      </p>

      <form onSubmit={onSubmit}>
        <label className="muted">E-post</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

        <div style={{ height: 10 }} />

        <label className="muted">Passord</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ height: 14 }} />

        <button className="btn" type="submit">
          {mode === "signin" ? "Logg inn" : "Opprett bruker"}
        </button>

        <button
          className="btn"
          type="button"
          style={{ marginLeft: 10 }}
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Opprett ny" : "Har bruker"}
        </button>

        {msg ? <p style={{ marginTop: 14 }}>{msg}</p> : null}
      </form>
    </div>
  );
}

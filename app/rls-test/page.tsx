"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RLSTestPage() {
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [generations, setGenerations] = useState<any>(null);
  const [errors, setErrors] = useState<any>(null);

  useEffect(() => {
    async function run() {
      try {
        // 1) Hent innlogget bruker
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // 2) Hent credits for denne brukeren
        const { data: creditsData, error: creditsError } = await supabase
          .from("credits")
          .select("*");

        // 3) Hent generations / historikk
        const { data: genData, error: genError } = await supabase
          .from("generations")
          .select("id, user_id, created_at")
          .order("created_at", { ascending: false });

        setCredits(creditsData);
        setGenerations(genData);

        setErrors({
          creditsError,
          genError,
        });
      } catch (err) {
        setErrors(err);
      }
    }

    run();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔐 RLS Debug</h1>
      <p>Bruk denne siden for å verifisere at RLS fungerer som forventet.</p>

      <h2 style={{ marginTop: "20px" }}>👤 Bruker</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      <h2 style={{ marginTop: "20px" }}>💳 Credits</h2>
      <pre>{JSON.stringify(credits, null, 2)}</pre>

      <h2 style={{ marginTop: "20px" }}>📝 Generations</h2>
      <pre>{JSON.stringify(generations, null, 2)}</pre>

      <h2 style={{ marginTop: "20px" }}>⚠️ Errors</h2>
      <pre>{JSON.stringify(errors, null, 2)}</pre>
    </div>
  );
}

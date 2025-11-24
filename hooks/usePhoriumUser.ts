"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export function usePhoriumUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }
    load();
  }, []);

  return { user, loading };
}

"use client";

import { useEffect, useState } from "react";

export default function SyncStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function fetchStatus() {
    const res = await fetch("/api/shopify/sync-status");
    const data = await res.json();
    if (data.success) {
      setStatus(data.log);
    }
  }

  async function runSync() {
    setLoading(true);
    const res = await fetch("/api/shopify/sync-products", {
      method: "POST",
    });
    setLoading(false);
    await fetchStatus();
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="mb-6 p-5 rounded-2xl bg-[#113B3A] border border-[#1A4A48] shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#E8F5F3]">
            Produkt-synk
          </h3>

          {status ? (
            <p className="text-sm text-[#B4D4D3] mt-1">
              Sist synkronisert:{" "}
              <span className="font-medium text-white">
                {new Date(status.synced_at).toLocaleString("no-NO")}
              </span>
              <br />
              Produkter importert:{" "}
              <span className="font-medium text-white">
                {status.imported_count}
              </span>
            </p>
          ) : (
            <p className="text-sm text-[#B4D4D3] mt-1">
              Ingen synkronisering gjennomført ennå.
            </p>
          )}
        </div>

        <button
          onClick={runSync}
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-[#0EB489] hover:bg-[#0CA47C] text-white font-medium transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Synkroniserer…" : "Synkroniser nå"}
        </button>
      </div>
    </div>
  );
}

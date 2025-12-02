// phorium/lib/supabaseServer.ts

// Midlertidig, enkel løsning:
// Vi gjenbruker samme klient som i supabaseClient.ts,
// men eksporterer den som "supabase" til bruk i server-kode.
//
// Dette gjør at alle imports av "@/lib/supabaseServer" fungerer,
// uten å måtte refaktorere eksisterende kode akkurat nå.

export { supabase } from "./supabaseClient";

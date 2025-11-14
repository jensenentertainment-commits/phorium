// app/om/page.tsx  (SERVER COMPONENT – ingen "use client")
import type { Metadata } from "next";
import OmPhoriumClient from "./OmPhoriumClient";

export const metadata: Metadata = {
  title: "Om Phorium",
  description:
    "Phorium er et norsk AI-verktøy laget for ekte nettbutikker. Klart språk, rolig tone, og fokus på funksjoner som faktisk sparer tid.",
};

export default function Page() {
  return <OmPhoriumClient />;
}

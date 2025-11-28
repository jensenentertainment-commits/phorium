"use client";

import { createContext, useContext } from "react";

type CreditErrorContextType = {
  creditError: string | null;
  setCreditError: (msg: string | null) => void;
};

export const CreditErrorContext = createContext<CreditErrorContextType | undefined>(
  undefined
);

export function useCreditError() {
  const ctx = useContext(CreditErrorContext);
  if (!ctx) {
    throw new Error("useCreditError må brukes inne i StudioLayout.");
  }
  return ctx;
}

"use client";

import { AlertCircle } from "lucide-react";

export default function CreditErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-[12px] text-red-200 flex items-start gap-2">
      <AlertCircle className="h-4 w-4 mt-[1px]" />
      <p>{message}</p>
    </div>
  );
}

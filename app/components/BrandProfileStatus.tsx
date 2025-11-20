export function BrandProfileStatus({ loading, source }: any) {
  return (
    <div className="text-[10px] text-phorium-light/50">
      {loading
        ? "Laster brandprofil …"
        : source === "auto"
        ? "Auto-profil generert fra Shopify"
        : "Lokal, tilpasset brandprofil"}
    </div>
  );
}

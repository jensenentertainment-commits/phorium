import AdminNav from "./AdminNav";
import "../globals.css"; // bruker du vanligvis allerede

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-phorium-dark text-phorium-light">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-16 flex flex-col gap-8">

        {/* Global admin navigation */}
        <AdminNav />

        {/* Page content */}
        {children}
      </div>
    </div>
  );
}

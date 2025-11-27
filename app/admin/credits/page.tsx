import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminCreditsClient from "./AdminCreditsClient";

export default function AdminCreditsPage() {
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return <AdminCreditsClient />;
}

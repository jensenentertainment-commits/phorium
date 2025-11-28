import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminCreditsClient from "./AdminCreditsClient";

export default async function AdminCreditsPage() {
  const headerList = await headers();
  const cookie = headerList.get("cookie") || "";

  const isAdmin = cookie.includes("phorium_admin=1");

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return <AdminCreditsClient />;
}

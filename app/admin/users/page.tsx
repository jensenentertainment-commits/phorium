import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const headerList = await headers();
  const cookie = headerList.get("cookie") || "";

  const isAdmin = cookie.includes("phorium_admin=1");

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return <AdminUsersClient />;
}

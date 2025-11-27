import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export default function AdminUsersPage() {
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return <AdminUsersClient />;
}

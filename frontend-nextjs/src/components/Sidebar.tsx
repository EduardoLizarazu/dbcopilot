// components/Sidebar.tsx (Server Component)
import { getCurrentUser } from "@/lib/auth.server";
import SidebarClient from "@/components/SidebarClient";

export default async function Sidebar() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin =
    Boolean(user.admin) || user.role === "admin" || user["role"] === "admin";

  return <SidebarClient email={user.email ?? ""} isAdmin={isAdmin} />;
}

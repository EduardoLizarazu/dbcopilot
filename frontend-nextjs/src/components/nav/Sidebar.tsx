// components/Sidebar.tsx (Server Component)
import { getCurrentUser } from "@/infrastructure/services/auth.server";
import SidebarClient from "@/components/nav/SidebarClient";

export default async function Sidebar() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin =
    Boolean(user.admin) || user.role === "admin" || user["role"] === "admin";

  return <SidebarClient email={user.email ?? ""} isAdmin={isAdmin} />;
}

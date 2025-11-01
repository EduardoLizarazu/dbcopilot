// components/Sidebar.tsx (Server Component)
import { DecodeTokenFromCookieAction } from "@/_actions/auth/decode-token-from-cookie.action";
import SidebarClient from "@/components/nav/SidebarClient";

export default async function Sidebar() {
  const user = await DecodeTokenFromCookieAction();
  if (!user) return null;

  const isAdmin =
    Boolean(user.admin) || user.role === "admin" || user["role"] === "admin";

  return <SidebarClient email={user.email ?? ""} isAdmin={isAdmin} />;
}

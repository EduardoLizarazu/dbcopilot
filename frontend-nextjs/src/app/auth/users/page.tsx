import { listUsersCore, type UserRow } from "@/controller/_actions/user/core";
import UsersClient from "./users.client";

export default async function UsersPage() {
  const initialUsers: UserRow[] = await listUsersCore("");
  return <UsersClient initialUsers={initialUsers} />;
}

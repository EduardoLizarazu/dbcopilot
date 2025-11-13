import UsersClient from "./users.client";
import { ReadAllUserAction } from "@/_actions/users/read-all.action";

export default async function UsersPage() {
  const initialUsers = await ReadAllUserAction();
  return <UsersClient initialUsers={initialUsers.data} />;
}

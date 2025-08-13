"use server";
import { listUsersCore } from "./core";
export { type UserRow } from "./core";

export async function listUsersAction(q?: string) {
  return listUsersCore(q);
}

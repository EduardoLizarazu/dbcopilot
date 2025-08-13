"use server";
import { deleteUserCore } from "./core";

export async function deleteUserAction(userId: string) {
  return deleteUserCore(userId);
}

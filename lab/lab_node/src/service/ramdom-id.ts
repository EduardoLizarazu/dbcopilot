import { randomUUID } from "crypto";

export async function generateRandomId(): Promise<string> {
  return await randomUUID();
}

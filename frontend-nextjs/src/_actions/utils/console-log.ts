"use server";
export async function consoleLogAction(i: string): Promise<boolean> {
  setTimeout(() => {
    console.log("FROM SERVER", i);
  }, 7000);
  return true;
}

// app/nlq-good/create/page.tsx
export const runtime = "nodejs";

import CreateNlqClient from "./client";

export default async function CreateNlqPage() {
  return <CreateNlqClient />;
}

import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";

async function ReadNlqQaCorrectionByIdAction(params: {
  id: string;
}): Promise<TResOutContent<unknown>> {
  const response = await fetch(`/api/nlq-qa-correction/${params.id}`);
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

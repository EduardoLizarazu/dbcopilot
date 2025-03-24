import {
  CreatePromptDataModel,
  ReadPromptDataModel,
} from "@/data/model/index.data.model";
import { IPromptRepository } from "./IPrompt.data.repo";

export class PromptRepository extends IPromptRepository {
  prompt: ReadPromptDataModel[];
  constructor() {
    super();
    this.prompt = [
      {
        text: "Prompt 1 description",
        id: 0,
      },
      {
        text: "Prompt 2",
        id: 1,
      },
      {
        text: "Prompt 3",
        id: 2,
      },
    ];
  }

  async createPrompt(data: CreatePromptDataModel): Promise<void> {
    await this.prompt.push({ ...data, id: this.prompt.length });
  }
  async getAllPrompts(): Promise<ReadPromptDataModel[]> {
    return await this.prompt;
  }
  async getPromptById(id: number): Promise<ReadPromptDataModel | undefined> {
    return await this.prompt.find((prompt) => prompt.id === id);
  }
}

import {
  CreatePromptDataModel,
  ReadPromptDataModel,
} from "@/data/model/index.data.model";

export abstract class IPromptRepository {
  abstract createPrompt(data: CreatePromptDataModel): Promise<void>;
  abstract getAllPrompts(): Promise<ReadPromptDataModel[]>;
  abstract getPromptById(id: number): Promise<ReadPromptDataModel | undefined>;
}

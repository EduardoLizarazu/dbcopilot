import { CreateInsightDataModel, CreatePromptDataModel, CreateQueryDataModel, CreateResultDataModel, GetUsersDataModel, ReadConnectionDataModel } from "../index.data.model";

export interface CreateChatDataModel {
    userId: Pick<GetUsersDataModel, 'id'>;
    connectionId: Pick<ReadConnectionDataModel, 'id'>; 
    prompt: CreatePromptDataModel;
    response: {
        result: CreateResultDataModel;
        insight: CreateInsightDataModel;
        query: CreateQueryDataModel;
    }
}
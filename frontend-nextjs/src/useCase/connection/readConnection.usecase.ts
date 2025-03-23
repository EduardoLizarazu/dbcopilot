import { ReadConnectionDataModel } from "@/data/model/index.data.model";
import { ConnectionRepository } from "@/data/repo/index.data.repo";

export type ReadConnectionUseCaseOutput = ReadConnectionDataModel;

export class ReadConnectionsUseCase {
  constructor(private readonly connectionRepository: ConnectionRepository) {}

  async execute(): Promise<ReadConnectionUseCaseOutput[]> {
    return await this.connectionRepository.getAllConnections();
  }
}

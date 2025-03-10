import { UserRepository } from "@/data/repo/index.data.repo";

export class ReadUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: ReadUserByIdInput): Promise<ReadUserByIdOutput> {
    const user = await this.userRepository.getUserById(input);
    return {
      user: user,
    };
  }
}

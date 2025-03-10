import { UserRepository } from "@/data/repo/index.data.repo";

export class ReadUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<ReadUsersOutput> {
    const users = await this.userRepository.getAllUsers();
    return {
      users: users,
    };
  }
}
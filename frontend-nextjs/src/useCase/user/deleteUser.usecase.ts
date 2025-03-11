import { UserRepository } from "@/data/repo/index.data.repo";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: number): Promise<void> {
    await this.userRepository.deleteUser(input);
  }
}

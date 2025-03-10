import { UserRepository } from "@/data/repo/index.data.repo";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    const user = await this.userRepository.deleteUser(input);
    return {
      user: user,
    };
  }
}
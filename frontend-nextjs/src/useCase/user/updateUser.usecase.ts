import { UserRepository } from "@/data/repo/index.data.repo";

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const user = await this.userRepository.updateUser(input);
    return {
      user: user,
    };
  }
}
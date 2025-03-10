import { UserRepository } from "@/data/repo/index.data.repo";

interface CreateUserInput {

}

interface CreateUserOutput {
  
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const user = await this.userRepository.createUser(input);
    return {
      user: user,
    };
  }
}
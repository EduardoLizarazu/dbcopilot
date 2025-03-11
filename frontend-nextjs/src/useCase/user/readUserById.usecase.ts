import { UserRepository } from "@/data/repo/index.data.repo";
import { ReadUserUseCaseOutput } from "./readUsers.usecase";
import { ReadUserDTO } from "../dto/index.usecase.dto";

export class ReadUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number): Promise<ReadUserUseCaseOutput> {
    const user = await this.userRepository.getUserById(id);
    const userDTO = ReadUserDTO.createDTO(user);
    userDTO.toEntity();
    const userObject = userDTO.toObject();
    const roles = user?.roles || [];
    const directPermissions = user?.directPermissions || [];
    const output = {
      user: userObject,
      roles,
      directPermissions,
    };
    return output;
  }
}

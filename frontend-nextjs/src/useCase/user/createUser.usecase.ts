import { CreateUserDataModel, GetPermissionDataModel, GetRolesDataModel } from "@/data/model/index.data.model";
import { UserRepository } from "@/data/repo/index.data.repo";
import { UserEntity } from "@/domain/entities/index.domain.entity";
import { EmailValueObject, IdValueObject, PhoneValueObject } from "@/domain/valueObject/index.domain.valueObject";

interface CreateUserInput extends CreateUserDataModel{};

interface CreateUserOutput {}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const idVo = new IdValueObject(0);
    const phoneVo = new PhoneValueObject(input.phone);
    const emailVo = new EmailValueObject(input.email);
    const userEntity: UserEntity = new UserEntity(
      idVo,
      input.firstName,
      emailVo,
      input.lastName,
      phoneVo.value,
      input.roles,
      input.permissions,
      input.isActive
    );

    const user = await this.userRepository.createUser(input);
    return {
      user: user,
    };
  }
}
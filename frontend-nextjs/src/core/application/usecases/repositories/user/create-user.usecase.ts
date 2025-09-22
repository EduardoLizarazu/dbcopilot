import {
  createUserSchema,
  TCreateUserDto,
} from "@/core/application/dtos/auth/user.app.dto";
import { ICreateUserAppUseCase } from "../../interfaces/user/create-user.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { IUserRepository } from "@/core/application/interfaces/auth/user.app.inter";
import { UserEntity } from "@/core/domain/entities/user.domain.entity";
import { UserAppEnum } from "@/core/application/enums/user.app.enum";
import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";

export class CreateUserAppUseCase implements ICreateUserAppUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(input: TCreateUserDto): Promise<TResponseDto> {
    try {
      // Check if input is valid
      const valid = createUserSchema.safeParse(input);
      if (!valid.success) {
        return {
          success: false,
          message: valid.error.format()._errors.join(", "),
          data: null,
        };
      }
      // check if user already exists
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) {
        return {
          success: false,
          message: UserAppEnum.userAlreadyExists,
          data: null,
        };
      }
      // check if roles exist
      await Promise.all(
        input.roles.map(async (roleId) => {
          const role = await this.roleRepository.findById(roleId);
          if (!role) {
            return {
              success: false,
              message: RoleAppEnum.roleNotFound,
              data: null,
            };
          }
        })
      );

      const user = UserEntity.create(input);
      const output = await this.userRepository.create({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        password: user.password,
        roles: input.roles,
      });
      return {
        success: true,
        message: UserAppEnum.userCreatedSuccessfully,
        data: output,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}

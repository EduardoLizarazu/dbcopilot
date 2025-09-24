import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import {
  createUserSchema,
  TCreateUserDto,
  TUserOutputRequestDto,
} from "@/core/application/dtos/user.app.dto";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { IUserRepository } from "../../interfaces/auth/user.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { UserAppEnum } from "../../enums/user.app.enum";
import { RoleAppEnum } from "../../enums/role.app.enum";
import { UserEntity } from "@/core/domain/entities/user.domain.entity";

export interface ICreateUserAppUseCase {
  execute(data: TCreateUserDto): Promise<TResponseDto<TUserOutputRequestDto>>;
}

export class CreateUserAppUseCase implements ICreateUserAppUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(
    input: TCreateUserDto
  ): Promise<TResponseDto<TUserOutputRequestDto>> {
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
      const id = await this.userRepository.create({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        password: user.password,
        roles: input.roles,
      });

      //  find user by id to return full object
      const output = await this.userRepository.findById(id);
      if (!output) {
        return {
          success: false,
          message: UserAppEnum.userNotFound,
          data: null,
        };
      }

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

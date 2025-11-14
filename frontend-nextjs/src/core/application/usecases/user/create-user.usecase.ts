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

export interface ICreateUserUseCase {
  execute(data: TCreateUserDto): Promise<TResponseDto<TUserOutputRequestDto>>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(
    input: TCreateUserDto
  ): Promise<TResponseDto<TUserOutputRequestDto>> {
    try {
      this.logger.info("[CreateUserUseCase] Executing with input:", input);

      // Check if input is valid
      const valid = createUserSchema.safeParse(input);
      if (!valid.success) {
        this.logger.error(
          "[CreateUserUseCase] Invalid input:",
          valid.error.errors
        );
        return {
          success: false,
          message: valid.error.errors.map((e) => e.message).join(", "),
          data: null,
        };
      }
      // check if user already exists
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) {
        this.logger.error(
          "[CreateUserUseCase] User already exists:",
          input.email
        );
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
            this.logger.error("[CreateUserUseCase] Role not found:", roleId);
            return {
              success: false,
              message: RoleAppEnum.roleNotFound,
              data: null,
            };
          }
        })
      );

      const user = UserEntity.create(input);

      this.logger.info("[CreateUserUseCase] Creating user:", user);

      const id = await this.userRepository.create({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        password: user.password,
        roles: input.roles,
      });

      if (!id) {
        this.logger.error("[CreateUserUseCase] User creation failed");
        return {
          success: false,
          message: "User creation failed",
          data: null,
        };
      }

      //  find user by id to return full object
      const output = await this.userRepository.findById(id);
      if (!output) {
        this.logger.error(
          "[CreateUserUseCase] User not found after creation:",
          id
        );
        return {
          success: false,
          message: UserAppEnum.userNotFound,
          data: null,
        };
      }

      this.logger.info(
        "[CreateUserUseCase] User created successfully:",
        output
      );

      return {
        success: true,
        message: UserAppEnum.userCreatedSuccessfully,
        data: output,
      };
    } catch (error) {
      this.logger.error("[CreateUserUseCase] Error executing use case:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}

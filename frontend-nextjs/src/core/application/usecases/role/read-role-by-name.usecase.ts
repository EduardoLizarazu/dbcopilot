import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TRoleOutRequestDto } from "../../dtos/role.app.dto";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { RoleAppEnum } from "../../enums/role.app.enum";

export interface IReadRoleByNameUseCase {
  execute(name: string): Promise<TResponseDto<TRoleOutRequestDto>>;
}

export class ReadRoleByNameRoleUseCase implements IReadRoleByNameUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(name: string): Promise<TResponseDto<TRoleOutRequestDto>> {
    try {
      const role = await this.roleRepository.findByName(name);
      this.logger.info("ReadRoleByNameRoleUseCase: Role found:", role);
      return {
        success: true,
        data: role,
        message: role
          ? RoleAppEnum.roleFoundSuccessfully
          : RoleAppEnum.roleNotFound,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TRoleOutRequestDto } from "../../dtos/role.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { RoleAppEnum } from "../../enums/role.app.enum";

export interface IReadByIdRoleAppUseCase {
  execute(id: string): Promise<TResponseDto<TRoleOutRequestDto>>;
}

export class ReadRoleByIdUseCase implements IReadByIdRoleAppUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<TResponseDto<TRoleOutRequestDto>> {
    try {
      const role = await this.roleRepository.findById(id);
      this.logger.info("ReadRoleByIdUseCase: Role found:", role);
      return {
        success: true,
        message: !role
          ? RoleAppEnum.roleFoundSuccessfully
          : RoleAppEnum.roleNotFound,
        data: role,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}

import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IReadRoleByNameAppUseCase } from "../../interfaces/role/read-role-by-name.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

export class ReadRoleByNameRoleUseCase implements IReadRoleByNameAppUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly logger: ILogger
  ) {}

  async execute(name: string): Promise<TResponseDto> {
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

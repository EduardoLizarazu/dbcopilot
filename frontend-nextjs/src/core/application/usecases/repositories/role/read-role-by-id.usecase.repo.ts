import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import { IReadByIdRoleAppUseCase } from "../../interfaces/role/read-role-by-id.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

export class ReadRoleByIdUseCase implements IReadByIdRoleAppUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<TResponseDto> {
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

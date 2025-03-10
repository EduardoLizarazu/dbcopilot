import { GetRolesDataModel } from "@/data/model/index.data.model";
import { RoleRepository } from "@/data/repo/index.data.repo";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

export class ReadRoleByIdUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async execute(data: number): Promise<GetRolesDataModel | undefined> {
    const roleId = new IdValueObject(data);
    return await this.roleRepository.getRoleById(roleId.value);
  }
}

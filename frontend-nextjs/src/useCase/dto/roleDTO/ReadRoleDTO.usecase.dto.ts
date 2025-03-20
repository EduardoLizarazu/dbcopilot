import { RoleEntity } from "@/domain/entities/role.domain.entity";
import { IdValueObject } from "@/domain/valueObject/id.domain.valueObject";
import { CreateRoleDTO, CreateRolInput } from "@useCases/dto/index.usecase.dto";

export interface ReadRoleOutput extends CreateRolInput {
  id: number;
}

export class ReadRoleDTO extends CreateRoleDTO {
  private readonly _id: number;

  constructor(props: ReadRoleOutput) {
    super(props);
    this._id = props.id;
  }

  get id(): number {
    return this._id;
  }

  static createDTOFromList(roles: ReadRoleOutput[]): ReadRoleDTO[] {
    return roles.map((role) => new ReadRoleDTO(role));
  }

  static toObjectListFromDTO(roles: ReadRoleDTO[]): ReadRoleOutput[] {
    return roles.map((role) => role.toObject());
  }

  toObject(): ReadRoleOutput {
    return {
      id: this._id,
      name: this._name,
    };
  }

  toEntity(): RoleEntity {
    return new RoleEntity(new IdValueObject(this._id), this._name);
  }

  static createEntityFromListOfDTO(dto: ReadRoleDTO[]): RoleEntity[] {
    return dto.map((role) => role.toEntity());
  }
}

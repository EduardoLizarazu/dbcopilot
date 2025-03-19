import { RoleEntity } from "@/domain/entities/index.domain.entity";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

export interface CreateRolInput {
  name: string;
}

export class CreateRoleDTO {
  protected readonly _name: string;

  constructor(props: CreateRolInput) {
    this._name = props.name;
  }

  get name(): string {
    return this._name;
  }

  toEntity(): RoleEntity {
    return new RoleEntity(
      new IdValueObject(1), // fake
      this._name
    );
  }
}

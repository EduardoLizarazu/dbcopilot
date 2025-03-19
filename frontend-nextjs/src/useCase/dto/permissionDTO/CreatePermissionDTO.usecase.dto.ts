import { PermissionEntity } from "@/domain/entities/index.domain.entity";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

export interface CreatePermissionInput {
  name: string;
  description: string;
}

export class CreatePermissionDTO {
  protected readonly _name: string;
  protected readonly _description: string;

  constructor(props: CreatePermissionInput) {
    this._name = props.name;
    this._description = props.description;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  toEntity(): PermissionEntity {
    return new PermissionEntity(
      new IdValueObject(1),
      this._name,
      this._description
    );
  }

  toObject(): CreatePermissionInput {
    return {
      name: this._name,
      description: this._description,
    };
  }

  static toDTOFromObjectList(
    data: CreatePermissionInput[]
  ): CreatePermissionDTO[] {
    return data.map((item) => new CreatePermissionDTO(item));
  }
}

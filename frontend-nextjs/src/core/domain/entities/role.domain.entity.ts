export interface IRoleEntity {
  name: string;
  description: string;
}

export class RoleEntity {
  private _name: string;
  private _description: string;
  constructor(props: IRoleEntity) {
    this._name = props.name;
    this._description = props.description;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  static create(dto: TCreateRoleDto): RoleEntity {
    const { name, description } = dto;
    return new RoleEntity({ name, description });
  }

  static update(dto: TCreateRoleDto): RoleEntity {
    return new RoleEntity({
      name: dto.name,
      description: dto.description,
    });
  }
}

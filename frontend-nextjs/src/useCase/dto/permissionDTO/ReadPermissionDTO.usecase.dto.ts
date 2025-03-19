import {
  CreatePermissionInput,
  CreatePermissionDTO,
} from "./CreatePermissionDTO.usecase.dto";

export interface ReadPermissionOutput extends CreatePermissionInput {
  id: number;
}

export class ReadPermissionDTO extends CreatePermissionDTO {
  protected readonly _id: number;

  constructor(props: ReadPermissionOutput) {
    super(props);
    this._id = props.id;
  }

  get id(): number {
    return this._id;
  }

  toObject(): ReadPermissionOutput {
    return {
      id: this._id,
      name: this.name,
      description: this._description,
    };
  }

  static toDTOFromObjectList(
    data: ReadPermissionOutput[]
  ): ReadPermissionDTO[] {
    return data.map((item) => new ReadPermissionDTO(item));
  }
}

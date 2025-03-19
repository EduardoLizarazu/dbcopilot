import {
  UpdatePermissionActivationDTO,
  UpdatePermissionActivationInput,
} from "../index.usecase.dto";

export interface ReadPermissionActivationOutput
  extends UpdatePermissionActivationInput {
  id: number;
}

export class ReadPermissionActivationDTO extends UpdatePermissionActivationDTO {
  protected readonly _id: number;

  constructor(props: ReadPermissionActivationOutput) {
    super(props);
    this._id = props.id;
  }

  get id(): number {
    return this._id;
  }

  toObject(): ReadPermissionActivationOutput {
    return {
      ...super.toObject(),
      id: this._id,
    };
  }

  static toObjectList(
    data: ReadPermissionActivationDTO[]
  ): ReadPermissionActivationOutput[] {
    return data.map((item) => item.toObject());
  }

  static toDTOFromObjectList(
    data: ReadPermissionActivationOutput[]
  ): ReadPermissionActivationDTO[] {
    return data.map((item) => new ReadPermissionActivationDTO(item));
  }
}

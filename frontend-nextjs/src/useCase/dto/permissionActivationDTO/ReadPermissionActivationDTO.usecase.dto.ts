import { PermissionWithActivationEntity } from "@/domain/entities/permissionWithActivation.domain.entity";
import {
  UpdatePermissionActivationDTO,
  UpdatePermissionActivationInput,
} from "../index.usecase.dto";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

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

  toEntity(): PermissionWithActivationEntity {
    return new PermissionWithActivationEntity(
      new IdValueObject(this._id),
      this._name,
      this._description,
      this._isActive
    );
  }

  static fromDTOtoList(
    data: ReadPermissionActivationDTO[]
  ): ReadPermissionActivationOutput[] {
    return data.map((item) => item.toObject());
  }

  static fromDTOListToEntityList(
    dtoList: ReadPermissionActivationDTO[]
  ): PermissionWithActivationEntity[] {
    return dtoList.map((dto) =>
      new ReadPermissionActivationDTO(dto).toEntity()
    );
  }

  static fromListToDTOList(
    data: ReadPermissionActivationOutput[]
  ): ReadPermissionActivationDTO[] {
    return data.map((item) => new ReadPermissionActivationDTO(item));
  }
}

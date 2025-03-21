import { PermissionWithActivationEntity } from "@/domain/entities/index.domain.entity";
import { ReadPermissionDTO, ReadPermissionOutput } from "../index.usecase.dto";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

export interface UpdatePermissionActivationInput extends ReadPermissionOutput {
  isActive: boolean;
}

export class UpdatePermissionActivationDTO extends ReadPermissionDTO {
  protected readonly _isActive: boolean;

  constructor(props: UpdatePermissionActivationInput) {
    super(props);
    this._isActive = props.isActive;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  toObject(): UpdatePermissionActivationInput {
    return {
      ...super.toObject(),
      isActive: this._isActive,
    };
  }

  static toObjectList(
    data: UpdatePermissionActivationDTO[]
  ): UpdatePermissionActivationInput[] {
    return data.map((item) => item.toObject());
  }

  toEntity(): PermissionWithActivationEntity {
    return new PermissionWithActivationEntity(
      new IdValueObject(1),
      super.name,
      super.description,
      this._isActive
    );
  }

  static toDTOFromObjectList(
    data: UpdatePermissionActivationInput[]
  ): UpdatePermissionActivationDTO[] {
    return data.map((item) => new UpdatePermissionActivationDTO(item));
  }

  static toEntityListFromDTOList(
    dtoList: UpdatePermissionActivationDTO[]
  ): PermissionWithActivationEntity[] {
    return dtoList.map((dto) => dto.toEntity());
  }
}

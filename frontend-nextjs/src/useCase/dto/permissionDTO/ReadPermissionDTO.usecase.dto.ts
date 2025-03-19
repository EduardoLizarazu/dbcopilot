import { PermissionEntity } from "@/domain/entities/index.domain.entity";
import {
  CreatePermissionInput,
  CreatePermissionDTO,
} from "./CreatePermissionDTO.usecase.dto";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

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
      name: this._name,
      description: this._description,
    };
  }

  toEntity(): PermissionEntity {
    return new PermissionEntity(
      new IdValueObject(this._id),
      this._name,
      this._description
    );
  }

  static toDTOFromObjectList(
    data: ReadPermissionOutput[]
  ): ReadPermissionDTO[] {
    return data.map((item) => new ReadPermissionDTO(item));
  }

  static fromDTOListToEntityList(
    dtoList: ReadPermissionDTO[]
  ): PermissionEntity[] {
    return dtoList.map((dto) => dto.toEntity());
  }

  static fromDTOtoListOfObject(
    dtoList: ReadPermissionDTO[]
  ): ReadPermissionOutput[] {
    return dtoList.map((dto) => dto.toObject());
  }
}

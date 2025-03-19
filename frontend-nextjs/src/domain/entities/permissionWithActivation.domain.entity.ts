import { IdValueObject } from "../valueObject/index.domain.valueObject";
import { PermissionEntity } from "./index.domain.entity";

export class PermissionWithActivationEntity extends PermissionEntity {
  private readonly _isActive: boolean;

  constructor(
    id: IdValueObject,
    name: string,
    description: string,
    isActive: boolean
  ) {
    super(id, name, description);
    this._isActive = isActive;
  }

  get isActive(): boolean {
    return this._isActive;
  }
}

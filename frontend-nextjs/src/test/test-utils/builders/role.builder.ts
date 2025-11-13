import {
  TCreateRoleDto,
  TRoleInRequestDto,
  TRoleOutRequestDto,
  TUpdateRoleDto,
} from "@/core/application/dtos/role.app.dto";

export class RoleBuilder {
  static makeCreate(overrides: Partial<TCreateRoleDto> = {}): TCreateRoleDto {
    return {
      name: "Admin",
      description: "Full access",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static makeUpdate(overrides: Partial<TUpdateRoleDto> = {}): TUpdateRoleDto {
    return {
      id: "role-1",
      name: "Updated Role",
      description: "Updated description",
      updatedBy: "user-456",
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static makeInRequest(
    overrides: Partial<TRoleInRequestDto> = {}
  ): TRoleInRequestDto {
    return {
      id: "role-1",
      name: "Admin",
      description: "Full access",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static makeOutRequest(
    overrides: Partial<TRoleOutRequestDto> = {}
  ): TRoleOutRequestDto {
    return {
      id: "role-1",
      name: "Admin",
      description: "Full access",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}

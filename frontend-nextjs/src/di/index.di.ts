"use server";

import { RoleRepository } from "@data/repo/index.data.repo";
import { CreateRoleUseCase, ReadRolesUseCase } from "@useCases/index.usecase";

// ROLE SERVICE
export const CreateRoleService = new CreateRoleUseCase(new RoleRepository());
export const GetRolesService = new ReadRolesUseCase(new RoleRepository());

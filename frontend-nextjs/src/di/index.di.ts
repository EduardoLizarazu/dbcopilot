"use server";

import { RoleRepository } from "@data/repo/index.data.repo";
import { CreateRoleUseCase } from "@useCases/index.usecase";

export const RoleService = new CreateRoleUseCase(new RoleRepository());

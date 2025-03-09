"use server";
import { RoleService } from "@/di/index.di";

export const CreateRole = async (data) => {
  return await RoleService.execute(data);
};

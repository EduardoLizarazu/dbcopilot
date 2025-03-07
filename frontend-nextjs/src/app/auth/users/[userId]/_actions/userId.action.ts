"use server";
// import axios from "axios";

import {
  fakeUserRolesPermissionAndDirectPermission,
  fakeRoles,
  fakeUserWithRoles,
  fakeDirectPermissions,
} from "@/data/fake.data";
import { Permission } from "../../_types/user.type";

export const getUserByIdWithRolesAndPermissions = async (userId: string) => {
  try {
    // const response = await axios.get(`https://yourapi.com/users/${userId}`);
    // return response.data;
    return fakeUserRolesPermissionAndDirectPermission;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const getRoles = async () => {
  try {
    // const response = await axios.get(`https://yourapi.com/roles`);
    // return response.data;
    return fakeRoles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

export const getUserByIdWithRoles = async (userId: string) => {
  try {
    // const response = await axios.get(`https://yourapi.com/users/${userId}`);
    // return response.data;
    return fakeUserWithRoles;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUserRoles = async (
  userId: number,
  roles: { id: number; name: string }[]
) => {
  try {
    // const response = await axios.put(`https://yourapi.com/users/${userId}`, { roles });
    // return response.data;
    console.log("User roles updated", userId, roles);
  } catch (error) {
    console.error("Error updating user roles:", error);
    throw error;
  }
};

export const getUserDirectPermissions = async (
  userId: string
): Promise<Permission[]> => {
  try {
    // const response = await axios.get(`https://yourapi.com/users/${userId}/permissions`);
    // return response.data;
    return fakeUserRolesPermissionAndDirectPermission.directPermissions;
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    throw error;
  }
};

export const getPermissionsWithOutDescription = async () => {
  try {
    // const response = await axios.get(`https://yourapi.com/permissions`);
    // return response.data;
    return fakeDirectPermissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
    }));
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
};

export const updateUserDirectPermissions = async (
  userId: number,
  permissions: { id: number; name: string }[]
) => {
  try {
    // const response = await axios.put(`https://yourapi.com/users/${userId}`, { permissions });
    // return response.data;
    console.log("User permissions updated");
  } catch (error) {
    console.error("Error updating user permissions:", error);
    throw error;
  }
};

'use server';
// import axios from "axios";

import { fakeUserRolesPermissionAndDirectPermission, fakeRoles, fakeUserWithRoles } from "@/data/fake.data";

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
}

export const getUserByIdWithRoles = async (userId: string) => {
  try {
    // const response = await axios.get(`https://yourapi.com/users/${userId}`);
    // return response.data;
    return fakeUserWithRoles;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}
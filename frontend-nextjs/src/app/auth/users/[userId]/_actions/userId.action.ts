// import axios from "axios";

import { fakeUserRolesPermissionAndDirectPermission } from "@/data/fake.data";

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

// import axios from "axios";
import { fakeUserRoles } from "@/data/fake.data";
import { UserWithRoles } from "../_types/user.type";

const getUsersRoles = async (): Promise<UserWithRoles[]> => {
  try {
    // const response = await axios.get("/users-roles");
    // return response.data;
    return fakeUserRoles;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  }
};

export { getUsersRoles };

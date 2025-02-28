import React from "react";
import { UserTable } from "@/app/auth/users/table.user";

const UsersPage: React.FC = () => {
  return (
    <div>
      <h1>Users</h1>
      <UserTable />
    </div>
  );
};

export default UsersPage;

import React, { Suspense } from "react";
import { CircularProgress, Container, Typography } from "@mui/material";
import { UserTableHead } from "@/components/users/userTableHead";
import { ReadAllUsersAction } from "@/controller/_actions/user/query/read-all-users.action";
import RouteGuard from "@/components/RouteGuard";

// ReadUserUseCaseOutput[]
export default async function UsersPage() {
  const data = await ReadAllUsersAction();

  return (
    <Suspense fallback={<CircularProgress />}>
      {/* <RouteGuard requiredRoles={["admin"]}> */}
      <Container>
        <Typography variant="h4">Users</Typography>
        <UserTableHead fetchedData={data} />
      </Container>
      {/* </RouteGuard> */}
    </Suspense>
  );
}

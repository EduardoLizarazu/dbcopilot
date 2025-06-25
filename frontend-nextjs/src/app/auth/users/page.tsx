import React, { Suspense } from "react";
import { CircularProgress, Container, Typography } from "@mui/material";
import { GetUsers } from "@/controller/_actions/index.actions";
import { ReadUserUseCaseOutput } from "@/useCase/index.usecase";
import { UserTableHead } from "@/components/users/userTableHead";
import { ReadAllUsersAction } from "@/controller/_actions/user/query/read-all-users.action";

// ReadUserUseCaseOutput[]
export default async function UsersPage() {
  const data = await ReadAllUsersAction();

  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Users</Typography>
        <UserTableHead fetchedData={data} />
      </Container>
    </Suspense>
  );
}

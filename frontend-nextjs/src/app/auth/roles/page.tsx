import React, { Suspense } from "react";
import { CircularProgress, Container, Typography } from "@mui/material";
import { TableHeadRole } from "@/components/role/tableHeadRole";
import { ReadAllRolesAction } from "@/controller/_actions/role/query/read-all-roles.action";

type TReadRole = {
  id: number;
  name: string;
  description?: string;
};

export default async function RolesPage() {
  const data: TReadRole[] = await ReadAllRolesAction();
  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Roles</Typography>
        <TableHeadRole fetchedData={data} />
      </Container>
    </Suspense>
  );
}

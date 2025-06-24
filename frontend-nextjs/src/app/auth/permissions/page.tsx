import React, { Suspense } from "react";
import { CircularProgress, Container, Typography } from "@mui/material";
import { TableHeadPerm } from "@/components/permission/tableHeadPerm";
import { ReadAllPermissions } from "@/controller/_actions/permission/query/read-all-permission.action";

interface ReadPermission {
  id: number;
  name: string;
  description?: string;
}

export default async function PermissionPage() {
  const data: ReadPermission[] = await ReadAllPermissions();
  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Permissions</Typography>
        <TableHeadPerm fetchedData={data} />
      </Container>
    </Suspense>
  );
}

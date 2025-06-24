import React, { Suspense } from "react";
import {
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { GetPermissionDataModel } from "@/data/model/index.data.model";
import {
  DeletePermissionById,
  GetPermissions,
} from "@/controller/_actions/index.actions";
import { TableHeadPerm } from "@/components/permission/tableHeadPerm";
import { ReadAllPermissions } from "@/controller/_actions/permission/query/read-all-permission.action";

interface ReadPermission {
  id: number;
  name: string;
  description?: string;
}

export default async function PermissionPage() {
  const connList: ReadPermission[] = await ReadAllPermissions();
  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Permissions</Typography>
        <TableHeadPerm fetchedData={connList} />
      </Container>
    </Suspense>
  );
}

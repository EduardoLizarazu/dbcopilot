"use client";
import React from "react";
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

export default function PermissionPage() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [permissions, setPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);

  React.useEffect(() => {
    (async () => {
      setPermissions(await GetPermissions());
      setLoading(false);
    })();
  }, []);

  async function handleRemovePermission(id: number) {
    await DeletePermissionById(id);
    setPermissions(permissions.filter((perm) => perm.id !== id));
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4">Permissions:</Typography>
      <Link href="/auth/permissions/create">
        <Button variant="contained" color="primary">
          Create
        </Button>
      </Link>
      <TableContainer component={Paper} className="my-4">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Description</TableCell>
              <TableCell align="left">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell align="left">{perm.name}</TableCell>
                <TableCell align="left">{perm.description}</TableCell>
                <TableCell align="left">
                  <Stack direction="row" spacing={2}>
                    <Link href={`/auth/permissions/${perm.id}`}>
                      <Button variant="contained" color="info">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="contained"
                      onClick={() => handleRemovePermission(perm.id)}
                      color="error"
                    >
                      Remove
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

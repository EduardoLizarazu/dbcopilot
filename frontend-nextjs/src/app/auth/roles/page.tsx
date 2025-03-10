"use client";
import React from "react";
import {
  Button,
  CircularProgress,
  Container,
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
import { GetRoles } from "@/controller/_actions/index.actions";
import { GetRolesDataModel } from "@/data/model/index.data.model";

export default function RolesPage() {
  const [loading, setLoading] = React.useState<boolean>(true);

  const [roles, setRoles] = React.useState<GetRolesDataModel[]>([]);

  async function handleRoleEdit(id: number) {
    console.log("Edit Role with id: ", id);
  }

  async function handleRoleDelete(id: number) {
    console.log("Delete Role with id: ", id);
  }

  async function handleCreateRole() {
    console.log("Create Role");
  }

  React.useEffect(() => {
    (async () => {
      setRoles(await GetRoles());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h6">Roles</Typography>
      <Button onClick={handleCreateRole}>Create</Button>
      {roles.map((role) => (
        <div key={role.id} className="my-4">
          <Stack>
            <Typography variant="h6">
              {role.name} Role with Permissions:
            </Typography>
            <Container>
              <Stack>
                <Button onClick={() => handleRoleEdit(role.id)}>Editar</Button>
                <Button onClick={() => handleRoleDelete(role.id)}>
                  Eliminar
                </Button>
              </Stack>
            </Container>
          </Stack>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="left">Name</TableCell>
                  <TableCell align="left">Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {role.permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell align="left">{perm.name}</TableCell>
                    <TableCell align="left">{perm.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}
    </Container>
  );
}

"use client";
import {
  CreateRole,
  GetPermissions,
} from "@/controller/_actions/index.actions";
import {
  CreateRoleDataModel,
  GetPermissionDataModel,
} from "@/data/model/index.data.model";
import {
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

export default function CreateRolePage() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [roleName, setRoleName] = React.useState<string>("");

  const [permissions, setPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);

  React.useEffect(() => {
    (async () => {
      setPermissions(await GetPermissions()); // Set list of all permissions
      setLoading(false);
    })();
  }, []);

  async function handleCreateRole() {
    const createRoleDto: CreateRoleDataModel = {
      name: roleName,
      permissions: selectedPermissions,
    };
    await CreateRole(createRoleDto);
  }

  async function handleAddPermission(permission: GetPermissionDataModel) {
    // add permission to selected permission
    setSelectedPermissions([...selectedPermissions, permission]);
    // remove permission from permissions
    setPermissions(permissions.filter((perm) => perm.id !== permission.id));
  }

  async function handleRemovePermission(permission: GetPermissionDataModel) {
    // remove permission from selected permission
    setSelectedPermissions(
      selectedPermissions.filter((perm) => perm.id !== permission.id)
    );
    // add permission to permissions
    setPermissions([...permissions, permission]);
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4">Create Role</Typography>
      {/* Textfield for name */}

      <TextField
        id="name-textfield"
        label="Name"
        variant="standard"
        style={{ width: "100%" }}
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
      />
      <Divider className="my-8" />
      <Typography variant="h6">Permissions Selected: </Typography>
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
            {selectedPermissions.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell align="left">{perm.name}</TableCell>
                <TableCell align="left">{perm.description}</TableCell>
                <TableCell align="left">
                  <Button
                    variant="contained"
                    onClick={() => handleRemovePermission(perm)}
                    color="error"
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider className="my-8" />
      <Typography variant="h6">Permissions: </Typography>
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
                  <Button
                    variant="contained"
                    onClick={() => handleAddPermission(perm)}
                  >
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider className="my-8" />
      <Stack direction="row" spacing={2} sx={{ my: 2 }}>
        {/* Error color */}
        <Button
          variant="contained"
          color="error"
          onClick={() => history.back()}
        >
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={handleCreateRole}>
          Create Role
        </Button>
      </Stack>
    </Container>
  );
}

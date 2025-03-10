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
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

export default function CreateRolePage() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [roles, setRoles] = React.useState<CreateRoleDataModel>({
    name: "",
    permissions: [],
  });

  const [permissions, setPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);

  React.useEffect(() => {
    (async () => {
      setPermissions(await GetPermissions());
      setLoading(false);
    })();
  }, []);

  async function handleCreateRole() {
    await CreateRole(roles);
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
        value={roles.name}
        onChange={(e) => setRoles({ ...roles, name: e.target.value })}
      />

      <Divider className="my-8" />

      {/* Selected for permissions */}
      <Typography variant="h6">Permissions Selected: </Typography>

      <Divider className="my-8" />

      {/* Select for permissions */}
      <Typography variant="h6">Permissions: </Typography>

      <Divider className="my-8" />

      {/* Button to create role */}
      <Button variant="contained" onClick={handleCreateRole}>
        Create Role
      </Button>
    </Container>
  );
}

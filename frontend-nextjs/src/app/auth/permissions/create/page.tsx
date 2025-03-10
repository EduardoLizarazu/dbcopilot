"use client";
import React from "react";
import { CreatePermission } from "@/controller/_actions/index.actions";
import { CreatePermissionDataModel } from "@/data/model/index.data.model";
import {
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function CreatePermissionPage() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [permissionName, setPermissionName] = React.useState<string>("");
  const [permissionDescription, setPermissionDescription] =
    React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      setLoading(false);
    })();
  }, []);

  async function handleCreatePermission() {
    const createPermissionDto: CreatePermissionDataModel = {
      name: permissionName,
      description: permissionDescription,
    };
    await CreatePermission(createPermissionDto);
  }

  function handleCancelPermission() {
    history.back();
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4">Create permission:</Typography>

      <Stack direction="column" spacing={2}>
        <TextField
          id="name-textfield"
          label="Name"
          variant="standard"
          style={{ width: "100%" }}
          value={permissionName}
          onChange={(e) => setPermissionName(e.target.value)}
        />
        <TextField
          id="description-textfield"
          label="Description"
          variant="standard"
          style={{ width: "100%" }}
          value={permissionDescription}
          onChange={(e) => setPermissionDescription(e.target.value)}
        />
        {/* Button to create permission */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePermission}
          >
            Create
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelPermission}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

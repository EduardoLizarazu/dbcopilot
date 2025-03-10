"use client";
import React from "react";
import {
  GetPermissionById,
  UpdatePermission,
} from "@/controller/_actions/index.actions";
import {
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { UpdatePermissionDataModel } from "@/data/model/index.data.model";

interface UpdatePermissionPageProps {
  params: Promise<{
    permId: string;
  }>;
}

export default function UpdatePermissionPage({
  params,
}: UpdatePermissionPageProps) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [permId, setPermId] = React.useState<number>(0);
  const [permName, setPermName] = React.useState<string>("");
  const [permDescription, setPermDescription] = React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      const { permId } = await params;
      const permission = await GetPermissionById(parseInt(permId));
      setPermId(parseInt(permId));
      if (permission) {
        setPermName(permission.name);
        setPermDescription(permission.description);
      }
      setLoading(false);
    })();
  }, [params]);

  async function handleCreatePermission() {
    const createPermissionDto: UpdatePermissionDataModel = {
      id: permId,
      name: permName,
      description: permDescription,
    };
    await UpdatePermission(createPermissionDto);
  }

  function handleCancelPermission() {
    history.back();
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4">Update permission:</Typography>

      <Stack direction="column" spacing={2}>
        <TextField
          id="name-textfield"
          label="Name"
          variant="standard"
          style={{ width: "100%" }}
          value={permName}
          onChange={(e) => setPermName(e.target.value)}
        />
        <TextField
          id="description-textfield"
          label="Description"
          variant="standard"
          style={{ width: "100%" }}
          value={permDescription}
          onChange={(e) => setPermDescription(e.target.value)}
        />
        {/* Button to create permission */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePermission}
          >
            Update
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

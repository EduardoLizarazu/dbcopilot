"use client";
import React from "react";
import { CreatePermission } from "@/controller/_actions/permission/command/create-permission.action";
import { CreatePermissionDataModel } from "@/data/model/index.data.model";
import {
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { useRouter } from "next/navigation";

export default function CreatePermissionPage() {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

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
    try {
      await CreatePermission(createPermissionDto);
      setFeedback({
        isActive: true,
        severity: "success",
        message: "Permission created successfully!",
      });
      handleCancelPermission();
    } catch (error) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: "Failed to create permission.",
      });
      resetFeedBack();
    }
  }

  function handleCancelPermission() {
    router.push("/auth/permissions");
    resetFeedBack();
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Stack spacing={2} sx={{ marginTop: 4 }}>
        <Typography variant="h4">Create permission:</Typography>
        <Typography variant="subtitle1" gutterBottom>
          Fill in the details below to create a new permission.
        </Typography>
        {/* Form to create permission */}
        <Stack direction="column" spacing={2}>
          <TextField
            id="name-textfield"
            label="Name"
            variant="outlined"
            style={{ width: "100%" }}
            value={permissionName}
            onChange={(e) => setPermissionName(e.target.value)}
          />
          <TextField
            id="description-textfield"
            label="Description"
            variant="outlined"
            style={{ width: "100%" }}
            value={permissionDescription}
            multiline
            rows={4}
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
      </Stack>
    </Container>
  );
}

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
import { useRouter } from "next/navigation";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { ReadPermissionByIdAction } from "@/controller/_actions/permission/query/read-permission-by-id.action";
import { UpdatePermissionById } from "@/controller/_actions/permission/command/update-permission.action";

interface UpdatePermissionPageProps {
  params: Promise<{
    permId: string;
  }>;
}

export default function UpdatePermissionPage({
  params,
}: UpdatePermissionPageProps) {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  const [loading, setLoading] = React.useState<boolean>(true);

  const [permission, setPermission] = React.useState<{
    id: string;
    name: string;
    description: string;
  }>({
    id: "",
    name: "",
    description: "",
  });

  React.useEffect(() => {
    (async () => {
      const { permId } = await params;
      const permission = await ReadPermissionByIdAction(permId);
      setPermission({
        id: permission.id,
        name: permission.name,
        description: permission.description || "",
      });
      setLoading(false);
    })();
  }, [params]);

  async function handleCreatePermission() {
    try {
      const createPermissionDto: UpdatePermissionDataModel = {
        id: parseInt(permission.id, 10),
        name: permission.name,
        description: permission.description || "",
      };
      await UpdatePermissionById(createPermissionDto);
      setFeedback({
        isActive: true,
        severity: "success",
        message: "Permission updated successfully!",
      });
      handleCancelPermission();
    } catch (error) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: "Failed to update permission.",
      });
      resetFeedBack();
      return;
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
        <Typography variant="h4">Update permission:</Typography>
        <Typography variant="subtitle1" gutterBottom>
          Fill in the details below to create a new permission.
        </Typography>
        <Stack direction="column" spacing={2}>
          <TextField
            id="name-textfield"
            label="Name"
            variant="standard"
            style={{ width: "100%" }}
            value={permission.name}
            onChange={(e) =>
              setPermission({
                ...permission,
                name: e.target.value,
              })
            }
          />
          <TextField
            id="description-textfield"
            label="Description"
            variant="standard"
            style={{ width: "100%" }}
            value={permission.description}
            onChange={(e) =>
              setPermission({
                ...permission,
                description: e.target.value,
              })
            }
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
      </Stack>
    </Container>
  );
}

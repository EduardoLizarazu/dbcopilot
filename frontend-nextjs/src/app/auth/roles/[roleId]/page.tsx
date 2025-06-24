"use client";
import { useFeedbackContext } from "@/contexts/feedback.context";
import {
  GetPermissions,
  GetRoleById,
  UpdateRole,
} from "@/controller/_actions/index.actions";
import {
  EditRoleDataModel,
  GetPermissionDataModel,
} from "@/data/model/index.data.model";
import {
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useRouter } from "next/navigation";
import React from "react";
import { ReadAllPermissions } from "@/controller/_actions/permission/query/read-all-permission.action";
import { ReadRoleByIdWithPerm } from "@/controller/_actions/role/query/read-roles-by-id-with-perm.action";

interface EditRolePageProps {
  params: Promise<{
    roleId: string;
  }>;
}

type Permission = {
  id: string;
  name: string;
  description?: string;
};

type Role = {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
};

export default function EditRolePage({ params }: EditRolePageProps) {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [roleId, setRoleId] = React.useState<number>(0);
  const [roleName, setRoleName] = React.useState<string>("");
  const [permissions, setPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);

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

  async function handleEditRole() {
    const editRoleDto: EditRoleDataModel = {
      id: roleId,
      name: roleName,
      permissions: selectedPermissions,
    };
    await UpdateRole(editRoleDto);
  }

  React.useEffect(() => {
    (async () => {
      const { roleId } = await params;
      setRoleId(parseInt(roleId));
      const role = await ReadRoleByIdWithPerm(roleId);
      // const role = await GetRoleById(parseInt(roleId));

      if (role) {
        setRoleName(role.name || "");
        setSelectedPermissions(role.permissions || []);
        const permissions = await ReadAllPermissions();
        // Filter out permissions that are already selected from the array of objects
        const filteredPermissions = permissions.filter(
          (perm) =>
            !role.permissions?.find(
              (selectedPerm) => selectedPerm.id === perm.id
            )
        );
        setPermissions(filteredPermissions);
      }
      setLoading(false);
    })();
  }, [params]);

  function handleCancel() {
    router.push("/auth/permissions");
    resetFeedBack();
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container sx={{ my: 4 }}>
      <Stack spacing={2} sx={{ marginTop: 4 }}>
        <Typography variant="h4">Edit role</Typography>

        <TextField
          id="name-textfield"
          label="Name"
          variant="outlined"
          style={{ width: "100%" }}
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />
        <TextField
          id="description-textfield"
          label="Description"
          variant="outlined"
          style={{ width: "100%" }}
          value={""}
          multiline
          rows={4}
          onChange={(e) => {}}
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
                    <IconButton
                      aria-label="cancel"
                      size="small"
                      onClick={() => handleRemovePermission(perm)}
                      loading={false}
                    >
                      <RemoveCircleOutlineIcon fontSize="inherit" />
                    </IconButton>
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
                    <Tooltip title="add" placement="right">
                      <IconButton
                        size="small"
                        onClick={() => handleAddPermission(perm)}
                        loading={false}
                      >
                        <AddIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider className="my-8" />
        <Stack direction="row" spacing={2} sx={{ my: 2 }}>
          {/* Error color */}
          <Button variant="contained" color="error" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleEditRole}>
            Edit Role
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

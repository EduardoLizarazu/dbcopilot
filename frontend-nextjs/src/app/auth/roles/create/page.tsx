"use client";
import { GetPermissions } from "@/controller/_actions/index.actions";
import { GetPermissionDataModel } from "@/data/model/index.data.model";
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
import React from "react";
import { useRouter } from "next/navigation";
import { useFeedbackContext } from "@/contexts/feedback.context";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { CreateRoleWithPermAction } from "@/controller/_actions/role/command/create-role-with-perm.action";
import { ReadAllPermissions } from "@/controller/_actions/permission/query/read-all-permission.action";

type Permission = {
  id: string;
  name: string;
  description?: string;
};

type Role = {
  name: string;
  description?: string;
  permissions: Permission[];
};

export default function CreateRolePage() {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  const [loading, setLoading] = React.useState<boolean>(true);

  const [role, setRole] = React.useState({
    name: "",
    description: "",
  });

  const [permissions, setPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    GetPermissionDataModel[]
  >([]);

  React.useEffect(() => {
    (async () => {
      setPermissions(await ReadAllPermissions()); // Set list of all permissions
      setLoading(false);
    })();
  }, []);

  async function handleCreateRole() {
    try {
      const createRoleDto: Role = {
        name: role.name,
        description: role.description,
        permissions: selectedPermissions.map((perm) => ({
          id: perm.id.toString(),
          name: perm.name,
          description: perm.description,
        })),
      };
      await CreateRoleWithPermAction(createRoleDto);
      setFeedback({
        isActive: true,
        severity: "success",
        message: "Role created successfully!",
      });
      handleCancelRole();
    } catch (error) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: "Failed to create role.",
      });
      resetFeedBack();
    }
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

  function handleCancelRole() {
    router.push("/auth/roles");
    resetFeedBack();
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Stack spacing={2} sx={{ marginTop: 4 }}>
        <Typography variant="h4">Create Role</Typography>
        <Typography variant="subtitle1" gutterBottom>
          Fill in the details below to create a new permission.
        </Typography>
        {/* Textfield for name */}
        <TextField
          id="name-textfield"
          label="Name"
          variant="outlined"
          style={{ width: "100%" }}
          value={role.name}
          onChange={(e) => setRole({ ...role, name: e.target.value })}
        />
        <TextField
          id="description-textfield"
          label="Description"
          variant="outlined"
          style={{ width: "100%" }}
          value={role.description}
          multiline
          rows={4}
          onChange={(e) => {
            setRole({ ...role, description: e.target.value });
          }}
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
                    <Tooltip title="Remove" placement="right">
                      <IconButton
                        aria-label="cancel"
                        size="small"
                        onClick={() => handleRemovePermission(perm)}
                        loading={false}
                      >
                        <RemoveCircleOutlineIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
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
          <Button variant="contained" color="error" onClick={handleCancelRole}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateRole}
          >
            Create Role
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

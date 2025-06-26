"use client";
import {
  GetPermissions,
  GetRoles,
  GetUserById,
  UpdateUser,
} from "@/controller/_actions/index.actions";
import { ReadUserByIdAction } from "@/controller/_actions/user/query/read-user-by-id.action";
import {
  GetRolesDataModel,
  GetRolesForUserDataModel,
} from "@/data/model/index.data.model";
import { ReadPermissionOutput } from "@/useCase/dto/index.usecase.dto";
import { UpdateUserUseCaseInput } from "@/useCase/index.usecase";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  Switch,
  Tab,
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
interface UpdateUserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

type User = {
  id: number;
  name: string;
  username: string;
  password: string;
  roles: Role[];
};

type Role = {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
};

type Permission = {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
};

export default function UpdateUserPage({ params }: UpdateUserPageProps) {
  // HOOK
  const [loading, setLoading] = React.useState<boolean>(true);
  const [value, setValue] = React.useState("1");

  const [userData, setUserData] = React.useState<User>({
    id: 0,
    name: "",
    username: "",
    password: "",
    roles: [
      {
        id: 0,
        name: "",
        description: "",
        permissions: [
          {
            id: 0,
            name: "",
            description: "",
            isActive: false,
          },
        ],
      },
    ],
  });

  const [roles, setRoles] = React.useState<GetRolesDataModel[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<
    GetRolesForUserDataModel[]
  >([]);

  const [selectedPermissions, setSelectedPermissions] = React.useState<
    ReadPermissionOutput[]
  >([]);

  // Fetch user data once when params change
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { userId } = await params;
      const userRetrieved = await ReadUserByIdAction(parseInt(userId));
      setUserData({
        id: userData.id,
        username: userData.username,
        password: userData.password,
        name: userData.name,
        roles: userData.roles,
      });

      setSelectedRoles(roles || []);
      setLoading(false);
    })();
  }, [params]);

  // Fetch roles and permissions once and store them`
  React.useEffect(() => {
    (async () => {
      if (value === "1") {
        const allRoles = await GetRoles();
        setRoles(
          allRoles.filter(
            (role) => !selectedRoles.some((r) => r.id === role.id)
          )
        );
      }
    })();
  }, [value]);

  // HANDLERS

  function handleChange(event: React.SyntheticEvent, newValue: string) {
    setValue(newValue);
  }

  function handleOnChangeRolePerm(rolePermId: number, roleId: number) {
    // find the permission
    const permission = selectedRoles
      .find((role) => role.id === roleId)
      ?.permissions.find((perm) => perm.id === rolePermId);

    if (permission) {
      permission.isActive = !permission.isActive;
      setSelectedRoles(
        selectedRoles.map((role) => {
          if (role.id === roleId) {
            return {
              ...role,
              permissions: role.permissions.map((perm) => {
                if (perm.id === rolePermId) {
                  return permission;
                }
                return perm;
              }),
            };
          }
          return role;
        })
      );
    }
  }

  async function handleUpdate() {
    // Only permissions of the role with the ID of its specific role
    const rolePermission = selectedRoles
      .map((role) => {
        return role.permissions.map((perm) => {
          return {
            roleId: role.id,
            id: perm.id,
            name: perm.name,
            description: perm.description,
            isActive: perm.isActive,
          };
        });
      })
      .flat();
    const createUserDto: UpdateUserUseCaseInput = {
      user: {
        id,
        username,
        email,
        password: "password",
        firstName,
        lastName,
        phone,
      },
      role: selectedRoles,
      permission: selectedPermissions,
      rolePermission: rolePermission,
    };
    console.log("create user dto: ", createUserDto);
    await UpdateUser(createUserDto);
    // go back to users page
    // window.location.href = "/auth/users";
  }

  function handleAddRole(roleId: number) {
    const role = roles.find((role) => role.id === roleId);
    if (role) {
      setSelectedRoles([
        ...selectedRoles,
        {
          ...role,
          permissions: role.permissions.map((perm) => ({
            ...perm,
            isActive: false,
          })),
        },
      ]);
    }
    setRoles(roles.filter((r) => r.id !== roleId));
  }

  function handleRemoveRole(roleId: number) {
    const role = selectedRoles.find((role) => role.id === roleId);
    if (role) {
      setRoles([...roles, role]);
    }
    setSelectedRoles(selectedRoles.filter((r) => r.id !== roleId));
  }

  // RENDERS
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Stack spacing={2} sx={{ marginTop: 4 }}>
        <Typography variant="h4">Create User:</Typography>
        <Stack spacing={2}>
          <TextField
            id="name-textfield"
            label="name"
            variant="outlined"
            style={{ width: "100%" }}
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          />

          <TextField
            id="username-textfield"
            label="username"
            variant="outlined"
            style={{ width: "100%" }}
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
          />

          <TextField
            id="password-textfield"
            label="password"
            variant="outlined"
            style={{ width: "100%" }}
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
          />
          <Stack direction="row" spacing={2}>
            <Button color="primary" variant="contained" onClick={handleUpdate}>
              Update
            </Button>
            <Link href="/auth/users">
              <Button color="error" variant="contained">
                Cancel
              </Button>
            </Link>
          </Stack>
        </Stack>

        <Divider className="my-8" />

        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={handleChange} aria-label="authorization tabs">
                <Tab label="Roles" value="1" />
                <Tab label="Direct Permission" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <Stack spacing={2} sx={{ marginTop: 1 }}>
                <Typography variant="h5">Add and remove roles:</Typography>
                <Typography variant="h6">Selected roles:</Typography>
                {selectedRoles.map((role) => (
                  <div key={role.id} className="my-4">
                    <Stack direction="row" spacing={2}>
                      <Typography variant="h6">
                        {role.name} Role with Permissions:
                      </Typography>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveRole(role.id)}
                      >
                        Remover
                      </Button>
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
                            <TableCell align="left">Active/Inactive</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {role.permissions.map((perm) => (
                            <TableRow key={perm.id}>
                              <TableCell align="left">{perm.name}</TableCell>
                              <TableCell align="left">
                                {perm.description}
                              </TableCell>
                              <TableCell align="left">
                                <Switch
                                  checked={perm.isActive}
                                  onChange={() =>
                                    handleOnChangeRolePerm(perm.id, role.id)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                ))}
                <Divider className="my-8" />
                <Typography variant="h6">Roles to be selected:</Typography>
                {roles.map((role) => (
                  <div key={role.id} className="my-4">
                    <Stack direction="row" spacing={2}>
                      <Typography variant="h6">
                        {role.name} Role with Permissions:
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddRole(role.id)}
                      >
                        Add
                      </Button>
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
                              <TableCell align="left">
                                {perm.description}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                ))}
              </Stack>
            </TabPanel>
          </TabContext>
        </Box>
      </Stack>
    </Container>
  );
}

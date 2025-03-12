"use client";
import {
  GetPermissions,
  GetRoles,
  GetUserById,
  UpdateUser,
} from "@/controller/_actions/index.actions";
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

export default function UpdateUserPage({ params }: UpdateUserPageProps) {
  // HOOK
  const [loading, setLoading] = React.useState<boolean>(true);
  const [value, setValue] = React.useState("1");
  const [id, setId] = React.useState<number>(0);
  const [username, setUsername] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [firstName, setFirstName] = React.useState<string>("");
  const [lastName, setLastName] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");

  const [roles, setRoles] = React.useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<any[]>([]);

  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<any[]>(
    []
  );

  // Fetch user data once when params change
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { userId } = await params;
      const { user, roles, directPermissions } = await GetUserById(
        parseInt(userId)
      );
      setId(user.id);
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      setSelectedRoles(roles || []);
      setSelectedPermissions(directPermissions || []);
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
      if (value === "2") {
        const allPermissions = await GetPermissions();
        // Filter the permissions that are already on the role's permissions
        const permissionsFiltered = allPermissions.filter((perm) => {
          return !selectedRoles.some((role) =>
            role.permissions.some((p) => p.id === perm.id)
          );
        });

        // Filter the permissions that are already on the selected permissions
        const permissionsFiltered2 = permissionsFiltered.filter((perm) => {
          return !selectedPermissions.some((p) => p.id === perm.id);
        });

        setPermissions(permissionsFiltered2);
      }
    })();
  }, [selectedPermissions, selectedRoles, value]);

  // HANDLERS

  function handleChange(event: React.SyntheticEvent, newValue: string) {
    setValue(newValue);
  }

  function handleAddPermission(permission) {
    // add permission to selected permission
    setSelectedPermissions([...selectedPermissions, permission]);
    // remove permission from permissions
    setPermissions(permissions.filter((perm) => perm.id !== permission.id));
  }
  function handleRemovePermission(permission) {
    // remove permission from selected permission
    setSelectedPermissions(
      selectedPermissions.filter((perm) => perm.id !== permission.id)
    );
    // add permission to permissions
    setPermissions([...permissions, permission]);
  }

  async function handleUpdate() {
    const createUserDto = {
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
    };
    await UpdateUser(createUserDto);
    // go back to users page
    window.location.href = "/auth/users";
  }

  function handleAddRole(roleId) {
    const role = roles.find((role) => role.id === roleId);
    setSelectedRoles([...selectedRoles, role]);
    setRoles(roles.filter((r) => r.id !== roleId));
  }

  function handleRemoveRole(roleId) {
    const role = selectedRoles.find((role) => role.id === roleId);
    setRoles([...roles, role]);
    setSelectedRoles(selectedRoles.filter((r) => r.id !== roleId));
  }

  // RENDERS
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4">Create User:</Typography>
      <Stack spacing={2}>
        <TextField
          id="firstName-textfield"
          label="firstName"
          variant="standard"
          style={{ width: "100%" }}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          id="lastName-textfield"
          label="lastName"
          variant="standard"
          style={{ width: "100%" }}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          id="username-textfield"
          label="username"
          variant="standard"
          style={{ width: "100%" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          id="email-textfield"
          label="email"
          variant="standard"
          style={{ width: "100%" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="phone-textfield"
          label="phone"
          variant="standard"
          style={{ width: "100%" }}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
                          <TableCell align="left">{perm.description}</TableCell>
                          <TableCell align="left">
                            <Switch
                            //
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
                          <TableCell align="left">{perm.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            ))}
          </TabPanel>
          <TabPanel value="2">
            <Typography variant="h6">Permissions Selected: </Typography>
            <TableContainer component={Paper} className="my-4">
              <Table
                sx={{ minWidth: 650 }}
                size="small"
                aria-label="simple table"
              >
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
              <Table
                sx={{ minWidth: 650 }}
                size="small"
                aria-label="simple table"
              >
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
          </TabPanel>
        </TabContext>
      </Box>
    </Container>
  );
}

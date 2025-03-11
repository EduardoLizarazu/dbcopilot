"use client";
import { CreateUser } from "@/controller/_actions/index.actions";
import {
  Button,
  CircularProgress,
  Container,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

export default function CreateUserPage() {
  // HOOK
  const [loading, setLoading] = React.useState<boolean>(true);
  const [username, setUsername] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [firstName, setFirstName] = React.useState<string>("");
  const [lastName, setLastName] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");

  const [roles, setRoles] = React.useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<any[]>([]);

  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = React.useState<any[]>(
    []
  );

  React.useEffect(() => {
    (async () => {
      setLoading(false);
    })();
  }, []);

  // HANDLERS

  async function handleCreate() {
    const createUserDto = {
      user: {
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
      },
      role: selectedRoles,
      permission: selectedPermissions,
    };
    await CreateUser(createUserDto);
    // go back to users page
    window.location.href = "/auth/users";
  }

  // RENDERS
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h6">Create User:</Typography>
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
          id="password-textfield"
          label="password"
          variant="standard"
          style={{ width: "100%" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          <Button color="primary" variant="contained" onClick={handleCreate}>
            Create
          </Button>
          <Link href="/auth/users">
            <Button color="error" variant="contained">
              Cancel
            </Button>
          </Link>
        </Stack>
      </Stack>

      <Divider className="my-8" />
    </Container>
  );
}

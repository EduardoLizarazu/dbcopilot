"use client";
import React from "react";
import {
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function CreateConnectionPage() {
  // USE STATE
  const [loading, setLoading] = React.useState<boolean>(true);
  const [connName, setConnName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [databaseType, setDatabaseType] = React.useState<string>("");
  const [host, setHost] = React.useState<string>("");
  const [port, setPort] = React.useState<number>(0);
  const [databaseName, setDatabaseName] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  // USE EFFECT
  React.useEffect(() => {
    (async () => {
      setLoading(true);

      // Fetch data here

      setLoading(false);
    })();
  }, []);

  // HANDLERS

  async function handleCreate() {
    // Create connection here
    console.log("Create connection");
  }

  async function handleCancel() {
    // Cancel create connection
    console.log("Cancel create connection");
  }

  async function handleTest() {
    // Test connection
    console.log("Test connection");
  }

  // RENDERS
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Stack spacing={3}>
        <Typography variant="h4">Create Connection</Typography>
        {/* Textfield for connection name */}
        <TextField
          label="Connection Name"
          variant="standard"
          style={{ width: "100%" }}
          value={connName}
          onChange={(e) => setConnName(e.target.value)}
        />
        {/* Textfield for description */}
        <TextField
          label="Description"
          variant="standard"
          style={{ width: "100%" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {/* Textfield for database type */}
        <TextField
          label="Database Type"
          variant="standard"
          style={{ width: "100%" }}
          value={databaseType}
          onChange={(e) => setDatabaseType(e.target.value)}
        />
        {/* Textfield for host */}
        <TextField
          label="Host"
          variant="standard"
          style={{ width: "100%" }}
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        {/* Textfield for port */}
        <TextField
          label="Port"
          variant="standard"
          style={{ width: "100%" }}
          value={port}
          onChange={(e) => setPort(parseInt(e.target.value))}
        />
        {/* Textfield for database name */}
        <TextField
          label="Database Name"
          variant="standard"
          style={{ width: "100%" }}
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}
        />

        {/* Textfield for username */}
        <TextField
          label="Username"
          variant="standard"
          style={{ width: "100%" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {/* Textfield for password */}
        <TextField
          label="Password"
          variant="standard"
          style={{ width: "100%" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button variant="contained" color="secondary" onClick={handleTest}>
          Test Connection
        </Button>

        <Stack direction="row" spacing={2}>
          {/* Button for create */}
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Create
          </Button>

          {/* Button for cancel */}
          <Button variant="contained" color="error" onClick={handleCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

"use client";
import React from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CreateConnectionAction, ReadAllDatabaseTypeAction, ReadDatabaseTypeOutput } from "@/controller/_actions/index.actions";

enum isSuccessConnEnum {
  NULL = 0,
  SUCCESS = 1,
  FAIL = 2,
  PROCESS = 3,
}

export default function CreateConnectionPage() {
  // USE STATE
  const [loading, setLoading] = React.useState<boolean>(true);
  const [connName, setConnName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [databaseType, setDatabaseType] = React.useState<ReadDatabaseTypeOutput[]>([]);
  const [databaseTypeId, setDatabaseTypeId] = React.useState<number>(0);
  const [host, setHost] = React.useState<string>("");
  const [port, setPort] = React.useState<number>(0);
  const [databaseName, setDatabaseName] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  const [isSuccessConn, setIsSuccessConn] = React.useState<isSuccessConnEnum>(
    isSuccessConnEnum.NULL
  );

  // USE EFFECT
  React.useEffect(() => {
    (async () => {
      setLoading(true);

      // Fetch data here
      const responseDbTypes = await ReadAllDatabaseTypeAction();
      setDatabaseType(() => {
        return responseDbTypes.map((item) => ({
          id: item.id || 0,
          name: item.name || "",
          type: item.type || "",
        }));
      });

      setLoading(false);
    })();
  }, []);

  // HANDLERS

  async function handleCreate() {
    // Create connection here
    console.log("Create connection");

    await CreateConnectionAction({
      name: connName,
      description,
      dbTypeId: databaseTypeId,
      dbHost: host,
      dbPort: port,
      dbName: databaseName,
      dbUsername: username,
      dbPassword: password,
    })
  }

  async function handleCancel() {
    // Cancel create connection
    console.log("Cancel create connection");
  }

  async function handleTest() {
    // Test connection
    console.log("Test connection");
    setIsSuccessConn(isSuccessConnEnum.PROCESS);
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
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={databaseType}
          getOptionLabel={(option) => option.type}
          onChange={(event, newValue) => {
            if (newValue) {
              setDatabaseTypeId(newValue.id);
            } else {
              setDatabaseTypeId(0); // or handle null case appropriately
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Database Type" variant="standard" />
          )}
        />
        {/* Textfield for host */}
        <TextField
          label="Host"
          variant="standard"
          style={{ width: "100%" }}
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        {/* Textfield for port -- only numbers */}
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

        <Stack
          spacing={2}
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
            }}
          >
            <Button variant="contained" color="secondary" onClick={handleTest}>
              Test Connection
            </Button>

            {isSuccessConn === isSuccessConnEnum.PROCESS && (
              <CircularProgress color="secondary" />
            )}

            {isSuccessConn === isSuccessConnEnum.SUCCESS && (
              <Typography variant="body2" color="success">
                Connection Success
              </Typography>
            )}

            {isSuccessConn === isSuccessConnEnum.FAIL && (
              <Typography variant="body2" color="error">
                Connection Fail
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Create
            </Button>
            <Button variant="contained" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}

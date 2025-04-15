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
import {
  CreateConnectionAction,
  CreateConnectionInput,
  ReadAllDatabaseTypeAction,
  ReadDatabaseTypeOutput,
  TestConnectionAction,
} from "@/controller/_actions/index.actions";
import { FeedbackSnackBar } from "@/components/schema/feedbackStanckBar";
import Link from "next/link";

interface Connection extends Omit<CreateConnectionInput, "dbPort"> {
  dbPort: string;
}

export default function CreateConnectionPage() {
  // USE STATE
  const [loading, setLoading] = React.useState<boolean>(true);

  const [conn, setConn] = React.useState<Connection>({
    name: "",
    description: "",
    dbTypeId: 0,
    dbHost: "",
    dbPort: "",
    dbName: "",
    dbUsername: "",
    dbPassword: "",
  });

  const [databaseType, setDatabaseType] = React.useState<
    ReadDatabaseTypeOutput[]
  >([]);
  const [databaseTypeId, setDatabaseTypeId] = React.useState<number>(0);
  const [openFeedback, setOpenFeedback] = React.useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string>("");
  const [feedbackSeverity, setFeedbackSeverity] = React.useState<
    "success" | "error" | undefined
  >(undefined);

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
      name: conn.name,
      description: conn.description,
      dbTypeId: databaseTypeId,
      dbHost: conn.dbHost,
      dbPort: parseInt(conn.dbPort),
      dbName: conn.dbName,
      dbUsername: conn.dbUsername,
      dbPassword: conn.dbPassword,
    })
      .then((res) => {
        console.log("Create connection response: ", res);
        setFeedbackMessage("Connection created successfully");
        setFeedbackSeverity("success");
        setOpenFeedback(true);
      })
      .catch((err) => {
        console.error("Error creating connection: ", err);
        setFeedbackMessage("Error creating connection");
        setFeedbackSeverity("error");
        setOpenFeedback(true);
      });
  }

  async function handleCancel() {
    // Cancel create connection
    console.log("Cancel create connection");
  }

  async function handleTest() {
    // Test connection
    console.log("Test connection");
    await TestConnectionAction({
      name: conn.name,
      description: conn.description,
      dbTypeId: databaseTypeId,
      dbHost: conn.dbHost,
      dbPort: parseInt(conn.dbPort),
      dbName: conn.dbName,
      dbUsername: conn.dbUsername,
      dbPassword: conn.dbPassword,
    })
      .then((res) => {
        console.log("Test connection response: ", res);
        setFeedbackMessage("Connection tested successfully");
        setFeedbackSeverity("success");
        setOpenFeedback(true);
      })
      .catch((err) => {
        console.error("Error testing connection: ", err);
        setFeedbackMessage("Error testing connection");
        setFeedbackSeverity("error");
        setOpenFeedback(true);
      });
  }

  function handleTextField(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setConn((prev) => ({ ...prev, [name]: value }));
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
          label="Name"
          name="name"
          variant="standard"
          style={{ width: "100%" }}
          value={conn.name}
          onChange={handleTextField}
        />
        {/* Textfield for description */}
        <TextField
          label="Description"
          name="description"
          variant="standard"
          style={{ width: "100%" }}
          value={conn.description}
          onChange={handleTextField}
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
          name="dbHost"
          variant="standard"
          style={{ width: "100%" }}
          value={conn.dbHost}
          onChange={handleTextField}
        />
        {/* Textfield for port -- only numbers */}
        <TextField
          label="Port"
          name="dbPort"
          variant="standard"
          style={{ width: "100%" }}
          value={conn.dbPort}
          onChange={handleTextField}
        />
        {/* Textfield for database name */}
        <TextField
          label="Database Name"
          name="dbName"
          variant="standard"
          style={{ width: "100%" }}
          value={conn.dbName}
          onChange={handleTextField}
        />

        {/* Textfield for username */}
        <TextField
          label="Username"
          name="dbUsername"
          variant="standard"
          style={{ width: "100%" }}
          value={conn.dbUsername}
          onChange={handleTextField}
        />
        {/* Textfield for password */}
        <TextField
          label="Password"
          name="dbPassword"
          variant="standard"
          style={{ width: "100%" }}
          value={conn.dbPassword}
          onChange={handleTextField}
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
            {feedbackSeverity === "success" && (
              <Typography variant="body1" color="green">
                Connection successful
              </Typography>
            )}

            {feedbackSeverity === "error" && (
              <Typography variant="body1" color="red">
                Connection failed
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Create
            </Button>
            <Button variant="contained" color="error" onClick={handleCancel}>
              <Link href={"/connection"}>CANCEL</Link>
            </Button>
          </Stack>
        </Stack>
      </Stack>
      {/* Feedback message */}
      <FeedbackSnackBar
        open={openFeedback}
        setOpen={setOpenFeedback}
        message={feedbackMessage}
        severity={feedbackSeverity}
      />
    </Container>
  );
}

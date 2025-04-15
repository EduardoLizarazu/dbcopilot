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
import Link from "next/link";
import { FeedbackSnackBar } from "@/components/shared/feedbackSnackBar";
import { useRouter } from "next/navigation";

interface Connection extends Omit<CreateConnectionInput, "dbPort"> {
  dbPort: string;
}

export default function CreateConnectionPage() {
  const router = useRouter();

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

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
  });

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

  function resetFeedBack() {
    setTimeout(() => {
      setFeedback({
        isActive: false,
        message: "",
        severity: null,
      });
    }, 3000);
  }

  async function handleCreate() {
    // Create connection here
    console.log("Creating connection...");
    try {
      const res = await CreateConnectionAction({
        name: conn.name,
        description: conn.description,
        dbTypeId: databaseTypeId,
        dbHost: conn.dbHost,
        dbPort: parseInt(conn.dbPort),
        dbName: conn.dbName,
        dbUsername: conn.dbUsername,
        dbPassword: conn.dbPassword || "",
      });

      if (res?.status === 201) {
        setFeedback({
          isActive: true,
          message: "Connection created successfully",
          severity: "success",
        });
        console.log("Connection created successfully", feedback);
      } else {
        setFeedback({
          isActive: true,
          message: "Connection creation failed",
          severity: "error",
        });
        console.log("Connection creation failed", feedback);
      }
    } catch (err) {
      console.error("Error creating connection: ", err);
      setFeedback({
        isActive: true,
        message: "Error creating connection",
        severity: "error",
      });
    } finally {
      // time - feedback
      resetFeedBack();
      setConn({
        name: "",
        description: "",
        dbTypeId: 0,
        dbHost: "",
        dbPort: "",
        dbName: "",
        dbUsername: "",
        dbPassword: "",
      });

      router.back();
    }
  }

  async function handleCancel() {
    // Cancel create connection
    console.log("Cancel create connection");
  }

  async function handleTest() {
    try {
      console.log("Testing connection...");

      // Test connection here
      const response = await TestConnectionAction({
        dbTypeId: databaseTypeId,
        dbHost: conn.dbHost,
        dbPort: parseInt(conn.dbPort),
        dbName: conn.dbName,
        dbUsername: conn.dbUsername,
        dbPassword: conn.dbPassword || "",
        name: conn.name,
        description: conn.description,
      });
      console.log("Response: ", response);

      if (response?.status === 201) {
        setFeedback({
          isActive: true,
          message: "Connection successful",
          severity: "success",
        });
        console.log("Connection successful", feedback);
      } else {
        setFeedback({
          isActive: true,
          message: "Connection failed",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error testing connection: ", err);
      setFeedback({
        isActive: true,
        message: "Error testing connection",
        severity: "error",
      });
    } finally {
      // time - feedback
      resetFeedBack();
    }
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
          type="password"
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
          <Button variant="contained" color="secondary" onClick={handleTest}>
            Test Connection
          </Button>
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
      {feedback.isActive && (
        <FeedbackSnackBar
          message={feedback.message}
          severity={feedback.severity}
        />
      )}
    </Container>
  );
}

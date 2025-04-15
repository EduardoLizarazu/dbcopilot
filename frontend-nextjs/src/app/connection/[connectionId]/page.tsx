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
  CreateConnectionInput,
  ReadAllDatabaseTypeAction,
  ReadConnectionByIdAction,
  ReadDatabaseTypeOutput,
  TestConnectionAction,
  UpdateConnectionAction,
} from "@/controller/_actions/index.actions";
import Link from "next/link";
import { FeedbackSnackBar } from "@/components/shared/feedbackSnackBar";
import { useRouter } from "next/navigation";

interface Connection extends Omit<CreateConnectionInput, "dbPort"> {
  id: number;
  dbPort: string;
}

export default function Page({ params }: { params: { connectionId: string } }) {
  const router = useRouter();

  // USE STATE
  const [loading, setLoading] = React.useState<boolean>(true);
  const [databaseTypeId, setDatabaseTypeId] = React.useState<number>(0);

  const [databaseType, setDatabaseType] = React.useState<
    ReadDatabaseTypeOutput[]
  >([]);
  const [conn, setConn] = React.useState<Connection>({
    id: 0,
    name: "",
    description: "",
    dbTypeId: 0,
    dbHost: "",
    dbPort: "",
    dbName: "",
    dbUsername: "",
    dbPassword: "",
    is_connected: false,
  });

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
  });
  // USE EFFECT
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { connectionId } = params;

      const connRes = await ReadConnectionByIdAction(parseInt(connectionId));
      setConn({
        id: connRes.id || 0,
        name: connRes.name || "",
        description: connRes.description || "",
        dbTypeId: connRes.dbTypeId || 0,
        dbHost: connRes.dbHost || "",
        dbPort: connRes.dbPort.toString() || "",
        dbName: connRes.dbName || "",
        dbUsername: connRes.dbUsername || "",
        dbPassword: connRes.dbPassword || "",
        is_connected: connRes.is_connected || false,
      });

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

  async function handleUpdate() {
    // Create connection here
    console.log("Update connection...");

    try {
      const res = await UpdateConnectionAction(conn.id, {
        name: conn.name,
        description: conn.description,
        dbTypeId: databaseTypeId,
        dbHost: conn.dbHost,
        dbPort: parseInt(conn.dbPort),
        dbName: conn.dbName,
        dbUsername: conn.dbUsername,
        dbPassword: conn.dbPassword,
        is_connected: conn.is_connected,
      });
      console.log("res updating...", res);

      if (res?.status === 200) {
        setFeedback({
          isActive: true,
          message: "Connection updated successfully",
          severity: "success",
        });
        console.log("Connection updated successfully", feedback);
        setTimeout(() => {
          router.back();
        }, 3000);
      } else {
        setFeedback({
          isActive: true,
          message: "Connection update failed",
          severity: "error",
        });
      }
    } catch {
      setFeedback({
        isActive: true,
        message: "Connection update failed",
        severity: "error",
      });
    } finally {
      resetFeedBack();
    }
  }

  async function handleCancel() {
    // Cancel create connection
    console.log("Cancel create connection");
  }

  async function handleTest() {
    // Test connection
    console.log("Test connection");
    try {
      const res = await TestConnectionAction({
        dbTypeId: databaseTypeId,
        dbHost: conn.dbHost,
        dbPort: parseInt(conn.dbPort),
        dbName: conn.dbName,
        dbUsername: conn.dbUsername,
        dbPassword: conn.dbPassword || "",
        name: conn.name,
        description: conn.description,
      });

      if (res?.status === 201) {
        setFeedback({
          isActive: true,
          message: "Connection test successful",
          severity: "success",
        });
        setConn((prev) => ({ ...prev, is_connected: true }));
      } else {
        setFeedback({
          isActive: true,
          message: "Connection test failed",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error testing connection: ", err);
      setFeedback({
        isActive: true,
        message: "Connection test failed",
        severity: "error",
      });
    } finally {
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
        <Typography variant="h4">Update Connection</Typography>
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
          <Stack spacing={2} direction="row">
            <Button variant="contained" color="secondary" onClick={handleTest}>
              Test Connection
            </Button>
            <Typography variant="caption" color="text.secondary">
              {conn.is_connected ? "Connected" : "Not Connected"}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={handleUpdate}>
              Update
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

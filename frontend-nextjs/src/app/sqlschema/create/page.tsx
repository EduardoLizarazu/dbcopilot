"use client";
import { CreateSqlSchemaAction } from "@/controller/_actions/index.actions";
import { CreateSqlSchemaActionInput } from "@/controller/_actions/sqlschema/interface/sqlschema_create.interface";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
export default function Page() {
  const router = useRouter();
  // USE STATE
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<CreateSqlSchemaActionInput>({
    name: "",
    type: "",
    query: "",
  });
  const [type, setType] = React.useState<string>("");

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
  });

  // HANDLER

  function resetFeedback() {
    setTimeout(() => {
      setFeedback({
        isActive: false,
        message: "",
        severity: null,
      });
    }, 2000); // Reset feedback after 2 seconds
  }

  function resetData() {
    setData({
      name: "",
      type: "",
      query: "",
    });
  }

  async function handleCreate(): Promise<void> {
    try {
      const response = await CreateSqlSchemaAction({
        name: data.name,
        type: type,
        query: data.query,
      });
      console.log("Response from API:", response);

      if (response.status === 201) {
        setFeedback({
          isActive: true,
          message: "Connection deleted successfully.",
          severity: "success",
        });
        setTimeout(() => {
          router.back(); // Refresh the page to reflect the changes
        }, 3000);
      } else {
        setFeedback({
          isActive: true,
          message: "Failed to delete connection.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating SQL schema:", error);
      setFeedback({
        isActive: true,
        message: "Failed to create SQL schema.",
        severity: "error",
      });
    } finally {
      resetFeedback();
      resetData();
    }
  }

  function handleTextField(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }

  // RENDER
  if (loading) {
    return <CircularProgress />;
  }

  const dbTypes = [
    { label: "postgres" },
    { label: "oracle" },
    { label: "mysql" },
    { label: "mssql" },
  ];

  return (
    <Container>
      <Stack spacing={2}>
        <Typography variant="h4">Create SQL Schema</Typography>
        <TextField
          label="Name"
          name="name"
          variant="outlined"
          value={data.name}
          onChange={handleTextField}
          fullWidth
        />
        <Autocomplete
          disablePortal
          options={dbTypes}
          sx={{ width: 300 }}
          onChange={(event, newValue) => {
            setType(newValue?.label || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Database Types" />
          )}
        />
        <TextField
          label="SQL Schema"
          name="query"
          variant="outlined"
          value={data.query}
          onChange={handleTextField}
          fullWidth
          multiline
          rows={4}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={handleCreate}>Create</Button>
          <Button onClick={resetData}>Reset</Button>
        </Stack>
      </Stack>
    </Container>
  );
}

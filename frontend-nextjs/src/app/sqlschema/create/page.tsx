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
import React from "react";
export default function Page() {
  // USE STATE
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<CreateSqlSchemaActionInput>({
    name: "",
    type: "",
    query: "",
  });
  const [type, setType] = React.useState<string>("");

  // USE EFFECT
  React.useEffect(() => {}, []);

  // HANDLER

  async function handleCreate(): Promise<void> {
    try {
      await CreateSqlSchemaAction({
        name: data.name,
        type: type,
        query: data.query,
      });
    } catch (error) {
      console.error("Error creating SQL schema:", error);
      alert("Error creating SQL schema. Please try again.");
    }
  }

  function handleTextField(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }

  function resetData() {
    setData({
      name: "",
      type: "",
      query: "",
    });
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
          value={name}
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

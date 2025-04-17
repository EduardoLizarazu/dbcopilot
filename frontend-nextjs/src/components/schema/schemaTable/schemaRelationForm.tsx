"use client";
import { useSchemaContext } from "@/contexts/schema.context";
import { Button, Container, Stack, TextField, Typography } from "@mui/material";
import React from "react";

export function SchemaRelationForm() {
  const { foreignKey, setForeignKey } = useSchemaContext();

  const [foreignKeyDesc, setForeignKeyDesc] = React.useState<string>("");

  // Function to retrieve table and the column, base on the columns key

  async function handleSave() {}

  async function handleCancel() {
    setForeignKey({
      relation_child_id: 0,
      relation_parent_id: 0,
      isEditing: false,
    });
  }

  return (
    <>
      <Container>
        <Typography variant="h6" gutterBottom>
          Create Relationship
        </Typography>
        <Typography variant="body1" gutterBottom>
          Parent Table: {foreignKey.relation_parent_id}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Parent Column: {foreignKey.relation_parent_id}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Child Table: {foreignKey.relation_child_id}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Child Column: {foreignKey.relation_child_id}
        </Typography>
        <TextField
          label="Parent Table Name"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={5}
          value={foreignKeyDesc}
          onChange={(e) => setForeignKeyDesc(e.target.value)}
        />
        <Stack direction="row" spacing={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </Stack>
      </Container>
    </>
  );
}

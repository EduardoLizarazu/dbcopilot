"use client";
import { useSchemaContext } from "@/contexts/schema.context";
import { TSchemaColumnWithTableSimple } from "@/controller/_actions/schema/interface/schema_column.interface";
import {
  ReadColumnByIdWithTable,
  SchemaRelationCreateAction,
} from "@/controller/_actions/schema/schema.action";
import {
  Button,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { Suspense } from "react";

type TSchemaColumnWithTableState = {
  data: TSchemaColumnWithTableSimple | null;
  status: number;
};

export function SchemaRelationForm() {
  const { foreignKey, setForeignKey } = useSchemaContext();

  const [foreignKeyDesc, setForeignKeyDesc] = React.useState<string>("");

  const [schemaPrimary, setSchemaPrimary] =
    React.useState<TSchemaColumnWithTableState>({
      data: null,
      status: 0,
    });
  const [schemaForeign, setSchemaForeign] =
    React.useState<TSchemaColumnWithTableState>({
      data: null,
      status: 0,
    });

  // Function to retrieve table and the column, base on the columns key
  React.useEffect(() => {
    (async () => {
      const schemaPrimaryData = await ReadColumnByIdWithTable(
        foreignKey.relation_parent_id
      );
      setSchemaPrimary(schemaPrimaryData);
      const schemaForeignData = await ReadColumnByIdWithTable(
        foreignKey.relation_child_id
      );
      setSchemaForeign(schemaForeignData);
    })();
  }, []);

  function resetForeignKey() {
    setForeignKey({
      relation_child_id: 0,
      relation_parent_id: 0,
      isAddingDesc: false,
      isAddingPk: false,
    });
    setForeignKeyDesc("");
  }

  async function handleSave() {
    const res = await SchemaRelationCreateAction({
      columnIdFather: foreignKey.relation_parent_id,
      columnIdChild: foreignKey.relation_child_id,
      description: foreignKeyDesc,
      isStatic: false,
    });
    if (res.status === 201) {
      console.log("Foreign key created successfully:", res);
    } else {
      console.error("Error creating foreign key:", res);
    }
    resetForeignKey();
    setForeignKeyDesc("");
  }

  async function handleCancel() {
    resetForeignKey();
  }

  return (
    <>
      <Container>
        <Suspense fallback={<div>Loading...</div>}>
          <Typography variant="h6" gutterBottom>
            <strong>Create Relationship</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            {/* font style bold */}
            <strong>Foreign technical table:</strong>{" "}
            {schemaForeign.data?.schemaTable.technicalName || "-"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Foreign alias table:</strong>{" "}
            {schemaForeign.data?.schemaTable.alias || "-"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Foreign technical column:</strong>{" "}
            {schemaForeign.data?.technicalName || "-"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Foreign alias column:</strong>{" "}
            {schemaForeign.data?.alias || "-"}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" gutterBottom>
            <strong>Primary technical table:</strong>{" "}
            {schemaPrimary.data?.schemaTable.technicalName || "-"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Primary alias table:</strong>{" "}
            {schemaPrimary.data?.schemaTable.alias || "-"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Primary technical column:</strong>{" "}
            {schemaPrimary.data?.technicalName || "-"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Primary alias column:</strong>{" "}
            {schemaPrimary.data?.alias || "-"}
          </Typography>

          <TextField
            label="Relation description..."
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={5}
            value={foreignKeyDesc}
            onChange={(e) => setForeignKeyDesc(e.target.value)}
          />
        </Suspense>
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

"use client";

import { TSchemaColumnWithTableSimple } from "@/controller/_actions/schema/interface/schema_column.interface";
import { TSchemaRelationUpdate } from "@/controller/_actions/schema/interface/schema_relation.interface";
import {
  DeleteSchemaRelation,
  UpdateSchemaRelation,
} from "@/controller/_actions/schema/schema.action";

import { ReadColumnByIdWithTable } from "@/controller/_actions/schema/queries/read-column-by-id-with-table.query";
import { ReadSchemaRelationByIds } from "@/controller/_actions/schema/queries/read-schema-relation-by-id.query";

import {
  Button,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { Suspense } from "react";

type SchemaRelationFormUpdateProps = {
  relation_foreign_key_id: number;
  relation_primary_key_id: number;
};

type SchemaRelationColumnWithTable = {
  data: TSchemaColumnWithTableSimple | null;
  status: number;
};

export function SchemaRelationFormUpdate({
  schema_relation_keys,
}: {
  schema_relation_keys: SchemaRelationFormUpdateProps;
}) {
  const [schemaRelation, setSchemaRelation] =
    React.useState<TSchemaRelationUpdate>({
      columnIdFather: 0,
      columnIdChild: 0,
      description: "",
    });

  const [schemaRelationWithColAndTableFk, setSchemaRelationWithColAndTableFk] =
    React.useState<TSchemaColumnWithTableSimple>({
      id: 0,
      technicalName: "",
      alias: null,
      description: null,
      dataType: "",
      schemaTable: {
        id: 0,
        technicalName: "",
        alias: null,
        description: null,
      },
    });
  const [schemaRelationWithColAndTablePk, setSchemaRelationWithColAndTablePk] =
    React.useState<TSchemaColumnWithTableSimple>({
      id: 0,
      technicalName: "",
      alias: null,
      description: null,
      dataType: "",
      schemaTable: {
        id: 0,
        technicalName: "",
        alias: null,
        description: null,
      },
    });

  React.useEffect(() => {
    (async () => {
      const resFk: SchemaRelationColumnWithTable =
        await ReadColumnByIdWithTable(
          schema_relation_keys.relation_primary_key_id
        );
      if (resFk.status === 200 && resFk.data) {
        setSchemaRelationWithColAndTableFk(resFk.data);
        console.log("resFk", resFk.data);
      }

      const resPk: SchemaRelationColumnWithTable =
        await ReadColumnByIdWithTable(
          schema_relation_keys.relation_foreign_key_id
        );
      if (resPk.status === 200 && resPk.data) {
        setSchemaRelationWithColAndTablePk(resPk.data);
        console.log("resPk", resPk.data);
      }

      // Fetch the schema relation using the provided keys
      console.log("schema_relation_keys", schema_relation_keys);

      const resRelation = await ReadSchemaRelationByIds({
        columnIdFather: schema_relation_keys.relation_foreign_key_id,
        columnIdChild: schema_relation_keys.relation_primary_key_id,
      });
      console.log("resRelation", resRelation);

      if (resRelation.status === 201 && resRelation.data) {
        setSchemaRelation({
          columnIdFather: resRelation.data.columnIdFather,
          columnIdChild: resRelation.data.columnIdChild,
          description: resRelation.data.description || "",
        });
      }
    })();
  }, []);

  async function handleUpdate() {
    const res = await UpdateSchemaRelation(schemaRelation);
    console.log("updating with schemaRelation", schemaRelation);

    if (res.status === 206) {
      console.log("Schema relation updated successfully:", res.status);
    } else {
      console.error("Failed to update schema relation:", res.status);
    }
  }

  async function handleDelete() {
    const res = await DeleteSchemaRelation({
      columnIdFather: schemaRelation.columnIdFather,
      columnIdChild: schemaRelation.columnIdChild,
    });
    if (res.status === 200) {
      console.log("Schema relation deleted successfully:", res.status);
    } else {
      console.error("Failed to delete schema relation:", res.status);
    }
  }

  return (
    <>
      <Container>
        <Stack spacing={2} direction="column" sx={{ padding: 2 }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Typography variant="h6" gutterBottom>
              <strong>Create Relationship</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {/* font style bold */}
              <strong>Foreign technical table:</strong>{" "}
              {schemaRelationWithColAndTableFk.schemaTable.technicalName || "-"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Foreign alias table:</strong>{" "}
              {schemaRelationWithColAndTableFk.schemaTable.alias || "-"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Foreign technical column:</strong>{" "}
              {schemaRelationWithColAndTableFk.technicalName || "-"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Foreign alias column:</strong>{" "}
              {schemaRelationWithColAndTableFk.alias || "-"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" gutterBottom>
              <strong>Primary technical table:</strong>{" "}
              {schemaRelationWithColAndTablePk.schemaTable.technicalName || "-"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Primary alias table:</strong>{" "}
              {schemaRelationWithColAndTablePk.schemaTable.alias || "-"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Primary technical column:</strong>{" "}
              {schemaRelationWithColAndTablePk.technicalName || "-"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Primary alias column:</strong>{" "}
              {schemaRelationWithColAndTablePk.alias || "-"}
            </Typography>

            <TextField
              label="Relation description..."
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={5}
              value={schemaRelation.description}
              onChange={(e) => {
                setSchemaRelation((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
            />
          </Suspense>
          <Stack direction="row" spacing={2} mt={2}>
            <Button variant="contained" color="primary" onClick={handleUpdate}>
              Update
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

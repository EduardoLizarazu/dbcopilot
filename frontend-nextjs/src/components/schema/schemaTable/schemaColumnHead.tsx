"use client";
import {
  ISchemaColumn,
  ReadColumnByTableId,
} from "@/controller/_actions/index.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";
import { Suspense } from "react";
import { SchemaColumnBody } from "./schemaColumnBody";

export function SchemaColumnHead({ tableId }: { tableId: number }) {
  const [loading, setLoading] = React.useState(true);
  const [schemaColumn, setSchemaColumn] = React.useState<ISchemaColumn[]>([
    {
      column_id: 0,
      column_name: "",
      column_alias: "",
      column_description: "",
      column_data_type: "",
      foreign_key: 0,
      primary_key: 0,
      relation_description: "",
    },
  ]);

  React.useEffect(() => {
    (async () => {
      try {
        console.log("COLUMN HEAD: table id", tableId);

        const data = await ReadColumnByTableId(tableId);
        setSchemaColumn(data);
      } catch (error) {
        console.error("Error fetching schema columns:", error);
      } finally {
        setLoading(false);
        console.log("COLUMN HEAD: Schema Columns:", schemaColumn);
      }
    })();
  }, [tableId]);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Column Name</TableCell>
            <TableCell>Column Alias</TableCell>
            <TableCell>Column Description</TableCell>
            <TableCell>Column Data Type</TableCell>
            <TableCell>Column Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <Suspense
            fallback={
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            }
          >
            {schemaColumn?.map((column) => (
              <SchemaColumnBody key={column?.column_id} columns={column} />
            ))}
          </Suspense>
        </TableBody>
      </Table>
    </>
  );
}

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
import { SchemaColumnQueryFormat } from "@/controller/_actions/schema/interface/readColumnByTableId.interface";

/**
 * export interface SchemaColumnQueryFormat {
    column_id: number;
    column_technical_name: string;
    column_alias: string | null;
    column_data_type: string;
    is_primary_key: boolean | null;
    is_foreign_key: boolean | null;
    is_unique: boolean | null;
    relation_foreign_key_id: number | null; // my own
    relation_primary_key_id: number | null;
    relation_is_static: boolean | null;
    column_key_is_static: boolean[] | null;
    column_key_type: string[] | null;
  }
 */

export function SchemaColumnHead({ tableId }: { tableId: number }) {
  const [loading, setLoading] = React.useState(true);
  const [schemaColumn, setSchemaColumn] = React.useState<
    SchemaColumnQueryFormat[]
  >([
    {
      column_id: 0,
      column_technical_name: "",
      column_alias: null,
      column_description: "",
      column_data_type: "",
      is_primary_key: null,
      is_foreign_key: null,
      is_unique: null,
      relation_foreign_key_id: null,
      relation_primary_key_id: null,
      relation_is_static: null,
      is_primary_key_static: null, // this id is to the other column
      is_foreign_key_static: null,
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
            <TableCell />
            <TableCell>Column Name</TableCell>
            <TableCell>Column Alias</TableCell>
            <TableCell>Column Description</TableCell>
            <TableCell>Column Data Type</TableCell>
            <TableCell />
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

"use client";
import React from "react";
import { ISchemaColumn } from "@/controller/_actions/index.actions";
import { TableCell, TableRow } from "@mui/material";

export function SchemaColumnBody({ columns }: { columns: ISchemaColumn }) {
  const [schemaColumn, setSchemaColumn] = React.useState<ISchemaColumn>({
    column_id: 0,
    column_name: "",
    column_alias: "",
    column_description: "",
    column_data_type: "",
    foreign_key: 0,
    primary_key: 0,
    relation_description: "",
  });

  React.useEffect(() => {
    (async () => {
      setSchemaColumn(columns);
    })();
  }, []);

  return (
    <>
      <TableRow key={schemaColumn.column_id + "columns"}>
        <TableCell>{schemaColumn?.column_name}</TableCell>
        <TableCell>{schemaColumn?.column_alias}</TableCell>
        <TableCell>{schemaColumn?.column_description}</TableCell>
        <TableCell>{schemaColumn?.column_data_type}</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </>
  );
}

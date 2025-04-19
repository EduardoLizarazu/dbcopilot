import {
  ReadSchemaSimpleGeneral,
  TConnection,
  TReadSchemaSimpleGeneralOutput,
} from "@/controller/_actions/schema/queries/read-schema-simple.query";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { Suspense } from "react";

type SchemaSimpleGeneralProps = {
  connectionData: TConnection;
};

export function SchemaSimpleGeneral({
  connectionData,
}: SchemaSimpleGeneralProps) {
  const [schemaSimple, setSchemaSimple] = React.useState<
    TReadSchemaSimpleGeneralOutput[]
  >([
    {
      table_name: "",
      column_name: "",
      data_type: "",
      primary_key: null,
      foreign_key: null,
      unique_key: null,
      referenced_table: null,
      referenced_column: null,
    },
  ]);

  React.useEffect(() => {
    (async () => {
      const res = await ReadSchemaSimpleGeneral({
        name: connectionData.name || "",
        description: connectionData.description || "",
        dbTypeId: connectionData.dbTypeId || 0,
        dbName: connectionData.dbName || "",
        dbHost: connectionData.dbHost || "",
        dbPort: connectionData.dbPort || 0,
        dbUsername: connectionData.dbUsername || "",
        dbPassword: connectionData.dbPassword || "",
        is_connected: connectionData.is_connected || false,
      });

      setSchemaSimple(res);
    })();
  }, []);

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Table Name</TableCell>
              <TableCell>Column Name</TableCell>
              <TableCell>Data Type</TableCell>
              <TableCell>Primary Key</TableCell>
              <TableCell>Foreign Key</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Suspense fallback={<div>Loading...</div>}>
              {schemaSimple.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.table_name}</TableCell>
                  <TableCell>{row.column_name}</TableCell>
                  <TableCell>{row.data_type}</TableCell>
                  <TableCell>{row.primary_key}</TableCell>
                  <TableCell>{row.foreign_key}</TableCell>
                </TableRow>
              ))}
            </Suspense>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

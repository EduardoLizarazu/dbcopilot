"use client";
import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";
import { ReadTableByConnectionId } from "@/controller/_actions/schema/queries/read-schema-table-by-connection-id";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { Suspense } from "react";

type TChatSchemaTableHeadProps = {
  connId: number;
};

export function ChatSchemaTableHead({ connId }: TChatSchemaTableHeadProps) {
  const [schemaTable, setSchemaTable] = React.useState<ISchemaTable[]>([
    {
      table_id: 0,
      table_name: "",
      table_alias: "",
      table_description: "",
    },
  ]);

  React.useEffect(() => {
    (async () => {
      const response = await ReadTableByConnectionId(Number(connId));
      console.log("response chat tables by connection id: ", response);

      setSchemaTable(response);
    })();
  }, []);

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              {/* Font bold */}
              <TableCell align="center" style={{ fontWeight: "bold" }}>
                Table Alias
              </TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>
                Table Description
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Suspense
              fallback={
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              }
            >
              {schemaTable.map((row) => (
                <TableRow key={row.table_id}>
                  <TableCell></TableCell>
                  <TableCell align="center">{row.table_name}</TableCell>
                  <TableCell align="center">{row.table_alias}</TableCell>
                </TableRow>
              ))}
            </Suspense>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

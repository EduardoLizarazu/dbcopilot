"use client";
import React, { use } from "react";
import {
  DeleteConnectionAction,
  ReadConnectionOutput,
} from "@/controller/_actions/index.actions";
import {
  Button,
  Link,
  Stack,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { ConnActionTable } from "./connActionTable";

interface Props {
  connList: Promise<ReadConnectionOutput[]>;
}

export function ConnTableBody({ connList }: Props) {
  const alConnection = use(connList);

  console.log("alConnection", alConnection);

  // RENDER
  return (
    <TableBody>
      {alConnection.map((item, index) => (
        <TableRow key={item.id}>
          <TableCell align="left">{item.name}</TableCell>
          <TableCell align="left">{item.description}</TableCell>
          <TableCell align="left">{item.dbType}</TableCell>
          <TableCell align="left">{item.dbName}</TableCell>
          <TableCell align="left">{item.dbHost}</TableCell>
          <TableCell align="left">
            <ConnActionTable
              handleEditBtn={function (): void {
                throw new Error("Function not implemented.");
              }}
              handleDeleteBtn={function (): void {
                throw new Error("Function not implemented.");
              }}
              handleSchemaBtn={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

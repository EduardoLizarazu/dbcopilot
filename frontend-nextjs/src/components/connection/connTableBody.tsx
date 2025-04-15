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
import { useRouter } from "next/navigation";

export function ConnTableBody({ conn }: { conn: ReadConnectionOutput }) {
  const router = useRouter();

  function handleEditBtn() {
    router.push(`/connection/${conn.id}`);
  }

  async function handleDeleteBtn() {
    try {
    } catch (error) {
      console.error("Error deleting connection:", error);
    }
  }

  function handleSchemaBtn() {
    router.push(`/connection/${conn.id}/schema`);
  }

  // RENDER
  return (
    <TableRow key={conn.id}>
      <TableCell align="center">{conn.name}</TableCell>
      <TableCell align="center">{conn.description}</TableCell>
      <TableCell align="center">{conn.dbType}</TableCell>
      <TableCell align="center">{conn.dbName}</TableCell>
      <TableCell align="center">{conn.dbHost}</TableCell>
      <TableCell align="center">{conn.dbPort}</TableCell>
      <TableCell align="center">
        <ConnActionTable
          handleEditBtn={handleEditBtn}
          handleDeleteBtn={handleDeleteBtn}
          handleSchemaBtn={handleSchemaBtn}
        />
      </TableCell>
    </TableRow>
  );
}

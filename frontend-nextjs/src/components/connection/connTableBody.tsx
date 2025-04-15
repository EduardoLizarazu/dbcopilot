"use client";
import React from "react";
import {
  DeleteConnectionAction,
  ReadConnectionOutput,
} from "@/controller/_actions/index.actions";
import { TableCell, TableRow } from "@mui/material";
import { ConnActionTable } from "./connActionTable";
import { useRouter } from "next/navigation";
import { FeedbackSnackBar } from "../shared/feedbackSnackBar";

export function ConnTableBody({ conn }: { conn: ReadConnectionOutput }) {
  const router = useRouter();

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
  });

  function handleEditBtn() {
    router.push(`/connection/${conn.id}`);
  }

  async function handleDeleteBtn() {
    try {
      const response = await DeleteConnectionAction(conn.id);
      if (response.status === 200) {
        setFeedback({
          isActive: true,
          message: "Connection deleted successfully.",
          severity: "success",
        });
        setTimeout(() => {
          router.refresh(); // Refresh the page to reflect the changes
        }, 2000);
      } else {
        setFeedback({
          isActive: true,
          message: "Failed to delete connection.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting connection:", error);
    } finally {
      setTimeout(() => {
        setFeedback({
          isActive: false,
          message: "",
          severity: null,
        });
      }, 2000); // Hide the feedback message after 3 seconds
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
        {/* Feedback message */}
        {feedback.isActive && (
          <FeedbackSnackBar
            message={feedback.message}
            severity={feedback.severity}
          />
        )}
      </TableCell>
    </TableRow>
  );
}

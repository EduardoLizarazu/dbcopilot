"use client";

import { DeleteSqlSchemaAction } from "@/controller/_actions/index.actions";
import { ReadSqlSchemaActionOutput } from "@/controller/_actions/sqlschema/interface/sqlschema_create.interface";
import { TableCell, TableRow } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
import { FeedbackSnackBar } from "../shared/feedbackSnackBar";
import { SqlSchemaTableAction } from "./sqlschema_table_action";

export function SqlSchemaTableBody({
  sqlSchema,
}: {
  sqlSchema: ReadSqlSchemaActionOutput;
}) {
  const router = useRouter();

  const [sqlSchemaData, setConnData] =
    React.useState<ReadSqlSchemaActionOutput>(sqlSchema);

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
  });

  function handleEditBtn() {
    router.push(`/sqlschema/${sqlSchemaData.id}`);
  }

  function resetFeedback() {
    setFeedback({
      isActive: false,
      message: "",
      severity: null,
    });
  }

  async function handleDeleteBtn() {
    try {
      const response = await DeleteSqlSchemaAction(sqlSchemaData.id);
      if (response.status === 201) {
        setFeedback({
          isActive: true,
          message: "success.",
          severity: "success",
        });
        setTimeout(() => {
          router.refresh(); // Refresh the page to reflect the changes
        }, 2000);
      } else {
        setFeedback({
          isActive: true,
          message: "Failed to delete.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      resetFeedback();
    }
  }
  return (
    <TableRow key={sqlSchemaData.id}>
      <TableCell align="center">{sqlSchemaData.name || "-"}</TableCell>
      <TableCell align="center">{sqlSchemaData.type || "-"}</TableCell>
      <TableCell align="center">{sqlSchemaData.query || "-"}</TableCell>
      <TableCell align="center">
        <SqlSchemaTableAction
          handleEditBtn={handleEditBtn}
          handleDeleteBtn={handleDeleteBtn}
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

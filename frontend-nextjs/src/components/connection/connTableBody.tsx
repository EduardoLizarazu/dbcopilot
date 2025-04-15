"use client";
import React from "react";
import {
  DeleteConnectionAction,
  ReadConnectionOutput,
  TestConnectionActionByConnId,
} from "@/controller/_actions/index.actions";
import { Table, TableCell, TableRow } from "@mui/material";
import { ConnActionTable } from "./connActionTable";
import { useRouter } from "next/navigation";
import { FeedbackSnackBar } from "../shared/feedbackSnackBar";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";

export function ConnTableBody({ conn }: { conn: ReadConnectionOutput }) {
  const router = useRouter();

  const [connData, setConnData] = React.useState<ReadConnectionOutput>(conn);

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
  });

  function handleEditBtn() {
    router.push(`/connection/${conn.id}`);
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
      const response = await DeleteConnectionAction(conn.id);
      if (response.status === 201) {
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
      resetFeedback();
    }
  }

  function handleSchemaBtn() {
    router.push(`/connection/${conn.id}/schema`);
  }

  async function handleTestBtn() {
    try {
      const res = await TestConnectionActionByConnId(conn.id);
      if (res?.status === 201) {
        setFeedback({
          isActive: true,
          message: "Connection test successful.",
          severity: "success",
        });
        setConnData((prev) => ({ ...prev, is_connected: true }));
      } else {
        setFeedback({
          isActive: true,
          message: "Connection test failed.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error testing connection:", err);
      setFeedback({
        isActive: true,
        message: "Failed to test connection.",
        severity: "error",
      });
    } finally {
      resetFeedback();
    }
  }

  // RENDER
  return (
    <TableRow key={connData.id}>
      <TableCell align="center">{connData.name || "-"}</TableCell>
      <TableCell align="center">{connData.dbUsername || "-"}</TableCell>
      <TableCell align="center">{connData.description || "-"}</TableCell>
      <TableCell align="center">{connData.dbType || "-"}</TableCell>
      <TableCell align="center">{connData.dbName || "-"}</TableCell>
      <TableCell align="center">{connData.dbHost || "-"}</TableCell>
      <TableCell align="center">{connData.dbPort || "-"}</TableCell>
      <TableCell align="center">
        <RadioButtonCheckedIcon
          color={connData.is_connected ? "success" : "error"}
          fontSize="small"
        />
      </TableCell>
      <TableCell align="center">
        <ConnActionTable
          handleEditBtn={handleEditBtn}
          handleDeleteBtn={handleDeleteBtn}
          handleSchemaBtn={handleSchemaBtn}
          handleTestBtn={handleTestBtn}
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
function testConnectionByIdConnection(id: number) {
  throw new Error("Function not implemented.");
}

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
    setTimeout(() => {
      setFeedback({
        isActive: false,
        message: "",
        severity: null,
      });
    }, 3000); // Reset feedback after 2 seconds
  }

  async function handleDeleteBtn() {
    try {
      const response = await DeleteConnectionAction(conn.id);
      console.log("Delete response:", response);

      if (response.status === 200) {
        setFeedback({
          isActive: true,
          message: "Deleted successfully.",
          severity: "success",
        });
        setConnData({} as ReadConnectionOutput); // Clear the connection data
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

  function handleSchemaBtn() {
    if (connData.is_connected) {
      router.push(`/connection/${conn.id}/schema`);
    } else {
      setFeedback({
        isActive: true,
        message: "Connection is not established.",
        severity: "error",
      });
    }
    resetFeedback();
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

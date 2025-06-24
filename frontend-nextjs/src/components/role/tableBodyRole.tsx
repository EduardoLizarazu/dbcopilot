"use client";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { TableCell, TableRow } from "@mui/material";
import { useRouter } from "next/navigation";

import React from "react";
import { SharedTableAction } from "../shared/sharedTableAction";

export function TableBodyRole({
  fetchedData,
}: {
  fetchedData: { name: string; id: number; description?: string };
}) {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  // HANDLERS
  function handleEditBtn() {
    router.push(`/auth/roles/${fetchedData.id}`);
  }

  function handleDeleteBtn() {
    // Implement delete functionality here
    setFeedback({
      isActive: true,
      message: "Delete functionality not implemented yet.",
      severity: "warning",
    });
    resetFeedBack();
  }
  return (
    <TableRow key={fetchedData.id} hover onClick={handleEditBtn}>
      <TableCell align="center">{fetchedData.name || "-"}</TableCell>
      <TableCell align="center">{fetchedData.description || "-"}</TableCell>
      <TableCell align="center">
        <SharedTableAction
          handleEditBtn={handleEditBtn}
          handleDeleteBtn={handleDeleteBtn}
        />
      </TableCell>
    </TableRow>
  );
}

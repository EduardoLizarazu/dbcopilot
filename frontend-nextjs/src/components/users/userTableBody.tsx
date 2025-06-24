"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { Table, TableCell, TableRow } from "@mui/material";
import { SharedTableAction } from "../shared/sharedTableAction";

export function UserTableBody({
  users,
}: {
  users: { id: number; fullName: string; email: string };
}) {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  // HANDLERS
  function handleEditBtn() {
    router.push(`/connection/${users.id}`);
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
    <TableRow key={users.id} hover onClick={handleEditBtn}>
      <TableCell align="center">{users.fullName || "-"}</TableCell>
      <TableCell align="center">{users.email || "-"}</TableCell>
      <TableCell align="center">
        <SharedTableAction
          handleEditBtn={handleEditBtn}
          handleDeleteBtn={handleDeleteBtn}
        />
      </TableCell>
    </TableRow>
  );
}

"use client";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { TableCell, TableRow } from "@mui/material";
import { useRouter } from "next/navigation";

import React from "react";
import { SharedTableAction } from "../shared/sharedTableAction";
import { DeleteRoleByIdAction } from "@/controller/_actions/role/command/delete-role-by-id.action";

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

  async function handleDeleteBtn(id: number) {
    try {
      await DeleteRoleByIdAction(id);
      setFeedback({
        isActive: true,
        message: "Deleted successfully",
        severity: "success",
      });
    } catch {
      setFeedback({
        isActive: true,
        severity: "error",
        message: "Failed on delete.",
      });
    } finally {
      resetFeedBack();
      router.push(`/auth/roles`);
    }
  }
  return (
    <TableRow key={fetchedData.id} hover>
      <TableCell align="center">{fetchedData.name || "-"}</TableCell>
      <TableCell align="center">{fetchedData.description || "-"}</TableCell>
      <TableCell align="center">
        <SharedTableAction
          handleEditBtn={handleEditBtn}
          handleDeleteBtn={() => handleDeleteBtn(fetchedData.id)}
        />
      </TableCell>
    </TableRow>
  );
}

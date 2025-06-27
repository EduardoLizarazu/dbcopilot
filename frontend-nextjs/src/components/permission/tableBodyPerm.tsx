"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { TableCell, TableRow } from "@mui/material";
import { SharedTableAction } from "../shared/sharedTableAction";
import { DeletePermissionByIdAction } from "@/controller/_actions/permission/command/delete-permission-id.action";

export function TableBodyPerm({
  fetchedData,
}: {
  fetchedData: { id: number; name: string; description?: string };
}) {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  // HANDLERS
  function handleEditBtn() {
    router.push(`/auth/permissions/${fetchedData.id}`);
  }

  async function handleDeleteBtn(id: number) {
    try {
      await DeletePermissionByIdAction(id);
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
      router.push(`/auth/permissions`);
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

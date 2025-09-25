"use client";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { TableCell, TableRow } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
import { SharedTableAction } from "@components/shared/sharedTableAction";

type TReadHistoryPrompt = {
  prompt_id: number;
  prompt: string;
  is_user_deletion: boolean; // Assuming this is a boolean flag
  sql_query: string;
  message_error: string | null;
  id_user: string;
  hf_id: number | null;
  is_like: boolean | null;
  message: string | null;
  user_name: string;
  username: string;
};

export function HistoryTableBody({
  fetchedData,
}: {
  fetchedData: TReadHistoryPrompt;
}) {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  // HANDLERS
  function handleEditBtn() {
    router.push(`/chat/history/${fetchedData.prompt_id}`);
  }

  async function handleDeleteBtn() {
    try {
      // await DeleteRoleByIdAction(fetchedData.prompt_id);
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
    <TableRow key={fetchedData.prompt_id} hover>
      <TableCell align="center">{fetchedData.prompt || "-"}</TableCell>
      <TableCell align="center">{fetchedData.username || "-"}</TableCell>
      <TableCell align="center">
        <SharedTableAction
          handleEditBtn={handleEditBtn}
          handleDeleteBtn={() => handleDeleteBtn()}
        />
      </TableCell>
    </TableRow>
  );
}

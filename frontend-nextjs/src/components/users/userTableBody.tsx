"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { Table, TableCell, TableRow } from "@mui/material";
import { SharedTableAction } from "../shared/sharedTableAction";
import { DeleteUserByIdAction } from "@/controller/_actions/user/command/delete-user.action";

type User = {
  id: number;
  name: string;
  username: string;
  roles: TRole[];
  userPermissions: TUserPermission[];
};

type TRole = {
  id: number;
  name: string;
  description?: string;
};

type TUserPermission = {
  userId: number;
  permissionId: number;
  isActive: boolean;
};

export function UserTableBody({ fetchedData }: { fetchedData: User }) {
  const router = useRouter();

  console.log("user table body: ", fetchedData);

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  // HANDLERS
  function handleEditBtn() {
    router.push(`/auth/users/${fetchedData.id}`);
  }

  async function handleDeleteBtn(id: number) {
    try {
      await DeleteUserByIdAction(id);
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
      router.push(`/auth/users`);
    }
  }

  return (
    <TableRow key={fetchedData.id} hover>
      <TableCell align="center">{fetchedData.name || "-"}</TableCell>
      <TableCell align="center">{fetchedData.username || "-"}</TableCell>
      <TableCell align="center">
        {fetchedData.roles.flatMap((role) => role.name).join(", ") || "-"}
      </TableCell>
      <TableCell align="center">
        {String(fetchedData.userPermissions.some((i) => i.isActive)) || "-"}
      </TableCell>
      <TableCell align="center">
        <SharedTableAction
          handleEditBtn={handleEditBtn}
          handleDeleteBtn={() => handleDeleteBtn(fetchedData.id)}
        />
      </TableCell>
    </TableRow>
  );
}

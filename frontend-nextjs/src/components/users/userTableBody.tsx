"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { Table, TableCell, TableRow } from "@mui/material";
import { SharedTableAction } from "../shared/sharedTableAction";

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
          handleDeleteBtn={handleDeleteBtn}
        />
      </TableCell>
    </TableRow>
  );
}

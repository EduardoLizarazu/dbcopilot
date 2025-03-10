"use client";
import { CircularProgress } from "@mui/material";
import React from "react";

interface EditRolePageProps {
  params: Promise<{
    roleId: string;
  }>;
}

export default function EditRolePage({ params }: EditRolePageProps) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [roleId, setRoleId] = React.useState<number>(0);

  React.useEffect(() => {
    (async () => {
      const { roleId } = await params;
      setRoleId(parseInt(roleId));
    })();
    setLoading(false);
  }, [params]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <h1>Edit Role with id: {roleId}</h1>
    </div>
  );
}

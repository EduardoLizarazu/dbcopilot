"use client";
import React from "react";

interface EditRolePageProps {
  params: {
    roleId: string;
  };
}

export default function EditRolePage({ params }: EditRolePageProps) {
  React.useEffect(() => {
    console.log("Edit Role with id: ", params.roleId);
  }, [params.roleId]);

  return (
    <div>
      <h1>Edit Role with id: {params.roleId}</h1>
    </div>
  );
}

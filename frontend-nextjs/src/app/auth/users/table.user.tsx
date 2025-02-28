"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { getUsersRoles } from "@/app/auth/users/_actions/user.action";
import Link from "next/link";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "fullName", headerName: "Fullname", width: 130 },
  { field: "role", headerName: "Role", width: 90 },
  { field: "active", headerName: "Account Status", width: 120 },
  {
    field: "actions",
    headerName: "Actions",
    width: 170,
    renderCell: (params) => (
      <div>
        <Link href={`/auth/users/${params.row.id}`} passHref>
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginRight: 16 }}
          >
            View
          </Button>
        </Link>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      </div>
    ),
  },
];

const paginationModel = { page: 0, pageSize: 5 };

const handleView = (id: string) => {
  console.log(`View action for row with id: ${id}`);
};

const handleDelete = (id: string) => {
  console.log(`Delete action for row with id: ${id}`);
  // Add your delete logic here
};

export function UserTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const roles = await getUsersRoles();
        setRows(roles);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };

    fetchUserRoles();
  }, []);

  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}

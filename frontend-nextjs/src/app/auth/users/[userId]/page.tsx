"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Select,
} from "@mui/material";
import { getUserByIdWithRolesAndPermissions } from "./_actions/userId.action";
import EditIcon from "@mui/icons-material/Edit";

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface User {
  id: number;
  fullName: string;
  email: string;
  accountStatus: string;
  roles: Role[];
  directPermissions: Permission[];
}

const UserPage = ({ params }: { params: Promise<{ userId: string }> }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const accountStatus = [
    {
      value: "active",
      label: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
    },
  ];

  // editable text fields
  const [isEditableFullName, setIsEditableFullName] = useState<boolean>(false);

  // solve url param
  useEffect(() => {
    params.then((resolvedParams) => {
      setUserId(resolvedParams.userId);
    });
  }, [params]);

  // get user by id with roles, roles.permission and permissions
  useEffect(() => {
    if (userId) {
      getUserByIdWithRolesAndPermissions(userId)
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <Typography variant="h6">User not found</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4">User Details</Typography>
      <Stack spacing={2} style={{ margin: "20px 20px" }}>
        <TextField
          id="fullName-tfd"
          label="Fullname"
          variant="standard"
          style={{ width: "100%" }}
          value={user.fullName}
          onChange={(e) => setUser({ ...user, fullName: e.target.value })}
          slotProps={{
            input: {
              readOnly: !isEditableFullName,
              endAdornment: (
                <EditIcon
                  onClick={() => setIsEditableFullName(!isEditableFullName)}
                  style={{
                    cursor: "pointer",
                    color: isEditableFullName ? "black" : "gray",
                  }}
                />
              ),
            },
          }}
        />

        <TextField
          id="email-tfd"
          label="Email"
          variant="standard"
          value={user.email}
          style={{ width: "100%" }}
          helperText="This field is read-only"
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <Select
          id="select-account-status"
          label="Account Status"
          defaultValue={user.accountStatus}
          variant="standard"
          style={{ width: "100%" }}
          onChange={(e) => setUser({ ...user, accountStatus: e.target.value })}
        >
          {accountStatus.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Typography variant="h6">Roles:</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">Role</TableCell>
              <TableCell align="right">Permissions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {user.roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell align="right">{role.name}</TableCell>
                <TableCell align="right">
                  {role.permissions.map((perm) => perm.name).join(", ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6">Direct Permissions:</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Permission</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {user.directPermissions.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell align="left">{perm.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UserPage;

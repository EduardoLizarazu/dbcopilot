"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { getUserByIdWithRolesAndPermissions } from "./_actions/userId.action";
import EditIcon from "@mui/icons-material/Edit";
import { EditAuthDialog } from "./dialogTransfer.userid";
import { UserWithRolesAndPermssions } from "../_types/user.type";

const UserPage = ({ params }: { params: Promise<{ userId: string }> }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserWithRolesAndPermssions | null>(null);

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
      <Stack
        spacing={2}
        style={{ margin: "20px 20px" }}
        sx={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
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

        <FormControlLabel
          control={
            <Switch
              checked={Boolean(user.accountStatus)}
              onChange={(e) => {
                setUser({ ...user, accountStatus: e.target.checked ? 1 : 0 });
              }}
            />
          }
          label="Account Status"
          labelPlacement="start"
        />
      </Stack>

      <Divider className="my-8" />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2, md: 4 }}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Roles:</Typography>
        <EditAuthDialog 
          user={user}
        />
      </Stack>
      {user.roles.map((role) => (
        <div key={role.id} className="my-4">
          <Typography variant="h6">{role.name} Role Permissions:</Typography>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="left">Permission Name</TableCell>
                  <TableCell align="left">Permission Description</TableCell>
                  <TableCell align="left">Active/Inactive</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {role.permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell align="left">{perm.name}</TableCell>
                    <TableCell align="left">{perm.description}</TableCell>
                    <TableCell align="left">
                      <Switch />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}

      <Divider className="my-8" />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2, md: 4 }}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Direct Permissions:</Typography>
        <EditAuthDialog
          user={user}
        />
      </Stack>
      <TableContainer component={Paper} className="my-4">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Permission Name</TableCell>
              <TableCell align="left">Permission Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {user.directPermissions.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell align="left">{perm.name}</TableCell>
                <TableCell align="left">{perm.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UserPage;

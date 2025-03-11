"use client";
import React from "react";
import {
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DeleteUser, GetUsers } from "@/controller/_actions/index.actions";
import { ReadUserUseCaseOutput } from "@/useCase/index.usecase";

export default function UsersPage() {
  // HOOKS
  const [loading, setLoading] = React.useState<boolean>(true);
  const [usersObject, setUsersObject] = React.useState<ReadUserUseCaseOutput[]>(
    []
  );

  React.useEffect(() => {
    (async () => {
      const userObject = await GetUsers();
      setUsersObject(userObject);
      setLoading(false);
    })();
  }, []);

  // HANDLERS
  async function handleRemoveUser(id: number) {
    await DeleteUser(id);
    setUsersObject(usersObject.filter((user) => user.user.id !== id));
  }

  // RENDERS

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h6">Roles</Typography>
      <Link href="/auth/users/create">
        <Button variant="contained" color="primary">
          Create
        </Button>
      </Link>
      <TableContainer component={Paper} className="my-4">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">FullName</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">Phone</TableCell>
              <TableCell align="left">Role</TableCell>
              <TableCell align="left">Special</TableCell>
              <TableCell align="left">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersObject.map(({ user, roles, directPermissions }) => (
              <TableRow key={user.id}>
                <TableCell align="left">
                  {user.firstName + " " + user.lastName}
                </TableCell>
                <TableCell align="left">{user.email}</TableCell>
                <TableCell align="left">{user.phone}</TableCell>
                <TableCell align="left">
                  {roles.map((role) => role.name).join(", ")}
                </TableCell>
                <TableCell align="left">
                  {directPermissions
                    .map((permission) => permission.name)
                    .join(", ")}
                </TableCell>
                <TableCell align="left">
                  <Stack direction="row" spacing={2}>
                    <Link href={`/auth/users/${user.id}`}>
                      <Button variant="contained" color="info">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="contained"
                      onClick={() => handleRemoveUser(user.id)}
                      color="error"
                    >
                      Remove
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { getUserByIdWithRolesAndPermissions } from "./_actions/userId.action";

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
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    params.then((resolvedParams) => {
      setUserId(resolvedParams.userId);
    });
  }, [params]);

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
      <Typography variant="h4">{user.fullName}</Typography>
      <Typography variant="subtitle1">Email: {user.email}</Typography>
      <Typography variant="subtitle1">
        Account Status: {user.accountStatus}
      </Typography>

      <Typography variant="h6">Roles:</Typography>
      <List>
        {user.roles.map((role) => (
          <ListItem key={role.id}>
            <ListItemText
              primary={role.name}
              secondary={role.permissions.map((perm) => perm.name).join(", ")}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6">Direct Permissions:</Typography>
      <List>
        {user.directPermissions.map((perm) => (
          <ListItem key={perm.id}>
            <ListItemText primary={perm.name} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default UserPage;

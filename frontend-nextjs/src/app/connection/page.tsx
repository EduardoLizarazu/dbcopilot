'use client';
import React from "react";
import { Button, CircularProgress, Container, Link, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";


interface CreateConnectionDataModel {
  id: number;
  connectionName: string;
  description: string;
  databaseType: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
}

export default function ConnectionPage() {
  // USE STATE
  const [loading, setLoading] = React.useState<boolean>(true);
  const [connList, setConnList] = React.useState<CreateConnectionDataModel[]>([]);
  
  
  // USE EFFECT
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      // Fetch connections
      // base on CreateConnectionDataModel
      setConnList(
        [
          {
            id: 1,
            connectionName: "Connection 1",
            description: "Connection 1 Description",
            databaseType: "MySQL",
            host: "localhost",
            port: 3306,
            databaseName: "test",
            username: "root",
            password: "root"
          },
          {
            id: 2,
            connectionName: "Connection 2",
            description: "Connection 2 Description",
            databaseType: "Postgres",
            host: "localhost",
            port: 5432,
            databaseName: "test",
            username: "root",
            password: "root"
          }
        ]
      );

      setLoading(false);
    })();
  }, []);

  // HANDLERS
  
  function handleRemoveUser(id: number) {
    console.log("Remove user with id: ", id);
  }

  // RENDER

  if(loading) {
    return <CircularProgress/>
  }

  return (
    <Container>
      <Typography variant="h4">Connections</Typography>
      <Link href="/connection/create">
        <Button variant="contained" color="primary">
          Create
        </Button>
      </Link>
      <TableContainer component={Paper} className="my-4">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Connection Name</TableCell>
              <TableCell align="left">Description</TableCell>
              <TableCell align="left">Type</TableCell>
              <TableCell align="left">Database Name</TableCell>
              <TableCell align="left">Host</TableCell>
              <TableCell align="left">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {connList.map((conn) => (
              <TableRow key={conn.id}>
                <TableCell align="left">{conn.connectionName}</TableCell>
                <TableCell align="left">{conn.description}</TableCell>
                <TableCell align="left">{conn.databaseType}</TableCell>
                <TableCell align="left">{conn.databaseName}</TableCell>
                <TableCell align="left">{conn.host}</TableCell>
                <TableCell align="left">
                  <Stack direction="row" spacing={2}>
                    <Link href={`/connection/${conn.id}`}>
                      <Button variant="contained" color="info">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="contained"
                      onClick={() => handleRemoveUser(conn.id)}
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

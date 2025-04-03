"use client";
import { deleteSqlSchemaAction, readAllSqlSchemaAction } from "@/controller/_actions/index.actions";
import { Button, CircularProgress, Container, Link, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import React, { useState } from "react";


interface ListInterface {
    id: number;
    name: string;
    type: string;
    query: string;
}

export default function Page() {
    // USE STATE
    const [loading, setLoading] = useState(false);
    const [sqlSchema, setSqlSchema] = React.useState<ListInterface[]>([]);

    // USE EFFECT
    React.useEffect(() => {
        (async () => {
            setLoading(true);
            const response = await readAllSqlSchemaAction();
            setSqlSchema(
                response.map((item: ListInterface) => {
                    return {
                        id: item.id || 0,
                        name: item.name || "",
                        type: item.type || "",
                        query: item.query || "",
                    };
                })
            );
            setLoading(false);
            console.log(response);
            
        })();
    }, []);


    // HANDLER

    // RENDER
    if(loading) {
        return <CircularProgress />;
    }

    async function handleRemove(id: number): Promise<void> {
      try {
        await deleteSqlSchemaAction(id);  
        setSqlSchema((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error removing SQL schema:", error);
      }
    }

    return (
        <Container>
      <Typography variant="h4">Connections</Typography>
      <Link href="/sqlschema/create">
        <Button variant="contained" color="primary">
          Create
        </Button>
      </Link>
      <TableContainer component={Paper} className="my-4">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Type</TableCell>
              <TableCell align="left">SQL</TableCell>
              <TableCell align="left">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sqlSchema.map((item) => (
              <TableRow key={item.id}>
                <TableCell align="left">{item.name}</TableCell>
                <TableCell align="left">{item.type}</TableCell>
                <TableCell align="left">{
                    // if it is more than 50 characters, show only 50 characters and add ... at the end
                    item.query.length > 50 ? item.query.substring(0, 30) + "..." : item.query
                    }</TableCell>
                <TableCell align="left">
                  <Stack direction="row" spacing={2}>
                    <Link href={`/sqlschema/${item.id}`}>
                      <Button variant="contained" color="info">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="contained"
                      onClick={() => handleRemove(item.id)}
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
"use client";
import React, { use } from "react";
import { ReadConnectionOutput } from "@/controller/_actions/index.actions";
import { Button, Link, Stack, TableBody, TableCell, TableRow } from "@mui/material";


interface Props {
    connList: Promise<ReadConnectionOutput[]>;
}

export function ConnectionTable(
    { connList }: Props
    ) {

    const alConnection = use(connList)
    
    console.log("alConnection", alConnection);
    
    async function handleRemove(id: number) {
      await 
    }

    // RENDER
    return (
        <TableBody>
          {alConnection.map((item, index) => (
            <TableRow key={index}>
              <TableCell align="left">{item.name}</TableCell>
              <TableCell align="left">{item.description}</TableCell>
              <TableCell align="left">{item.dbType}</TableCell>
              <TableCell align="left">{item.dbName}</TableCell>
              <TableCell align="left">{item.dbHost}</TableCell>
              <TableCell align="left">
                <Stack direction="row" spacing={2}>
                  <Link href={`/connection/${item.id}`}>
                    <Button variant="contained" color="info">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="contained"
                    onClick={() => {}}
                    color="error"
                  >
                    Remove
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
    );
} 
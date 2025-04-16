"use client";
import { TableCell, TableHead, TableRow } from "@mui/material";

export function SharedTableHead({ head }: { head: string[] }) {
  return (
    <TableHead>
      <TableRow>
        {head.map((item, index) => (
          <TableCell key={index} align="center">
            {item}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

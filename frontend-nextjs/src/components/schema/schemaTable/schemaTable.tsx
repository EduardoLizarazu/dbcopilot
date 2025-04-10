"use client";
import { ISchemaTable } from "@/controller/_actions/index.actions";
import { Box, Container, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import React, { Suspense } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";


export function SchemaTable({ schemaTableData }: { schemaTableData: ISchemaTable[] }) {

    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const [schemaTable, setSchemaTable] = React.useState<ISchemaTable[]>([]);
    const [openColumn, setOpenColumn] = React.useState(false);
    const filteredSchemaTable = schemaTable.filter((row) =>
        row.table_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    React.useEffect(() => {
        (async () => {
            const data = await schemaTableData;
            setSchemaTable(data);
        })();
    }, [])

    return (
        <Box>
            <TextField
                label="Search Tables"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Table Name</TableCell>
                            <TableCell>Table Alias</TableCell>
                            <TableCell>Table Description</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <Suspense fallback={<TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>}>
                            {filteredSchemaTable.map((row) => (
                                // TABLES
                                <>
                                    <TableRow key={row.table_id + "tables"}>
                                        <TableCell>
                                            <IconButton
                                                aria-label="expand row"
                                                size="small"
                                                onClick={() => setOpenColumn(!openColumn)}
                                            >
                                                {openColumn ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{row.table_name}</TableCell>
                                        <TableCell>{row.table_alias}</TableCell>
                                        <TableCell>{row.table_description}</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>

                                    <TableRow key={row.table_id + "columns"}>
                                    </TableRow>
                                </>
                            ))}
                        </Suspense>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

}
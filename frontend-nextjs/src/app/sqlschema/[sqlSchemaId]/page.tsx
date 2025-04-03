"use client";
import { readSqlSchemaActionById, updateSqlSchemaAction } from "@/controller/_actions/index.actions";
import { Autocomplete, Button, CircularProgress, Container, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
interface Props {
    params: Promise<{
        sqlSchemaId: string;
    }>;
  }
export default function Page({ params }: Props) {
    // USE STATE
    const [loading, setLoading] = useState(false);
    const [id, setId] = React.useState<string>("");
    const [name, setName] = React.useState("");
    const [type, setType] = React.useState("");
    const [sqlSchema, setSqlSchema] = React.useState("");

    // USE EFFECT
    React.useEffect(() => {
        (async () => {
            setLoading(true);
            const { sqlSchemaId } = await params;
            console.log("sqlSchemaId", sqlSchemaId);
            // Check if sqlSchemaId is a valid number
            
            
            if (sqlSchemaId) {
                setId(sqlSchemaId);
                const sqlSchemaData = await readSqlSchemaActionById(sqlSchemaId);
                setName(sqlSchemaData.name);
                setType(sqlSchemaData.type);
                setSqlSchema(sqlSchemaData.query);
            }
            setLoading(false);
        })();
    }, [params]);

    // HANDLER

    async function handleSubmit(): Promise<void> {
        try {
            await updateSqlSchemaAction(Number(id), {
                name: name,
                type: type,
                query: sqlSchema,
            });
        }
        catch (error) {
            console.error("Error creating SQL schema:", error);
            alert("Error creating SQL schema. Please try again.");
        }
    }

    // RENDER
    if(loading) {
        return <CircularProgress />;
    }

    const dbTypes = [
        { label: 'posgres' },
        { label: 'oracle' },
        { label: 'mysql'},
        { label: 'mssql' },
    ];

    return (
        <Container>
            <Stack spacing={2}>
                <Typography variant="h4">SQL Schema</Typography>
                <TextField 
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />
                <Autocomplete
                    disablePortal
                    options={dbTypes}
                    sx={{ width: 300 }}
                    onChange={(event, newValue) => {
                        setType(newValue?.label || "");
                    }}
                    renderInput={(params) => <TextField {...params} label="Database Types" />}
                />
                <TextField 
                    label="SQL Schema"
                    variant="outlined"
                    value={sqlSchema}
                    onChange={(e) => setSqlSchema(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button onClick={() => handleSubmit()}>Submit</Button>
                    <Button onClick={() => {setName(""); setType(""); setSqlSchema("");}}>Clear</Button>
                </Stack>
            </Stack>
        </Container>
    );

}
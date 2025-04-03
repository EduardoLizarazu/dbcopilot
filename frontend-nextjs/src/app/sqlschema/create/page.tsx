"use client";
import { Button, CircularProgress, Container, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
export default function Page() {
    // USE STATE
    const [loading, setLoading] = useState(false);
    const [name, setName] = React.useState("");
    const [type, setType] = React.useState("");
    const [sqlSchema, setSqlSchema] = React.useState("");

    // USE EFFECT
    React.useEffect(() => {}, []);


    // HANDLER

    // RENDER
    if(loading) {
        return <CircularProgress />;
    }

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
                <TextField 
                    label="Type"
                    variant="outlined"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    fullWidth
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
                    <Button onClick={() => setLoading(true)}>Submit</Button>
                    <Button onClick={() => {setName(""); setType(""); setSqlSchema("");}}>Clear</Button>
                </Stack>

            </Stack>
        </Container>
    );

}
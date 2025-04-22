"use client";
import { Button, Stack, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";

export function ChatSqlEditor() {
  const [isEditableSqlQuery, setIsEditableSqlQuery] =
    React.useState<boolean>(false);

  const [sqlQuery, setSqlQuery] = React.useState<string>("");
  const handleClickEditSqlQuery = () => {
    setIsEditableSqlQuery(!isEditableSqlQuery);
  };

  function handleExecuteSQLQuery(): void {
    console.log("Execute SQL Query", sqlQuery);
  }

  return (
    <>
      <TextField
        label=""
        placeholder=""
        value={sqlQuery}
        onChange={(e) => setSqlQuery(e.target.value)}
        multiline
        variant="outlined"
        minRows={10}
        maxRows={50}
        fullWidth
        aria-readonly={!isEditableSqlQuery}
        disabled={!isEditableSqlQuery}
      />
      <Stack direction="row" spacing={2} style={{ marginTop: 10 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleClickEditSqlQuery}
          endIcon={
            isEditableSqlQuery ? (
              <EditIcon style={{ opacity: 0.3 }} />
            ) : (
              <EditIcon style={{ opacity: 1 }} />
            )
          }
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleExecuteSQLQuery}
        >
          Execute
        </Button>
      </Stack>
    </>
  );
}

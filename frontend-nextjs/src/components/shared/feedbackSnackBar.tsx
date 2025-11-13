"use client";
import React, { useState } from "react";
import { Alert, Snackbar } from "@mui/material";

interface FeedbackSnackBarProps {
  message: string;
  severity: "success" | "error" | "warning" | "info" | null;
}

export function FeedbackSnackBar({ message, severity }: FeedbackSnackBarProps) {
  const [open, setOpen] = useState(true); // State to control Snackbar visibility

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return; // Prevent closing when clicking away
    }
    setOpen(false); // Close the Snackbar
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert
        onClose={handleClose}
        severity={severity ? severity : undefined}
        sx={{ width: "100%" }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

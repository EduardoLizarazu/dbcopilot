import React from "react";
import { Alert, Snackbar } from "@mui/material";


interface FeedbackSnackBarProps {
    message: string;
    severity: "success" | "error" | "warning" | "info";
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function FeedbackSnackBar(
    {  message, severity, open, setOpen }: FeedbackSnackBarProps
) {

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={(e) => {
                if (e.type === "timeout") {
                    setOpen(false);
                }
                if (e.type === "clickaway") {
                    return;
                }
                setOpen(false);
            }}
        >
            <Alert 
            onClose={(event) => {
                if ((event as any).reason === "clickaway") {
                    return;
                }
                setOpen(false);
            }}
                severity={severity} 
                sx={{ width: "100%" }}
                variant="filled"
                >
                {message}
            </Alert>
        </Snackbar>
    );
}
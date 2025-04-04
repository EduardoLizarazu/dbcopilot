import { Alert, Snackbar } from "@mui/material";


interface FeedbackSnackBarProps {
    message: string;
    severity: "success" | "error" | "warning" | "info";
}

export function FeedbackSnackBar(
    {  message, severity }: FeedbackSnackBarProps
) {
    return (
        <Snackbar
            open={true}
            autoHideDuration={6000}
            onClose={() => {}}
        >
            <Alert 
                onClose={() => {}} 
                severity={severity} 
                sx={{ width: "100%" }}>
                {message}
            </Alert>
        </Snackbar>
    );
}
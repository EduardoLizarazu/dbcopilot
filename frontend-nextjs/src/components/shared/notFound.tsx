"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function NotFound() {
  const router = useRouter();

  return (
    <Box className="flex items-center justify-center">
      <Paper elevation={3} className="p-8 max-w-xl w-full">
        <Stack spacing={3} alignItems="center">
          <Typography
            component="div"
            sx={{ fontSize: { xs: 48, sm: 72 }, fontWeight: 800 }}
          >
            404
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Page not found
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ maxWidth: 560 }}
          >
            The page you are looking for does not exist or has been moved. Use
            the button below to go back to the previous page.
          </Typography>

          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ textTransform: "none" }}
          >
            Go back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

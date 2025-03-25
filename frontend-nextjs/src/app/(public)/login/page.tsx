"use client";
import { Container, Stack, Typography } from "@mui/material";
import { LoginForm } from "./form.login";
import Link from "next/link";

export default function Page() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Stack spacing={1} direction="column" sx={{ textAlign: "center" }}>
        <Typography variant="h3">Login</Typography>
        <Typography variant="subtitle1">
          Enter your email below to login to your account
        </Typography>
        <div className="mt-6">
          <LoginForm />
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link className="underline" href="/signup">
            Sign up
          </Link>
        </div>
      </Stack>
    </Container>
  );
}

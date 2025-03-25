import Link from "next/link";
import { Container, Stack, Typography } from "@mui/material";
import { SignupForm } from "@/app/(public)/signup/form.signup";
export default function Page() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Stack spacing={1} direction="column" sx={{ textAlign: "center" }}>
        <Typography variant="h3">Create an account</Typography>
        <Typography variant="subtitle1">
          Enter your information to get started
        </Typography>
        <div className="mt-6">
          <SignupForm />
        </div>
        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Login
          </Link>
        </div>
      </Stack>
    </Container>
  );
}

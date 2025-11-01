// app/(auth)/login/page.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link as MLink,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { loginAction } from "@/controller/_actions/auth/login";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/chat";

  const [email, setEmail] = React.useState("ex04@gmail.com");
  const [password, setPassword] = React.useState("Passw0rd4");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await loginAction(email.trim(), password);
      // router.replace(redirect || "/chat");
    } catch (error: any) {
      setErr(error?.message ?? "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex mt-6 items-center justify-center px-4">
      <Paper
        elevation={3}
        className="w-full max-w-md p-6 sm:p-8"
        sx={{ borderRadius: 4 }}
      >
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Use your email and password to access your account.
          </Typography>

          <Box mt={3} display="grid" gap={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              fullWidth
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {err && (
              <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                {err}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.25, textTransform: "none", fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={22} /> : "Sign in"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "./_actions/login.action";
import { TextField, Button, Typography, Box } from "@mui/material";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("eduardolizarazu");
  const [password, setPassword] = useState("Passw0rd");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      console.log("form.login: ", email, password);

      await login(email, password);
      router.push("/chat"); // Redirect to the chat or any other page
    } catch (err) {
      setError("Username or password incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="username"
        name="username"
        autoComplete="username"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 2 }}
      >
        {isSubmitting ? "Submitting..." : "Login"}
      </Button>
    </Box>
  );
};

export { LoginForm };

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "./_actions/signup.action";
import { TextField, Button, Typography, Box, Stack } from "@mui/material";

const SignupForm: React.FC = () => {
  // useState of object register (email, password, username)
  const [register, setRegister] = useState({
    email: "",
    password: "",
    repeatPassword: "", // Add repeatPassword
    username: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { password, repeatPassword } = register;
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const registerSignup = {
        email: register.email,
        password: register.password,
        username: register.username,
      };
      await signup(registerSignup);
      router.push("/dashboard"); // Redirect to the dashboard or any other page
    } catch (err) {
      setError("Email or password incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2} direction="column">
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={register.username}
          onChange={(e) =>
            setRegister({ ...register, username: e.target.value })
          }
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={register.email}
          onChange={(e) => setRegister({ ...register, email: e.target.value })}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="password"
          value={register.password}
          onChange={(e) =>
            setRegister({ ...register, password: e.target.value })
          }
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="repeat-password"
          label="Repeat Password"
          type="password"
          id="repeat-password"
          autoComplete="repeat password"
          value={register.repeatPassword}
          onChange={(e) =>
            setRegister({ ...register, repeatPassword: e.target.value })
          }
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
          size="large"
        >
          {isSubmitting ? "Submitting..." : "Login"}
        </Button>
      </Stack>
    </Box>
  );
};

export { SignupForm };

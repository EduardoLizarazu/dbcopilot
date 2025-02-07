import { TextField, Button, Typography, Box } from "@mui/material";

function Login() {
  return (
    <Box
      className="flex justify-center items-center min-h-screen"
      sx={{ bgcolor: "background.paper" }}
    >
      <Box
        className="p-8 shadow-lg rounded-lg"
        sx={{ bgcolor: "background.paper" }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        <TextField label="Email" variant="outlined" fullWidth margin="normal" />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" className="mt-4" fullWidth>
          Entrar
        </Button>
      </Box>
    </Box>
  );
}

export default Login;

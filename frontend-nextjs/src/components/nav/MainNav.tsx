// Server Component: safe to read cookies, verify JWT, and render based on claims
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth.server";
import LogoutButton from "@/components/nav/LogoutButton";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";

export default async function MainNav() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin =
    Boolean(user.admin) || user.role === "admin" || user["role"] === "admin";

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={1}
      sx={{ borderRadius: 0 }}
    >
      <Toolbar className="max-w-7xl mx-auto w-full">
        <Typography variant="h6" sx={{ fontWeight: 800, mr: 2 }}>
          MyApp
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }} className="flex-1">
          <Button
            component={Link}
            href="/dashboard"
            sx={{ textTransform: "none" }}
          >
            Dashboard
          </Button>
          <Button component={Link} href="/chat" sx={{ textTransform: "none" }}>
            Chat
          </Button>

          {isAdmin && (
            <>
              <Button
                component={Link}
                href="/auth/users"
                sx={{ textTransform: "none" }}
              >
                Users
              </Button>
              <Button
                component={Link}
                href="/auth/roles"
                sx={{ textTransform: "none" }}
              >
                Roles
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            className="hidden sm:block"
          >
            {user.email}
          </Typography>
          <LogoutButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

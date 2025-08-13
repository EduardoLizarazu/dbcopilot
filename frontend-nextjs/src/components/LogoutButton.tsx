"use client";

import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { logoutAction } from "@/controller/_actions/auth/logout";

export default function LogoutButton() {
  const router = useRouter();
  const onClick = async () => {
    await logoutAction(); // clears fb_id_token cookie
    router.replace("/login");
  };

  return (
    <Button variant="outlined" onClick={onClick} sx={{ textTransform: "none" }}>
      Log out
    </Button>
  );
}

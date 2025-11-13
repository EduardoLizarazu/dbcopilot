// src/components/RouteGuard.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CircularProgress } from "@mui/material";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function RouteGuard({
  children,
  requiredRoles = [],
}: RouteGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Redirect if no user or insufficient permissions
    if (
      !user ||
      (requiredRoles.length > 0 &&
        !requiredRoles.some((role) => user.roles.includes(role)))
    ) {
      router.replace("/");
    }
  }, [user, isLoading, requiredRoles, router]);

  if (
    isLoading ||
    !user ||
    (requiredRoles.length > 0 &&
      !requiredRoles.some((role) => user.roles.includes(role)))
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return <>{children}</>;
}

// src/contexts/AuthContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface User {
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export const AuthProvider = ({
  children,
  initialRoles = [],
}: {
  children: React.ReactNode;
  initialRoles?: string[];
}) => {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: initialRoles.length ? { roles: initialRoles } : null,
    isLoading: initialRoles.length === 0,
  });

  useEffect(() => {
    if (initialRoles.length > 0) return;

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setAuthState({ user: userData, isLoading: false });
        } else {
          setAuthState({ user: null, isLoading: false });
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        setAuthState({ user: null, isLoading: false });
      }
    };

    fetchUser();
  }, [initialRoles]);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

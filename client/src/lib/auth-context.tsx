import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  wsConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wsToken, setWsToken] = useState<string | null>(null);

  const fetchWsToken = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/ws-token", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setWsToken(data.token);
      }
    } catch (error) {
      console.error("Failed to fetch WS token:", error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchWsToken();
      } else {
        setUser(null);
        setWsToken(null);
      }
    } catch (error) {
      setUser(null);
      setWsToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWsToken]);

  const { isConnected: wsConnected } = useWebSocket(wsToken);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al iniciar sesión");
    }

    const data = await response.json();
    setUser(data.user);
    fetchWsToken();
  };

  const register = async (data: RegisterData) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al registrarse");
    }

    const result = await response.json();
    setUser(result.user);
    fetchWsToken();
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setWsToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, wsConnected, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

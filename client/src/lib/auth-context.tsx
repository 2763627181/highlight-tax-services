/**
 * @fileoverview Contexto de Autenticación de Highlight Tax Services
 * 
 * Provee gestión centralizada del estado de autenticación para toda
 * la aplicación React. Maneja login, registro, logout y verificación
 * de sesión, además de la conexión WebSocket para notificaciones.
 * 
 * @module client/lib/auth-context
 * @version 1.0.0
 * 
 * ## Uso
 * 
 * ```tsx
 * // En App.tsx - Envolver la aplicación
 * <AuthProvider>
 *   <Router />
 * </AuthProvider>
 * 
 * // En componentes - Usar el hook
 * const { user, isLoading, login, logout } = useAuth();
 * ```
 * 
 * ## Características
 * - Autenticación basada en cookies HttpOnly
 * - Auto-verificación de sesión al cargar
 * - Integración automática con WebSocket
 * - Soporte bilingüe (mensajes en español)
 * 
 * @security
 * - Credenciales enviadas con cookies (HttpOnly, Secure, SameSite)
 * - Token WebSocket obtenido solo después de autenticación
 * - Estado limpiado completamente al logout
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";

/**
 * Tipo del contexto de autenticación
 * 
 * @property user - Usuario autenticado o null
 * @property isLoading - Si se está verificando la sesión
 * @property wsConnected - Estado de conexión WebSocket
 * @property login - Función para iniciar sesión
 * @property register - Función para registrar nuevo usuario
 * @property logout - Función para cerrar sesión
 * @property checkAuth - Función para verificar sesión actual
 */
interface AuthContextType {
  /** Usuario actualmente autenticado (null si no hay sesión) */
  user: User | null;
  /** Indica si se está verificando la sesión inicial */
  isLoading: boolean;
  /** Estado de conexión del WebSocket de notificaciones */
  wsConnected: boolean;
  /** Inicia sesión con email y contraseña */
  login: (email: string, password: string) => Promise<void>;
  /** Inicia sesión con proveedor OAuth (Google, GitHub, Apple) */
  loginWithOAuth: (data: OAuthLoginData) => Promise<void>;
  /** Registra un nuevo usuario cliente */
  register: (data: RegisterData) => Promise<void>;
  /** Cierra la sesión actual */
  logout: () => Promise<void>;
  /** Verifica si existe una sesión válida */
  checkAuth: () => Promise<void>;
}

/**
 * Datos requeridos para el registro de nuevo usuario
 * 
 * @property email - Email único del usuario
 * @property password - Contraseña (min 8 chars, mayúscula, minúscula, número)
 * @property name - Nombre completo del usuario
 * @property phone - Teléfono de contacto (opcional)
 */
interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface OAuthLoginData {
  email: string;
  name: string;
  provider: string;
  providerId: string;
}

/**
 * Contexto de React para autenticación
 * 
 * @internal No usar directamente, usar useAuth() hook
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor del contexto de autenticación
 * 
 * Debe envolver toda la aplicación en el árbol de componentes.
 * Maneja automáticamente:
 * - Verificación de sesión al cargar
 * - Obtención de token WebSocket
 * - Estado de conexión en tiempo real
 * 
 * @param props.children - Componentes hijos a envolver
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router />
 *       <Toaster />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /** Usuario autenticado actual */
  const [user, setUser] = useState<User | null>(null);
  /** Estado de carga durante verificación de sesión */
  const [isLoading, setIsLoading] = useState(true);
  /** Token JWT para conexión WebSocket */
  const [wsToken, setWsToken] = useState<string | null>(null);

  /**
   * Obtiene un token JWT para la conexión WebSocket
   * 
   * Se llama automáticamente después de autenticación exitosa.
   * El token tiene una duración de 1 hora.
   * 
   * @internal
   */
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

  /**
   * Verifica si existe una sesión válida
   * 
   * Se ejecuta automáticamente al cargar la aplicación.
   * Si hay sesión válida, obtiene datos del usuario y token WS.
   * 
   * @security Usa cookies HttpOnly, no expone tokens en localStorage
   */
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

  /** Hook de WebSocket para notificaciones en tiempo real */
  const { isConnected: wsConnected } = useWebSocket(wsToken);

  /** Verificar autenticación al montar el componente */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Inicia sesión con email y contraseña
   * 
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @throws Error si las credenciales son inválidas
   * 
   * @example
   * ```tsx
   * try {
   *   await login("user@example.com", "password123");
   *   navigate("/dashboard");
   * } catch (error) {
   *   toast({ title: "Error", description: error.message });
   * }
   * ```
   */
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

  /**
   * Registra un nuevo usuario cliente
   * 
   * Crea una cuenta nueva y automáticamente inicia sesión.
   * Los nuevos usuarios se crean con rol "client".
   * 
   * @param data - Datos de registro del usuario
   * @throws Error si el email ya existe o datos inválidos
   * 
   * @example
   * ```tsx
   * await register({
   *   email: "nuevo@example.com",
   *   password: "SecurePass123",
   *   name: "Juan García",
   *   phone: "+1 917-555-1234"
   * });
   * ```
   */
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

  /**
   * Cierra la sesión actual
   * 
   * Limpia el estado local y notifica al servidor.
   * Siempre limpia el estado local incluso si falla la petición.
   * 
   * @example
   * ```tsx
   * const handleLogout = async () => {
   *   await logout();
   *   navigate("/");
   * };
   * ```
   */
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

  const loginWithOAuth = async (data: OAuthLoginData) => {
    const response = await fetch("/api/auth/oauth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al iniciar sesión con OAuth");
    }

    const result = await response.json();
    setUser(result.user);
    fetchWsToken();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, wsConnected, login, loginWithOAuth, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación
 * 
 * Debe usarse dentro de un componente envuelto por AuthProvider.
 * 
 * @returns Objeto con estado de usuario y funciones de autenticación
 * @throws Error si se usa fuera de AuthProvider
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, isLoading, logout } = useAuth();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!user) return <Navigate to="/portal" />;
 *   
 *   return (
 *     <div>
 *       <h1>Bienvenido, {user.name}</h1>
 *       <Button onClick={logout}>Cerrar Sesión</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

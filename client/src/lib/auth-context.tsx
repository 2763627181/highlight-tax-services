/**
 * @fileoverview Contexto de Autenticación de Highlight Tax Services
 * 
 * FIX APLICADO: Manejo de errores JSON y conexión - v1.2.0 (2025-12-11)
 * UPDATED: 2025-12-11 15:00 - Force push de mejoras de manejo de errores
 * 
 * Provee gestión centralizada del estado de autenticación para toda
 * la aplicación React. Maneja login, registro, logout y verificación
 * de sesión, además de la conexión WebSocket para notificaciones.
 * 
 * @module client/lib/auth-context
 * @version 1.2.1 - Fix: Manejo de errores JSON y conexión mejorado
 * @updated 2025-12-11 15:35 - Agregadas funciones fetchWithTimeout y safeJsonParse
 * @force-push: true
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
 * Timeout para peticiones fetch (60 segundos)
 * Aumentado para registro que puede tardar más en serverless (cold start + bcrypt)
 * Versión: 1.2.2 - FIX: Timeout aumentado para registro
 * Última actualización: 2025-12-11
 */
const FETCH_TIMEOUT = 60000; // 60 segundos para dar tiempo a cold starts y operaciones pesadas

/**
 * Realiza una petición fetch con timeout
 * 
 * @param url - URL a la que hacer la petición
 * @param options - Opciones de fetch
 * @returns Promise con la respuesta
 * @throws Error si hay timeout o error de red
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      // Distinguir entre diferentes tipos de errores
      if (error.name === "AbortError") {
        throw new Error("La solicitud tardó demasiado. Por favor, intenta de nuevo.");
      }
      // Si es un error de red real (sin conexión), mostrar mensaje específico
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        // Verificar si realmente hay conexión intentando una petición simple
        try {
          await fetch("/api/health", { method: "GET", signal: AbortSignal.timeout(2000) });
          // Si llegamos aquí, hay conexión pero el endpoint específico falló
          throw new Error("Error del servidor. Por favor, intenta de nuevo.");
        } catch {
          // Si falla el health check, probablemente no hay conexión
          throw new Error("Error de conexión. Verifica tu internet e intenta de nuevo.");
        }
      }
    }
    throw error;
  }
}

/**
 * Parsea una respuesta de forma segura, manejando casos donde no es JSON
 * 
 * @param response - Respuesta de fetch
 * @returns Promise con los datos parseados o un objeto con text si no es JSON
 */
async function safeJsonParse(response: Response): Promise<{ data?: any; text?: string }> {
  const contentType = response.headers.get("content-type");
  
  // Leer el texto primero (solo se puede leer una vez)
  const text = await response.text();
  
  // Si el Content-Type indica JSON, intentar parsear
  if (contentType && contentType.includes("application/json")) {
    try {
      return { data: JSON.parse(text) };
    } catch (error) {
      // Si falla el parseo aunque el header dice JSON, devolver el texto
      return { text };
    }
  }
  
  // Si no es JSON según el header, intentar parsear de todas formas
  // (algunos servidores no envían el header correcto)
  try {
    return { data: JSON.parse(text) };
  } catch {
    // No es JSON válido, devolver el texto
    return { text };
  }
}

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
        const result = await safeJsonParse(response);
        if (result.data && result.data.token) {
          setWsToken(result.data.token);
        }
      } else {
        // Si falla, no es crítico - WebSocket es opcional
        console.log('[Auth] WebSocket token no disponible (no crítico)');
        setWsToken(null);
      }
    } catch (error) {
      // WebSocket es opcional, no mostrar error al usuario
      console.log('[Auth] WebSocket token no disponible (no crítico):', error);
      setWsToken(null);
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
        const result = await safeJsonParse(response);
        if (result.data && result.data.user) {
          setUser(result.data.user);
          fetchWsToken();
        } else {
          setUser(null);
          setWsToken(null);
        }
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
    try {
      const response = await fetchWithTimeout("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Error al iniciar sesión";
        try {
          const result = await safeJsonParse(response);
          if (result.data && result.data.message) {
            errorMessage = result.data.message;
          } else if (result.text) {
            errorMessage = result.text;
          }
        } catch {
          errorMessage = response.status === 401 
            ? "Credenciales inválidas" 
            : `Error del servidor (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const result = await safeJsonParse(response);
      if (!result.data || !result.data.user) {
        throw new Error("Respuesta inválida del servidor");
      }
      const data = result.data;
      setUser(data.user);
      fetchWsToken();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your internet connection and try again.");
      }
      throw error;
    }
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
    try {
      const response = await fetchWithTimeout("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Error al registrarse";
        try {
          const parseResult = await safeJsonParse(response);
          if (parseResult.data && parseResult.data.message) {
            errorMessage = parseResult.data.message;
          } else if (parseResult.text) {
            errorMessage = parseResult.text;
          }
        } catch {
          errorMessage = response.status === 400 
            ? "Datos inválidos" 
            : `Error del servidor (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const parseResult = await safeJsonParse(response);
      if (!parseResult.data || !parseResult.data.user) {
        throw new Error("Respuesta inválida del servidor");
      }
      const result = parseResult.data;
      setUser(result.user);
      fetchWsToken();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your internet connection and try again.");
      }
      throw error;
    }
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
    try {
      const response = await fetchWithTimeout("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Error al iniciar sesión con OAuth";
        try {
          const parseResult = await safeJsonParse(response);
          if (parseResult.data && parseResult.data.message) {
            errorMessage = parseResult.data.message;
          } else if (parseResult.text) {
            errorMessage = parseResult.text;
          }
        } catch {
          errorMessage = `Error del servidor (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const parseResult = await safeJsonParse(response);
      if (!parseResult.data || !parseResult.data.user) {
        throw new Error("Respuesta inválida del servidor");
      }
      const result = parseResult.data;
      setUser(result.user);
      fetchWsToken();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your internet connection and try again.");
      }
      throw error;
    }
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

// FIX v1.2.0: Mejoras de manejo de errores JSON y conexión aplicadas - 2025-12-11

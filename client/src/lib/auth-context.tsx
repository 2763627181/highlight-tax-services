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

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { User } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";

/**
 * Timeout para peticiones fetch (30 segundos)
 * Implementado para solucionar errores de conexión en registro
 * Versión: 1.2.0 - FIX: Errores JSON y conexión
 * Última actualización: 2025-12-11
 */
const FETCH_TIMEOUT = 30000;

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
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Network error. Request timeout. Please check your internet connection and try again.");
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
  /** Flag para evitar múltiples llamadas simultáneas a checkAuth */
  const checkingAuthRef = useRef(false);
  /** Timestamp de la última verificación exitosa */
  const lastCheckRef = useRef<number>(0);
  /** Cache de 30 segundos para evitar requests innecesarios */
  const AUTH_CACHE_MS = 30000;

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
   * @performance Optimizado para producción:
   * - Evita múltiples llamadas simultáneas
   * - Respeta caché de 30 segundos
   * - Timeout de 20 segundos (suficiente para cold starts en Vercel)
   * 
   * @security Usa cookies HttpOnly, no expone tokens en localStorage
   */
  const checkAuth = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (checkingAuthRef.current) {
      return;
    }

    // Verificar caché (última verificación exitosa hace menos de 30 segundos)
    const now = Date.now();
    if (lastCheckRef.current > 0 && (now - lastCheckRef.current) < AUTH_CACHE_MS) {
      setIsLoading(false);
      return;
    }

    checkingAuthRef.current = true;
    
    try {
      // Timeout de 20 segundos para producción (cold starts en Vercel pueden tardar)
      // Usar FETCH_TIMEOUT (30s) pero con un límite más conservador para auth check
      const AUTH_CHECK_TIMEOUT = 20000; // 20 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AUTH_CHECK_TIMEOUT);

      const response = await fetch("/api/auth/me", {
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await safeJsonParse(response);
        if (result.data && result.data.user) {
          setUser(result.data.user);
          lastCheckRef.current = now;
          // Obtener token WS de forma asíncrona sin bloquear
          fetchWsToken().catch(console.error);
        } else {
          setUser(null);
          setWsToken(null);
          lastCheckRef.current = 0;
        }
      } else {
        setUser(null);
        setWsToken(null);
        lastCheckRef.current = 0;
      }
    } catch (error) {
      // En caso de error de red o timeout, no resetear el usuario si ya estaba autenticado
      // Esto evita que se pierda la sesión por problemas temporales de red o cold starts
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn("Auth check timeout - using cached state if available");
        // Si hay un usuario en caché, mantenerlo (podría ser un cold start lento)
        if (user) {
          console.log("Maintaining cached user state despite timeout");
          lastCheckRef.current = now; // Actualizar timestamp para evitar reintentos inmediatos
        }
      } else {
        console.error("Auth check error:", error);
        // Solo resetear si no hay usuario (primera carga)
        if (!user) {
          setUser(null);
          setWsToken(null);
        }
      }
      // No resetear lastCheckRef si hay timeout y hay usuario (podría ser temporal)
      if (!(error instanceof Error && error.name === 'AbortError' && user)) {
        lastCheckRef.current = 0;
      }
    } finally {
      setIsLoading(false);
      checkingAuthRef.current = false;
    }
  }, [fetchWsToken, user]);

  /** Hook de WebSocket para notificaciones en tiempo real */
  const { isConnected: wsConnected } = useWebSocket(wsToken);

  /** Verificar autenticación al montar el componente (solo una vez) */
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

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

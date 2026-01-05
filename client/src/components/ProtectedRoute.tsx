/**
 * @fileoverview Componente de Protección de Rutas
 * 
 * Protege rutas basándose en el estado de autenticación y roles del usuario.
 * Redirige automáticamente si el usuario no está autenticado o no tiene los permisos requeridos.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Rol requerido para acceder a esta ruta
   * - "admin": Solo admins y preparadores
   * - "preparer": Solo admins y preparadores (igual que admin)
   * - "client": Solo clientes
   * - undefined: Cualquier usuario autenticado
   */
  requiredRole?: "admin" | "preparer" | "client";
  /**
   * Ruta a la que redirigir si el usuario no está autenticado
   * @default "/portal"
   */
  redirectTo?: string;
}

/**
 * Componente que protege rutas basándose en autenticación y roles
 * 
 * @example
 * ```tsx
 * // Proteger ruta que requiere autenticación (cualquier rol)
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * // Proteger ruta que requiere ser admin o preparer
 * <ProtectedRoute requiredRole="admin">
 *   <Admin />
 * </ProtectedRoute>
 * 
 * // Proteger ruta que requiere ser cliente
 * <ProtectedRoute requiredRole="client">
 *   <ClientOnlyPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/portal",
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Esperar a que termine la verificación de autenticación
    if (isLoading) {
      return;
    }

    // Si no hay usuario, redirigir al login
    if (!user) {
      setLocation(redirectTo);
      return;
    }

    // Si se requiere un rol específico, verificar
    if (requiredRole) {
      if (requiredRole === "admin" || requiredRole === "preparer") {
        // Requiere admin o preparer
        if (user.role !== "admin" && user.role !== "preparer") {
          // Usuario es cliente, redirigir al dashboard
          setLocation("/dashboard");
        }
      } else if (requiredRole === "client") {
        // Requiere cliente
        if (user.role !== "client") {
          // Usuario es admin o preparer, redirigir al admin
          if (user.role === "admin" || user.role === "preparer") {
            setLocation("/admin");
          } else {
            setLocation(redirectTo);
          }
        }
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, setLocation]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (será redirigido por el useEffect)
  if (!user) {
    return null;
  }

  // Verificar rol si se requiere
  if (requiredRole) {
    if (requiredRole === "admin" || requiredRole === "preparer") {
      if (user.role !== "admin" && user.role !== "preparer") {
        return null; // Será redirigido por el useEffect
      }
    } else if (requiredRole === "client") {
      if (user.role !== "client") {
        return null; // Será redirigido por el useEffect
      }
    }
  }

  // Usuario autenticado y con permisos correctos - renderizar children
  return <>{children}</>;
}



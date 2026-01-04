import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getSession } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { loginWithOAuth, user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // Redirigir según el rol del usuario después de OAuth
  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "preparer") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const session = await getSession();
        
        if (!session || !session.user) {
          throw new Error('OAuth no está configurado o no se encontró sesión.');
        }

        await loginWithOAuth({
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          provider: (session.user.app_metadata?.provider as any) || 'oauth',
          providerId: session.user.id,
        });

        toast({
          title: "Welcome!",
          description: "You have successfully logged in.",
        });

        // NO redirigir aquí - el useEffect de arriba se encargará según el rol
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        toast({
          title: "Authentication Error",
          description: err instanceof Error ? err.message : "Failed to complete authentication",
          variant: "destructive",
        });
        
        setTimeout(() => {
          setLocation("/portal");
        }, 3000);
      }
    };

    handleCallback();
  }, [loginWithOAuth, setLocation, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Si el usuario se autenticó exitosamente, mostrar loading mientras se redirige
  // (el useEffect de arriba manejará la redirección)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

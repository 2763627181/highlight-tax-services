import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";

const translations = {
  en: {
    title: "Reset Password",
    subtitle: "Enter your new password",
    password: "New Password",
    confirmPassword: "Confirm Password",
    passwordRequirements: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
    submit: "Reset Password",
    success: "Password Reset Successfully",
    successMessage: "Your password has been reset. You can now log in with your new password.",
    goToLogin: "Go to Login",
    invalidToken: "Invalid or Expired Link",
    invalidTokenMessage: "This password reset link is invalid or has expired. Please request a new one.",
    requestNew: "Request New Link",
    passwordMismatch: "Passwords do not match",
    verifying: "Verifying link...",
    errors: {
      generic: "An error occurred. Please try again.",
      expired: "This link has expired. Please request a new password reset."
    }
  },
  es: {
    title: "Restablecer Contraseña",
    subtitle: "Ingrese su nueva contraseña",
    password: "Nueva Contraseña",
    confirmPassword: "Confirmar Contraseña",
    passwordRequirements: "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número",
    submit: "Restablecer Contraseña",
    success: "Contraseña Restablecida",
    successMessage: "Su contraseña ha sido restablecida. Ahora puede iniciar sesión con su nueva contraseña.",
    goToLogin: "Ir a Iniciar Sesión",
    invalidToken: "Enlace Inválido o Expirado",
    invalidTokenMessage: "Este enlace de restablecimiento es inválido o ha expirado. Por favor solicite uno nuevo.",
    requestNew: "Solicitar Nuevo Enlace",
    passwordMismatch: "Las contraseñas no coinciden",
    verifying: "Verificando enlace...",
    errors: {
      generic: "Ocurrió un error. Por favor intente de nuevo.",
      expired: "Este enlace ha expirado. Por favor solicite un nuevo restablecimiento."
    }
  },
  fr: {
    title: "Réinitialiser le Mot de Passe",
    subtitle: "Entrez votre nouveau mot de passe",
    password: "Nouveau Mot de Passe",
    confirmPassword: "Confirmer le Mot de Passe",
    passwordRequirements: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
    submit: "Réinitialiser le Mot de Passe",
    success: "Mot de Passe Réinitialisé",
    successMessage: "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.",
    goToLogin: "Aller à la Connexion",
    invalidToken: "Lien Invalide ou Expiré",
    invalidTokenMessage: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.",
    requestNew: "Demander un Nouveau Lien",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    verifying: "Vérification du lien...",
    errors: {
      generic: "Une erreur s'est produite. Veuillez réessayer.",
      expired: "Ce lien a expiré. Veuillez demander une nouvelle réinitialisation."
    }
  },
  pt: {
    title: "Redefinir Senha",
    subtitle: "Digite sua nova senha",
    password: "Nova Senha",
    confirmPassword: "Confirmar Senha",
    passwordRequirements: "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número",
    submit: "Redefinir Senha",
    success: "Senha Redefinida com Sucesso",
    successMessage: "Sua senha foi redefinida. Agora você pode fazer login com sua nova senha.",
    goToLogin: "Ir para Login",
    invalidToken: "Link Inválido ou Expirado",
    invalidTokenMessage: "Este link de redefinição é inválido ou expirou. Por favor, solicite um novo.",
    requestNew: "Solicitar Novo Link",
    passwordMismatch: "As senhas não coincidem",
    verifying: "Verificando link...",
    errors: {
      generic: "Ocorreu um erro. Por favor, tente novamente.",
      expired: "Este link expirou. Por favor, solicite uma nova redefinição."
    }
  },
  zh: {
    title: "重置密码",
    subtitle: "输入您的新密码",
    password: "新密码",
    confirmPassword: "确认密码",
    passwordRequirements: "密码必须至少包含8个字符、一个大写字母、一个小写字母和一个数字",
    submit: "重置密码",
    success: "密码重置成功",
    successMessage: "您的密码已重置。现在可以使用新密码登录。",
    goToLogin: "前往登录",
    invalidToken: "链接无效或已过期",
    invalidTokenMessage: "此重置链接无效或已过期。请申请新的链接。",
    requestNew: "申请新链接",
    passwordMismatch: "密码不匹配",
    verifying: "正在验证链接...",
    errors: {
      generic: "发生错误，请重试。",
      expired: "此链接已过期。请申请新的密码重置。"
    }
  },
  ht: {
    title: "Reyinisyalize Modpas",
    subtitle: "Antre nouvo modpas ou",
    password: "Nouvo Modpas",
    confirmPassword: "Konfime Modpas",
    passwordRequirements: "Modpas la dwe genyen omwen 8 karaktè, yon lèt majiskil, yon lèt miniskil, ak yon nimewo",
    submit: "Reyinisyalize Modpas",
    success: "Modpas Reyinisyalize",
    successMessage: "Modpas ou te reyinisyalize. Kounye a ou ka konekte ak nouvo modpas ou.",
    goToLogin: "Ale nan Koneksyon",
    invalidToken: "Lyen Envalid oswa Ekspire",
    invalidTokenMessage: "Lyen reyinisyalizasyon sa a envalid oswa ekspire. Tanpri mande yon nouvo.",
    requestNew: "Mande Nouvo Lyen",
    passwordMismatch: "Modpas yo pa koresponn",
    verifying: "Verifye lyen...",
    errors: {
      generic: "Gen yon erè ki rive. Tanpri eseye ankò.",
      expired: "Lyen sa a ekspire. Tanpri mande yon nouvo reyinisyalizasyon."
    }
  }
};

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useI18n();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    
    if (!tokenParam) {
      setIsVerifying(false);
      setIsTokenValid(false);
      return;
    }

    setToken(tokenParam);

    // Verify token
    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(tokenParam)}`)
      .then((res) => res.json())
      .then((data) => {
        setIsTokenValid(data.valid === true);
        setIsVerifying(false);
      })
      .catch(() => {
        setIsTokenValid(false);
        setIsVerifying(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: t.passwordMismatch,
      });
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      toast({
        variant: "destructive",
        title: t.passwordRequirements,
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
      } else {
        toast({
          variant: "destructive",
          title: data.message || t.errors.generic,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: t.errors.generic,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verifying state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-end gap-2 p-4">
          <LanguageSelector />
          <ThemeToggle />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="flex flex-col items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">{t.verifying}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid && !isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-end gap-2 p-4">
          <LanguageSelector />
          <ThemeToggle />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>{t.invalidToken}</CardTitle>
              <CardDescription className="mt-2">
                {t.invalidTokenMessage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => setLocation("/portal?mode=forgot")}
                data-testid="button-request-new"
              >
                {t.requestNew}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-end gap-2 p-4">
          <LanguageSelector />
          <ThemeToggle />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>{t.success}</CardTitle>
              <CardDescription className="mt-2">
                {t.successMessage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => setLocation("/portal")}
                data-testid="button-go-to-login"
              >
                {t.goToLogin}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-end gap-2 p-4">
        <LanguageSelector />
        <ThemeToggle />
      </header>
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    data-testid="input-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {t.passwordRequirements}
              </p>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-submit-reset"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.submit}
                  </>
                ) : (
                  t.submit
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
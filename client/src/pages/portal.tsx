/**
 * @fileoverview Client Portal Page
 * Página del portal de clientes con soporte multi-idioma
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { signInWithOAuth, type OAuthProvider } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus, FileText, Check, X } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";

type LoginFormData = {
  email: string;
  password: string;
};

type RegisterFormData = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
};

export default function Portal() {
  const [, setLocation] = useLocation();
  const { login, register, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const content = {
    en: {
      title: "Client Portal",
      subtitle: "Access your account to manage your documents and cases",
      loginTab: "Login",
      registerTab: "Register",
      email: "Email",
      emailPlaceholder: "your@email.com",
      password: "Password",
      passwordPlaceholder: "••••••••",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      namePlaceholder: "Your name",
      phone: "Phone (Optional)",
      phonePlaceholder: "(123) 456-7890",
      loginButton: "Login",
      loggingIn: "Logging in...",
      registerButton: "Create Account",
      creatingAccount: "Creating account...",
      orContinueWith: "Or continue with",
      termsText: "By registering, you accept our",
      termsLink: "Terms and Conditions",
      and: "and",
      privacyLink: "Privacy Policy",
      welcomeTitle: "Welcome",
      welcomeDesc: "You have logged in successfully.",
      accountCreatedTitle: "Account Created",
      accountCreatedDesc: "Your account has been created successfully.",
      errorTitle: "Error",
      loginError: "Error logging in",
      registerError: "Error registering",
      validationEmail: "Enter a valid email address",
      validationPassword: "Password must meet all requirements",
      validationName: "Name must be at least 2 characters",
      validationPasswordMatch: "Passwords do not match",
      pwdReqTitle: "Password requirements:",
      pwdReq8Chars: "At least 8 characters",
      pwdReqUppercase: "One uppercase letter",
      pwdReqLowercase: "One lowercase letter",
      pwdReqNumber: "One number",
      errorEmailExists: "This email is already registered. Try logging in instead.",
      errorInvalidCredentials: "Invalid email or password. Please try again.",
      errorPhoneFormat: "Enter a valid phone number (10-15 digits)",
      errorNameRequired: "Please enter your full name",
      errorEmailRequired: "Please enter your email address",
      errorPasswordRequired: "Please enter a password",
      errorConfirmRequired: "Please confirm your password",
      errorNetworkError: "Connection error. Please check your internet and try again.",
      forgotPassword: "Forgot your password?",
      forgotPasswordEmailSent: "If an account with that email exists, you will receive a password reset link.",
      forgotPasswordTitle: "Reset Password",
      forgotPasswordDesc: "Enter your email and we'll send you a link to reset your password.",
      sendResetLink: "Send Reset Link",
      backToLogin: "Back to Login",
    },
    es: {
      title: "Portal de Clientes",
      subtitle: "Accede a tu cuenta para gestionar tus documentos y casos",
      loginTab: "Iniciar Sesión",
      registerTab: "Registrarse",
      email: "Email",
      emailPlaceholder: "tu@email.com",
      password: "Contraseña",
      passwordPlaceholder: "••••••••",
      confirmPassword: "Confirmar Contraseña",
      fullName: "Nombre Completo",
      namePlaceholder: "Tu nombre",
      phone: "Teléfono (Opcional)",
      phonePlaceholder: "(123) 456-7890",
      loginButton: "Iniciar Sesión",
      loggingIn: "Iniciando...",
      registerButton: "Crear Cuenta",
      creatingAccount: "Creando cuenta...",
      orContinueWith: "O continúa con",
      termsText: "Al registrarte, aceptas nuestros",
      termsLink: "Términos y Condiciones",
      and: "y",
      privacyLink: "Política de Privacidad",
      welcomeTitle: "Bienvenido",
      welcomeDesc: "Has iniciado sesión correctamente.",
      accountCreatedTitle: "Cuenta creada",
      accountCreatedDesc: "Tu cuenta ha sido creada exitosamente.",
      errorTitle: "Error",
      loginError: "Error al iniciar sesión",
      registerError: "Error al registrarse",
      validationEmail: "Ingresa un correo electrónico válido",
      validationPassword: "La contraseña debe cumplir todos los requisitos",
      validationName: "El nombre debe tener al menos 2 caracteres",
      validationPasswordMatch: "Las contraseñas no coinciden",
      pwdReqTitle: "Requisitos de contraseña:",
      pwdReq8Chars: "Al menos 8 caracteres",
      pwdReqUppercase: "Una letra mayúscula",
      pwdReqLowercase: "Una letra minúscula",
      pwdReqNumber: "Un número",
      errorEmailExists: "Este correo ya está registrado. Intenta iniciar sesión.",
      errorInvalidCredentials: "Correo o contraseña incorrectos. Inténtalo de nuevo.",
      errorPhoneFormat: "Ingresa un número de teléfono válido (10-15 dígitos)",
      errorNameRequired: "Por favor ingresa tu nombre completo",
      errorEmailRequired: "Por favor ingresa tu correo electrónico",
      errorPasswordRequired: "Por favor ingresa una contraseña",
      errorConfirmRequired: "Por favor confirma tu contraseña",
      errorNetworkError: "Error de conexión. Verifica tu internet e intenta de nuevo.",
      forgotPassword: "¿Olvidaste tu contraseña?",
      forgotPasswordEmailSent: "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.",
      forgotPasswordTitle: "Restablecer Contraseña",
      forgotPasswordDesc: "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.",
      sendResetLink: "Enviar Enlace",
      backToLogin: "Volver al Inicio de Sesión",
    },
    fr: {
      title: "Portail Client",
      subtitle: "Accédez à votre compte pour gérer vos documents et dossiers",
      loginTab: "Connexion",
      registerTab: "S'inscrire",
      email: "Email",
      emailPlaceholder: "votre@email.com",
      password: "Mot de passe",
      passwordPlaceholder: "••••••••",
      confirmPassword: "Confirmer le mot de passe",
      fullName: "Nom complet",
      namePlaceholder: "Votre nom",
      phone: "Téléphone (Optionnel)",
      phonePlaceholder: "(123) 456-7890",
      loginButton: "Se connecter",
      loggingIn: "Connexion...",
      registerButton: "Créer un compte",
      creatingAccount: "Création du compte...",
      orContinueWith: "Ou continuez avec",
      termsText: "En vous inscrivant, vous acceptez nos",
      termsLink: "Conditions d'utilisation",
      and: "et",
      privacyLink: "Politique de confidentialité",
      welcomeTitle: "Bienvenue",
      welcomeDesc: "Vous vous êtes connecté avec succès.",
      accountCreatedTitle: "Compte créé",
      accountCreatedDesc: "Votre compte a été créé avec succès.",
      errorTitle: "Erreur",
      loginError: "Erreur de connexion",
      registerError: "Erreur d'inscription",
      validationEmail: "Entrez une adresse email valide",
      validationPassword: "Le mot de passe doit répondre à toutes les exigences",
      validationName: "Le nom doit contenir au moins 2 caractères",
      validationPasswordMatch: "Les mots de passe ne correspondent pas",
      pwdReqTitle: "Exigences du mot de passe:",
      pwdReq8Chars: "Au moins 8 caractères",
      pwdReqUppercase: "Une lettre majuscule",
      pwdReqLowercase: "Une lettre minuscule",
      pwdReqNumber: "Un chiffre",
      errorEmailExists: "Cet email est déjà enregistré. Essayez de vous connecter.",
      errorInvalidCredentials: "Email ou mot de passe invalide. Veuillez réessayer.",
      errorPhoneFormat: "Entrez un numéro de téléphone valide (10-15 chiffres)",
      errorNameRequired: "Veuillez entrer votre nom complet",
      errorEmailRequired: "Veuillez entrer votre adresse email",
      errorPasswordRequired: "Veuillez entrer un mot de passe",
      errorConfirmRequired: "Veuillez confirmer votre mot de passe",
      errorNetworkError: "Erreur de connexion. Vérifiez votre internet et réessayez.",
      forgotPassword: "Mot de passe oublié ?",
      forgotPasswordEmailSent: "Si un compte avec cet email existe, vous recevrez un lien de réinitialisation.",
      forgotPasswordTitle: "Réinitialiser le Mot de Passe",
      forgotPasswordDesc: "Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
      sendResetLink: "Envoyer le Lien",
      backToLogin: "Retour à la Connexion",
    },
    pt: {
      title: "Portal do Cliente",
      subtitle: "Acesse sua conta para gerenciar seus documentos e casos",
      loginTab: "Entrar",
      registerTab: "Registrar",
      email: "Email",
      emailPlaceholder: "seu@email.com",
      password: "Senha",
      passwordPlaceholder: "••••••••",
      confirmPassword: "Confirmar Senha",
      fullName: "Nome Completo",
      namePlaceholder: "Seu nome",
      phone: "Telefone (Opcional)",
      phonePlaceholder: "(123) 456-7890",
      loginButton: "Entrar",
      loggingIn: "Entrando...",
      registerButton: "Criar Conta",
      creatingAccount: "Criando conta...",
      orContinueWith: "Ou continue com",
      termsText: "Ao se registrar, você aceita nossos",
      termsLink: "Termos e Condições",
      and: "e",
      privacyLink: "Política de Privacidade",
      welcomeTitle: "Bem-vindo",
      welcomeDesc: "Você entrou com sucesso.",
      accountCreatedTitle: "Conta criada",
      accountCreatedDesc: "Sua conta foi criada com sucesso.",
      errorTitle: "Erro",
      loginError: "Erro ao entrar",
      registerError: "Erro ao registrar",
      validationEmail: "Digite um endereço de email válido",
      validationPassword: "A senha deve atender a todos os requisitos",
      validationName: "O nome deve ter pelo menos 2 caracteres",
      validationPasswordMatch: "As senhas não coincidem",
      pwdReqTitle: "Requisitos da senha:",
      pwdReq8Chars: "Pelo menos 8 caracteres",
      pwdReqUppercase: "Uma letra maiúscula",
      pwdReqLowercase: "Uma letra minúscula",
      pwdReqNumber: "Um número",
      errorEmailExists: "Este email já está registrado. Tente fazer login.",
      errorInvalidCredentials: "Email ou senha inválidos. Por favor, tente novamente.",
      errorPhoneFormat: "Digite um número de telefone válido (10-15 dígitos)",
      errorNameRequired: "Por favor, digite seu nome completo",
      errorEmailRequired: "Por favor, digite seu endereço de email",
      errorPasswordRequired: "Por favor, digite uma senha",
      errorConfirmRequired: "Por favor, confirme sua senha",
      errorNetworkError: "Erro de conexão. Verifique sua internet e tente novamente.",
      forgotPassword: "Esqueceu sua senha?",
      forgotPasswordEmailSent: "Se existir uma conta com esse email, você receberá um link para redefinir sua senha.",
      forgotPasswordTitle: "Redefinir Senha",
      forgotPasswordDesc: "Digite seu email e enviaremos um link para redefinir sua senha.",
      sendResetLink: "Enviar Link",
      backToLogin: "Voltar ao Login",
    },
    zh: {
      title: "客户门户",
      subtitle: "登录您的账户管理文件和案例",
      loginTab: "登录",
      registerTab: "注册",
      email: "电子邮件",
      emailPlaceholder: "your@email.com",
      password: "密码",
      passwordPlaceholder: "••••••••",
      confirmPassword: "确认密码",
      fullName: "全名",
      namePlaceholder: "您的姓名",
      phone: "电话（可选）",
      phonePlaceholder: "(123) 456-7890",
      loginButton: "登录",
      loggingIn: "登录中...",
      registerButton: "创建账户",
      creatingAccount: "创建账户中...",
      orContinueWith: "或继续使用",
      termsText: "注册即表示您接受我们的",
      termsLink: "条款和条件",
      and: "和",
      privacyLink: "隐私政策",
      welcomeTitle: "欢迎",
      welcomeDesc: "您已成功登录。",
      accountCreatedTitle: "账户已创建",
      accountCreatedDesc: "您的账户已成功创建。",
      errorTitle: "错误",
      loginError: "登录错误",
      registerError: "注册错误",
      validationEmail: "请输入有效的电子邮件地址",
      validationPassword: "密码必须满足所有要求",
      validationName: "姓名至少需要2个字符",
      validationPasswordMatch: "密码不匹配",
      pwdReqTitle: "密码要求：",
      pwdReq8Chars: "至少8个字符",
      pwdReqUppercase: "一个大写字母",
      pwdReqLowercase: "一个小写字母",
      pwdReqNumber: "一个数字",
      errorEmailExists: "此邮箱已注册。请尝试登录。",
      errorInvalidCredentials: "邮箱或密码无效。请重试。",
      errorPhoneFormat: "请输入有效的电话号码（10-15位数字）",
      errorNameRequired: "请输入您的全名",
      errorEmailRequired: "请输入您的电子邮件地址",
      errorPasswordRequired: "请输入密码",
      errorConfirmRequired: "请确认您的密码",
      errorNetworkError: "连接错误。请检查您的网络并重试。",
      forgotPassword: "忘记密码？",
      forgotPasswordEmailSent: "如果存在该邮箱的账户，您将收到密码重置链接。",
      forgotPasswordTitle: "重置密码",
      forgotPasswordDesc: "输入您的邮箱，我们将发送重置密码的链接。",
      sendResetLink: "发送链接",
      backToLogin: "返回登录",
    },
    ht: {
      title: "Pòtay Kliyan",
      subtitle: "Aksede nan kont ou pou jere dokiman ak dosye ou yo",
      loginTab: "Konekte",
      registerTab: "Enskri",
      email: "Imèl",
      emailPlaceholder: "ou@imèl.com",
      password: "Modpas",
      passwordPlaceholder: "••••••••",
      confirmPassword: "Konfime Modpas",
      fullName: "Non Konplè",
      namePlaceholder: "Non ou",
      phone: "Telefòn (Opsyonèl)",
      phonePlaceholder: "(123) 456-7890",
      loginButton: "Konekte",
      loggingIn: "Ap konekte...",
      registerButton: "Kreye Kont",
      creatingAccount: "Ap kreye kont...",
      orContinueWith: "Oswa kontinye ak",
      termsText: "Lè w enskri, ou aksepte",
      termsLink: "Tèm ak Kondisyon",
      and: "ak",
      privacyLink: "Politik Konfidansyalite",
      welcomeTitle: "Byenveni",
      welcomeDesc: "Ou konekte avèk siksè.",
      accountCreatedTitle: "Kont kreye",
      accountCreatedDesc: "Kont ou a kreye avèk siksè.",
      errorTitle: "Erè",
      loginError: "Erè nan koneksyon",
      registerError: "Erè nan enskripsyon",
      validationEmail: "Antre yon adrès imèl valid",
      validationPassword: "Modpas la dwe ranpli tout egzijans yo",
      validationName: "Non an dwe gen omwen 2 karaktè",
      validationPasswordMatch: "Modpas yo pa matche",
      pwdReqTitle: "Egzijans modpas:",
      pwdReq8Chars: "Omwen 8 karaktè",
      pwdReqUppercase: "Yon lèt majiskil",
      pwdReqLowercase: "Yon lèt miniskil",
      pwdReqNumber: "Yon nimewo",
      errorEmailExists: "Imèl sa a deja anrejistre. Eseye konekte.",
      errorInvalidCredentials: "Imèl oswa modpas pa valid. Tanpri eseye ankò.",
      errorPhoneFormat: "Antre yon nimewo telefòn valid (10-15 chif)",
      errorNameRequired: "Tanpri antre non konplè ou",
      errorEmailRequired: "Tanpri antre adrès imèl ou",
      errorPasswordRequired: "Tanpri antre yon modpas",
      errorConfirmRequired: "Tanpri konfime modpas ou",
      errorNetworkError: "Erè koneksyon. Tcheke entènèt ou epi eseye ankò.",
      forgotPassword: "Ou bliye modpas ou?",
      forgotPasswordEmailSent: "Si yon kont ak imèl sa a egziste, ou pral resevwa yon lyen pou reyinisyalize.",
      forgotPasswordTitle: "Reyinisyalize Modpas",
      forgotPasswordDesc: "Antre imèl ou epi nou pral voye yon lyen pou reyinisyalize modpas ou.",
      sendResetLink: "Voye Lyen",
      backToLogin: "Retounen nan Koneksyon",
    },
  };

  const currentContent = content[language as keyof typeof content] || content.en;

  const loginSchema = z.object({
    email: z.string().email(currentContent.validationEmail),
    password: z.string().min(6, currentContent.validationPassword),
  });

  const registerSchema = z.object({
    name: z.string().min(2, currentContent.validationName),
    email: z.string().email(currentContent.validationEmail),
    phone: z.string().optional(),
    password: z.string()
      .min(8, currentContent.validationPassword)
      .regex(/[A-Z]/, currentContent.validationPassword)
      .regex(/[a-z]/, currentContent.validationPassword)
      .regex(/[0-9]/, currentContent.validationPassword),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: currentContent.validationPasswordMatch,
    path: ["confirmPassword"],
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const passwordValue = registerForm.watch("password") || "";
  const passwordChecks = {
    minLength: passwordValue.length >= 8,
    hasUppercase: /[A-Z]/.test(passwordValue),
    hasLowercase: /[a-z]/.test(passwordValue),
    hasNumber: /[0-9]/.test(passwordValue),
  };

  // Redirigir usuarios autenticados según su rol
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin" || user.role === "preparer") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si el usuario está autenticado, mostrar loading mientras se redirige
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) return currentContent.errorNetworkError;
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid") || msg.includes("incorrect") || msg.includes("wrong")) {
      return currentContent.errorInvalidCredentials;
    }
    if (msg.includes("already") || msg.includes("exists") || msg.includes("duplicate")) {
      return currentContent.errorEmailExists;
    }
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("connection")) {
      return currentContent.errorNetworkError;
    }
    return error.message;
  };

  const onLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast({
        title: currentContent.welcomeTitle,
        description: currentContent.welcomeDesc,
      });
    } catch (error) {
      toast({
        title: currentContent.errorTitle,
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      toast({
        title: currentContent.accountCreatedTitle,
        description: currentContent.accountCreatedDesc,
      });
    } catch (error) {
      toast({
        title: currentContent.errorTitle,
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setIsOAuthLoading(true);
    try {
      // Verificar que Supabase esté configurado antes de intentar OAuth
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('OAuth no está configurado. Por favor, usa el registro con email y contraseña.');
      }
      
      await signInWithOAuth(provider);
    } catch (error) {
      toast({
        title: currentContent.errorTitle,
        description: getErrorMessage(error),
        variant: "destructive",
      });
      setIsOAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    
    setIsSendingReset(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      if (res.ok) {
        setForgotEmailSent(true);
      } else {
        const data = await res.json();
        toast({
          title: currentContent.errorTitle,
          description: data.message || currentContent.errorNetworkError,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: currentContent.errorTitle,
        description: currentContent.errorNetworkError,
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16" data-testid="page-portal">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{currentContent.title}</h1>
            <p className="text-muted-foreground mt-2">
              {currentContent.subtitle}
            </p>
          </div>

          <Card data-testid="card-auth">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="tab-login">
                    <LogIn className="h-4 w-4 mr-2" />
                    {currentContent.loginTab}
                  </TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {currentContent.registerTab}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.email}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={currentContent.emailPlaceholder}
                                {...field}
                                data-testid="input-login-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.password}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={currentContent.passwordPlaceholder}
                                {...field}
                                data-testid="input-login-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        data-testid="button-login-submit"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {currentContent.loggingIn}
                          </>
                        ) : (
                          currentContent.loginButton
                        )}
                      </Button>

                      <div className="text-center mt-3">
                        <button
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={() => setShowForgotPassword(true)}
                          data-testid="link-forgot-password"
                        >
                          {currentContent.forgotPassword}
                        </button>
                      </div>
                    </form>
                  </Form>

                  {showForgotPassword && (
                    <div className="mt-6 p-4 border rounded-md bg-muted/50">
                      {!forgotEmailSent ? (
                        <>
                          <h3 className="font-semibold mb-2">{currentContent.forgotPasswordTitle}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {currentContent.forgotPasswordDesc}
                          </p>
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <Input
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder={currentContent.emailPlaceholder}
                              required
                              data-testid="input-forgot-email"
                            />
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSendingReset}
                                data-testid="button-send-reset"
                              >
                                {isSendingReset ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  currentContent.sendResetLink
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowForgotPassword(false);
                                  setForgotEmail("");
                                }}
                                data-testid="button-back-to-login"
                              >
                                {currentContent.backToLogin}
                              </Button>
                            </div>
                          </form>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm">{currentContent.forgotPasswordEmailSent}</p>
                          <button
                            className="mt-2 text-sm text-primary hover:underline"
                            onClick={() => {
                              setShowForgotPassword(false);
                              setForgotEmailSent(false);
                              setForgotEmail("");
                            }}
                            data-testid="button-back-after-sent"
                          >
                            {currentContent.backToLogin}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        {currentContent.orContinueWith}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleOAuthLogin('google')}
                      disabled={isOAuthLoading}
                      data-testid="button-google-login"
                    >
                      <SiGoogle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleOAuthLogin('github')}
                      disabled={isOAuthLoading}
                      data-testid="button-github-login"
                    >
                      <SiGithub className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleOAuthLogin('apple')}
                      disabled={isOAuthLoading}
                      data-testid="button-apple-login"
                    >
                      <SiApple className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.fullName}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={currentContent.namePlaceholder}
                                {...field}
                                data-testid="input-register-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.email}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={currentContent.emailPlaceholder}
                                {...field}
                                data-testid="input-register-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.phone}</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="tel"
                                placeholder={currentContent.phonePlaceholder}
                                {...field}
                                data-testid="input-register-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.password}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={currentContent.passwordPlaceholder}
                                {...field}
                                data-testid="input-register-password"
                              />
                            </FormControl>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className="text-muted-foreground font-medium">{currentContent.pwdReqTitle}</p>
                              <div className="grid grid-cols-2 gap-1">
                                <div className={`flex items-center gap-1.5 ${passwordChecks.minLength ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                                  {passwordChecks.minLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                  <span>{currentContent.pwdReq8Chars}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordChecks.hasUppercase ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                                  {passwordChecks.hasUppercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                  <span>{currentContent.pwdReqUppercase}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordChecks.hasLowercase ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                                  {passwordChecks.hasLowercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                  <span>{currentContent.pwdReqLowercase}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                                  {passwordChecks.hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                  <span>{currentContent.pwdReqNumber}</span>
                                </div>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.confirmPassword}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={currentContent.passwordPlaceholder}
                                {...field}
                                data-testid="input-register-confirm-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        data-testid="button-register-submit"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {currentContent.creatingAccount}
                          </>
                        ) : (
                          currentContent.registerButton
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {currentContent.termsText}{" "}
            <a href="/terms" className="text-primary hover:underline">
              {currentContent.termsLink}
            </a>{" "}
            {currentContent.and}{" "}
            <a href="/privacy-policy" className="text-primary hover:underline">
              {currentContent.privacyLink}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

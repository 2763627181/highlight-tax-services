/**
 * @fileoverview Client Portal Page
 * Página del portal de clientes con soporte multi-idioma
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
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
import { Loader2, LogIn, UserPlus, FileText } from "lucide-react";
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
      validationPassword: "Password must be at least 6 characters",
      validationName: "Name must be at least 2 characters",
      validationPasswordMatch: "Passwords do not match",
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
      validationPassword: "La contraseña debe tener al menos 6 caracteres",
      validationName: "El nombre debe tener al menos 2 caracteres",
      validationPasswordMatch: "Las contraseñas no coinciden",
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
      validationPassword: "Le mot de passe doit contenir au moins 6 caractères",
      validationName: "Le nom doit contenir au moins 2 caractères",
      validationPasswordMatch: "Les mots de passe ne correspondent pas",
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
      validationPassword: "A senha deve ter pelo menos 6 caracteres",
      validationName: "O nome deve ter pelo menos 2 caracteres",
      validationPasswordMatch: "As senhas não coincidem",
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
      validationPassword: "密码至少需要6个字符",
      validationName: "姓名至少需要2个字符",
      validationPasswordMatch: "密码不匹配",
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
      validationPassword: "Modpas la dwe gen omwen 6 karaktè",
      validationName: "Non an dwe gen omwen 2 karaktè",
      validationPasswordMatch: "Modpas yo pa matche",
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
    password: z.string().min(6, currentContent.validationPassword),
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    if (user.role === "admin" || user.role === "preparer") {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
    return null;
  }

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
        description: error instanceof Error ? error.message : currentContent.loginError,
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
        description: error instanceof Error ? error.message : currentContent.registerError,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                    </form>
                  </Form>

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
                    <a href="/api/login" className="block">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        data-testid="button-google-login"
                      >
                        <SiGoogle className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href="/api/login" className="block">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        data-testid="button-github-login"
                      >
                        <SiGithub className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href="/api/login" className="block">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        data-testid="button-apple-login"
                      >
                        <SiApple className="h-4 w-4" />
                      </Button>
                    </a>
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
                                type="tel"
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

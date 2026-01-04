/**
 * @fileoverview Contact Section Component
 * Sección de contacto con formulario multi-idioma
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useI18n } from "@/lib/i18n";

type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export function ContactSection() {
  const { toast } = useToast();
  const { language } = useI18n();
  const [isSuccess, setIsSuccess] = useState(false);

  const content = {
    en: {
      title: "Contact Us",
      subtitle: "Have questions? Send us a message and we'll respond as soon as possible.",
      formTitle: "Contact Form",
      nameLabel: "Name *",
      namePlaceholder: "Your full name",
      emailLabel: "Email *",
      emailPlaceholder: "your@email.com",
      phoneLabel: "Phone",
      phonePlaceholder: "(123) 456-7890",
      messageLabel: "Message *",
      messagePlaceholder: "How can we help you?",
      submitButton: "Send Message",
      sending: "Sending...",
      successTitle: "Message Sent",
      successMessage: "Thank you for contacting us. We'll respond soon.",
      newMessageButton: "Send another message",
      toastSuccessTitle: "Message sent",
      toastSuccessDesc: "Thank you for contacting us. We'll respond soon.",
      toastErrorTitle: "Error",
      toastErrorDesc: "Could not send message. Please try again.",
      validationName: "Name must be at least 2 characters",
      validationEmail: "Enter a valid email address",
      validationMessage: "Message must be at least 10 characters",
    },
    es: {
      title: "Contáctanos",
      subtitle: "¿Tienes preguntas? Envíanos un mensaje y te responderemos lo antes posible.",
      formTitle: "Formulario de Contacto",
      nameLabel: "Nombre *",
      namePlaceholder: "Tu nombre completo",
      emailLabel: "Email *",
      emailPlaceholder: "tu@email.com",
      phoneLabel: "Teléfono",
      phonePlaceholder: "(123) 456-7890",
      messageLabel: "Mensaje *",
      messagePlaceholder: "¿En qué podemos ayudarte?",
      submitButton: "Enviar Mensaje",
      sending: "Enviando...",
      successTitle: "Mensaje Enviado",
      successMessage: "Gracias por contactarnos. Responderemos pronto.",
      newMessageButton: "Enviar otro mensaje",
      toastSuccessTitle: "Mensaje enviado",
      toastSuccessDesc: "Gracias por contactarnos. Responderemos pronto.",
      toastErrorTitle: "Error",
      toastErrorDesc: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
      validationName: "El nombre debe tener al menos 2 caracteres",
      validationEmail: "Ingresa un correo electrónico válido",
      validationMessage: "El mensaje debe tener al menos 10 caracteres",
    },
    fr: {
      title: "Contactez-Nous",
      subtitle: "Vous avez des questions? Envoyez-nous un message et nous vous répondrons dès que possible.",
      formTitle: "Formulaire de Contact",
      nameLabel: "Nom *",
      namePlaceholder: "Votre nom complet",
      emailLabel: "Email *",
      emailPlaceholder: "votre@email.com",
      phoneLabel: "Téléphone",
      phonePlaceholder: "(123) 456-7890",
      messageLabel: "Message *",
      messagePlaceholder: "Comment pouvons-nous vous aider?",
      submitButton: "Envoyer le Message",
      sending: "Envoi en cours...",
      successTitle: "Message Envoyé",
      successMessage: "Merci de nous avoir contactés. Nous vous répondrons bientôt.",
      newMessageButton: "Envoyer un autre message",
      toastSuccessTitle: "Message envoyé",
      toastSuccessDesc: "Merci de nous avoir contactés. Nous vous répondrons bientôt.",
      toastErrorTitle: "Erreur",
      toastErrorDesc: "Impossible d'envoyer le message. Veuillez réessayer.",
      validationName: "Le nom doit contenir au moins 2 caractères",
      validationEmail: "Entrez une adresse email valide",
      validationMessage: "Le message doit contenir au moins 10 caractères",
    },
    pt: {
      title: "Entre em Contato",
      subtitle: "Tem perguntas? Envie-nos uma mensagem e responderemos o mais rápido possível.",
      formTitle: "Formulário de Contato",
      nameLabel: "Nome *",
      namePlaceholder: "Seu nome completo",
      emailLabel: "Email *",
      emailPlaceholder: "seu@email.com",
      phoneLabel: "Telefone",
      phonePlaceholder: "(123) 456-7890",
      messageLabel: "Mensagem *",
      messagePlaceholder: "Como podemos ajudá-lo?",
      submitButton: "Enviar Mensagem",
      sending: "Enviando...",
      successTitle: "Mensagem Enviada",
      successMessage: "Obrigado por nos contatar. Responderemos em breve.",
      newMessageButton: "Enviar outra mensagem",
      toastSuccessTitle: "Mensagem enviada",
      toastSuccessDesc: "Obrigado por nos contatar. Responderemos em breve.",
      toastErrorTitle: "Erro",
      toastErrorDesc: "Não foi possível enviar a mensagem. Por favor, tente novamente.",
      validationName: "O nome deve ter pelo menos 2 caracteres",
      validationEmail: "Digite um endereço de email válido",
      validationMessage: "A mensagem deve ter pelo menos 10 caracteres",
    },
    zh: {
      title: "联系我们",
      subtitle: "有问题吗？给我们发消息，我们会尽快回复。",
      formTitle: "联系表单",
      nameLabel: "姓名 *",
      namePlaceholder: "您的全名",
      emailLabel: "电子邮件 *",
      emailPlaceholder: "your@email.com",
      phoneLabel: "电话",
      phonePlaceholder: "(123) 456-7890",
      messageLabel: "留言 *",
      messagePlaceholder: "我们如何帮助您？",
      submitButton: "发送消息",
      sending: "发送中...",
      successTitle: "消息已发送",
      successMessage: "感谢您联系我们。我们会尽快回复。",
      newMessageButton: "发送另一条消息",
      toastSuccessTitle: "消息已发送",
      toastSuccessDesc: "感谢您联系我们。我们会尽快回复。",
      toastErrorTitle: "错误",
      toastErrorDesc: "无法发送消息。请重试。",
      validationName: "姓名至少需要2个字符",
      validationEmail: "请输入有效的电子邮件地址",
      validationMessage: "消息至少需要10个字符",
    },
    ht: {
      title: "Kontakte Nou",
      subtitle: "Ou gen kesyon? Voye nou yon mesaj e nou pral reponn pi vit posib.",
      formTitle: "Fòm Kontak",
      nameLabel: "Non *",
      namePlaceholder: "Non konplè ou",
      emailLabel: "Imèl *",
      emailPlaceholder: "ou@imèl.com",
      phoneLabel: "Telefòn",
      phonePlaceholder: "(123) 456-7890",
      messageLabel: "Mesaj *",
      messagePlaceholder: "Kijan nou ka ede w?",
      submitButton: "Voye Mesaj",
      sending: "Ap voye...",
      successTitle: "Mesaj Voye",
      successMessage: "Mèsi paske ou kontakte nou. Nou pral reponn byento.",
      newMessageButton: "Voye yon lòt mesaj",
      toastSuccessTitle: "Mesaj voye",
      toastSuccessDesc: "Mèsi paske ou kontakte nou. Nou pral reponn byento.",
      toastErrorTitle: "Erè",
      toastErrorDesc: "Pa t kapab voye mesaj la. Tanpri eseye ankò.",
      validationName: "Non an dwe gen omwen 2 karaktè",
      validationEmail: "Antre yon adrès imèl valid",
      validationMessage: "Mesaj la dwe gen omwen 10 karaktè",
    },
  };

  const currentContent = content[language as keyof typeof content] || content.en;

  const contactSchema = z.object({
    name: z.string().min(2, currentContent.validationName),
    email: z.string().email(currentContent.validationEmail),
    phone: z.string().optional(),
    message: z.string().min(10, currentContent.validationMessage),
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = currentContent.toastErrorDesc;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
          errorMessage = `${currentContent.toastErrorDesc} (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      form.reset();
      toast({
        title: currentContent.toastSuccessTitle,
        description: currentContent.toastErrorDesc,
      });
    },
    onError: (error: Error) => {
      toast({
        title: currentContent.toastErrorTitle,
        description: error.message || currentContent.toastErrorDesc,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 scroll-mt-20" data-testid="section-contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {currentContent.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {currentContent.subtitle}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card data-testid="card-contact-form">
            <CardHeader>
              <CardTitle className="text-xl">{currentContent.formTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/20 text-accent">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{currentContent.successTitle}</h3>
                  <p className="text-muted-foreground">
                    {currentContent.successMessage}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    data-testid="button-new-message"
                  >
                    {currentContent.newMessageButton}
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{currentContent.nameLabel}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={currentContent.namePlaceholder}
                              {...field} 
                              data-testid="input-contact-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.emailLabel}</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder={currentContent.emailPlaceholder}
                                {...field} 
                                data-testid="input-contact-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{currentContent.phoneLabel}</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder={currentContent.phonePlaceholder}
                                {...field} 
                                data-testid="input-contact-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{currentContent.messageLabel}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={currentContent.messagePlaceholder}
                              className="min-h-[120px] resize-none"
                              {...field}
                              data-testid="input-contact-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={mutation.isPending}
                      data-testid="button-contact-submit"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {currentContent.sending}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {currentContent.submitButton}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

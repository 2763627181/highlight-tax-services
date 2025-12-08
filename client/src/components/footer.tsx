/**
 * @fileoverview Footer Component
 * Pie de página con soporte multi-idioma
 */

import { Link } from "wouter";
import { FileText, MapPin, Phone, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { language } = useI18n();

  const content = {
    en: {
      description: "Professional tax preparation services for individuals and businesses throughout the United States.",
      quickLinks: "Quick Links",
      legal: "Legal",
      contact: "Contact",
      home: "Home",
      services: "Services",
      about: "About Us",
      contactLink: "Contact",
      clientPortal: "Client Portal",
      privacyPolicy: "Privacy Policy",
      terms: "Terms & Conditions",
      copyright: "All Rights Reserved",
      whatsappMessage: "Hello, I would like information about your tax services",
    },
    es: {
      description: "Servicios profesionales de preparación de impuestos para individuos y empresas en todo Estados Unidos.",
      quickLinks: "Enlaces Rápidos",
      legal: "Legal",
      contact: "Contacto",
      home: "Inicio",
      services: "Servicios",
      about: "Nosotros",
      contactLink: "Contacto",
      clientPortal: "Portal de Clientes",
      privacyPolicy: "Política de Privacidad",
      terms: "Términos y Condiciones",
      copyright: "Todos los Derechos Reservados",
      whatsappMessage: "Hola, quiero información sobre sus servicios de taxes",
    },
    fr: {
      description: "Services professionnels de préparation fiscale pour les particuliers et les entreprises à travers les États-Unis.",
      quickLinks: "Liens Rapides",
      legal: "Légal",
      contact: "Contact",
      home: "Accueil",
      services: "Services",
      about: "À Propos",
      contactLink: "Contact",
      clientPortal: "Portail Client",
      privacyPolicy: "Politique de Confidentialité",
      terms: "Conditions Générales",
      copyright: "Tous Droits Réservés",
      whatsappMessage: "Bonjour, je voudrais des informations sur vos services fiscaux",
    },
    pt: {
      description: "Serviços profissionais de preparação de impostos para indivíduos e empresas em todos os Estados Unidos.",
      quickLinks: "Links Rápidos",
      legal: "Legal",
      contact: "Contato",
      home: "Início",
      services: "Serviços",
      about: "Sobre Nós",
      contactLink: "Contato",
      clientPortal: "Portal do Cliente",
      privacyPolicy: "Política de Privacidade",
      terms: "Termos e Condições",
      copyright: "Todos os Direitos Reservados",
      whatsappMessage: "Olá, gostaria de informações sobre seus serviços fiscais",
    },
    zh: {
      description: "为全美个人和企业提供专业的税务准备服务。",
      quickLinks: "快速链接",
      legal: "法律",
      contact: "联系方式",
      home: "首页",
      services: "服务",
      about: "关于我们",
      contactLink: "联系",
      clientPortal: "客户门户",
      privacyPolicy: "隐私政策",
      terms: "条款和条件",
      copyright: "版权所有",
      whatsappMessage: "您好，我想了解您的税务服务信息",
    },
    ht: {
      description: "Sèvis preparasyon taks pwofesyonèl pou moun ak biznis nan tout Etazini.",
      quickLinks: "Lyen Rapid",
      legal: "Legal",
      contact: "Kontak",
      home: "Akèy",
      services: "Sèvis",
      about: "Sou Nou",
      contactLink: "Kontak",
      clientPortal: "Pòtay Kliyan",
      privacyPolicy: "Politik Konfidansyalite",
      terms: "Tèm ak Kondisyon",
      copyright: "Tout Dwa Rezève",
      whatsappMessage: "Bonjou, mwen ta renmen enfòmasyon sou sèvis taks ou yo",
    },
  };

  const currentContent = content[language as keyof typeof content] || content.en;
  const whatsappUrl = `https://wa.me/19172574554?text=${encodeURIComponent(currentContent.whatsappMessage)}`;

  return (
    <footer className="bg-primary text-primary-foreground" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <span className="font-semibold text-lg">
                Highlight Tax Services
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {currentContent.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{currentContent.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-home"
                >
                  {currentContent.home}
                </Link>
              </li>
              <li>
                <Link 
                  href="/#services" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-services"
                >
                  {currentContent.services}
                </Link>
              </li>
              <li>
                <Link 
                  href="/#about" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-about"
                >
                  {currentContent.about}
                </Link>
              </li>
              <li>
                <Link 
                  href="/#contact" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-contact"
                >
                  {currentContent.contactLink}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{currentContent.legal}</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/portal" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-portal"
                >
                  {currentContent.clientPortal}
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-privacy"
                >
                  {currentContent.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-terms"
                >
                  {currentContent.terms}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{currentContent.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-primary-foreground/70" />
                <span className="text-primary-foreground/70 text-sm">
                  84 West 188th Street, Apt 3C<br />
                  Bronx, NY 10468
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <a 
                  href="tel:+19172574554" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-phone"
                >
                  +1 917-257-4554
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <a 
                  href="mailto:servicestaxx@gmail.com" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-email"
                >
                  servicestaxx@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <SiWhatsapp className="h-5 w-5 shrink-0 text-primary-foreground/70" />
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-whatsapp"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <p className="text-center text-primary-foreground/60 text-sm">
            © 2025 Highlight Tax Services. {currentContent.copyright}.
          </p>
        </div>
      </div>
    </footer>
  );
}

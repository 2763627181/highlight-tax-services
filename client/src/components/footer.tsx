import { Link } from "wouter";
import { FileText, MapPin, Phone, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_URL = "https://wa.me/19172574554?text=Hola%20quiero%20información%20sobre%20sus%20servicios%20de%20taxes";

export function Footer() {
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
              Servicios profesionales de preparación de impuestos para 
              individuos y empresas en todo Estados Unidos.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-home"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/#services" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-services"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link 
                  href="/#about" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-about"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link 
                  href="/#contact" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-contact"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/portal" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-portal"
                >
                  Portal de Clientes
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-privacy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  data-testid="footer-link-terms"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contacto</h3>
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
                  href={WHATSAPP_URL}
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
            © 2025 Highlight Tax Services. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * @fileoverview Header Component with Navigation
 * Componente de cabecera con navegación multi-idioma
 * 
 * Features / Características:
 * - Responsive navigation with mobile menu
 * - Language selector for multi-language support
 * - Theme toggle for dark/light mode
 * - Smooth scroll to sections
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const navItems = [
    { href: "/", labelKey: "nav_home" as const },
    { href: "/#services", labelKey: "nav_services" as const },
    { href: "/#about", labelKey: "nav_about" as const },
    { href: "/#contact", labelKey: "nav_contact" as const },
    { href: "/portal", labelKey: "nav_portal" as const },
    { href: "/policies", labelKey: "nav_policies" as const },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      const elementId = href.slice(2);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      )}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2" data-testid="link-logo">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <span className="font-semibold text-lg hidden sm:block">
              Highlight Tax Services
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm font-medium",
                    location === item.href && "bg-muted"
                  )}
                  onClick={() => handleNavClick(item.href)}
                  data-testid={`nav-${item.labelKey}`}
                >
                  {t(item.labelKey)}
                </Button>
              </Link>
            ))}
            <LanguageSelector variant="compact" />
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSelector variant="compact" />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border bg-background/95 backdrop-blur-md">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm font-medium",
                      location === item.href && "bg-muted"
                    )}
                    onClick={() => handleNavClick(item.href)}
                    data-testid={`mobile-nav-${item.labelKey}`}
                  >
                    {t(item.labelKey)}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

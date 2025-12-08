/**
 * @fileoverview Language Selector Component
 * Componente selector de idioma con dropdown
 * 
 * Displays a dropdown menu allowing users to switch between supported languages.
 * Muestra un menú desplegable para cambiar entre los idiomas soportados.
 */

import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "default" | "compact";
  className?: string;
}

export function LanguageSelector({ variant = "default", className }: LanguageSelectorProps) {
  const { language, setLanguage, languages } = useI18n();
  
  const currentLanguage = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "compact" ? "icon" : "default"}
          className={cn("gap-2", className)}
          data-testid="button-language-selector"
        >
          <Globe className="h-4 w-4" />
          {variant === "default" && (
            <span className="hidden sm:inline">{currentLanguage?.nativeName}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={cn(
              "gap-3 cursor-pointer",
              language === lang.code && "bg-muted"
            )}
            data-testid={`language-option-${lang.code}`}
          >
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {lang.flag}
            </span>
            <span className="flex-1">{lang.nativeName}</span>
            {language === lang.code && (
              <Check className="h-4 w-4 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client"

import { useState } from "react"
import { useCurrentLocale, useI18n } from "@/locales/client"
import { setClientLocale } from "@/utils/language-utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const currentLocale = useCurrentLocale()
  const t = useI18n()
  const [isChanging, setIsChanging] = useState(false)

  const languages = {
    en: t("english"),
    sv: t("swedish"),
    ar: "العربية",
  }

  const handleLanguageChange = (locale: string) => {
    if (locale === currentLocale) return

    setIsChanging(true)
    setClientLocale(locale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isChanging}>
          <Globe className="h-4 w-4 mr-2" />
          {languages[currentLocale as keyof typeof languages]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={currentLocale === code ? "bg-accent" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

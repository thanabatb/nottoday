"use client";

import { Languages } from "lucide-react";
import { getCopy, getLanguageLabel } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function LocaleToggle({
  className = "",
  locale,
  onToggle,
}: {
  className?: string;
  locale: Locale;
  onToggle: () => void;
}) {
  const copy = getCopy(locale);

  return (
    <button
      aria-label={`${copy.common.switchLanguage}. ${copy.common.language}: ${getLanguageLabel(locale)}`}
      className={`locale-toggle ${className}`.trim()}
      onClick={onToggle}
      type="button"
    >
      <Languages className="size-4" />
      <span>{getLanguageLabel(locale)}</span>
    </button>
  );
}

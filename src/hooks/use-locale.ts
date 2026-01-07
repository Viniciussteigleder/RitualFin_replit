export type Locale = "pt-BR" | "de-DE" | "en-US";

export function useLocale(): Locale {
  // TODO: Connect to real settings or Next.js i18n
  return "pt-BR";
}

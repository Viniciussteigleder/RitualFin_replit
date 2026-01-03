import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api";
import type { Locale } from "@/lib/i18n";

export function useLocale() {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });
  return (settings?.language || "pt-BR") as Locale;
}

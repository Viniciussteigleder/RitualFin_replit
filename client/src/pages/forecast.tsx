import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { forecastCopy, t } from "@/lib/i18n";

export default function ForecastPage() {
  const locale = useLocale();
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t(locale, forecastCopy.title)}</h1>
          <p className="text-muted-foreground">{t(locale, forecastCopy.subtitle)}</p>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              {t(locale, forecastCopy.preparing)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t(locale, forecastCopy.preparingBody)}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

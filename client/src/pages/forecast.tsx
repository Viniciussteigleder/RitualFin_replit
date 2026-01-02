import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function ForecastPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Previsão & Recorrência</h1>
          <p className="text-muted-foreground">
            Veja pagamentos recorrentes previstos, confiança e variações esperadas.
          </p>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Em preparação
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Esta tela exibirá o calendário de previsões com razões e níveis de confiança.
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

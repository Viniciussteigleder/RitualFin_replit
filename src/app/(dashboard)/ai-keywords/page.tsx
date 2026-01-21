
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AIKeywordsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights & Keywords</h1>
          <p className="text-muted-foreground">Sugestões e insights gerados por IA (em implementação).</p>
        </div>
        <Button asChild className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none shadow-lg">
          <Link href="/confirm">
            <Sparkles className="mr-2 h-4 w-4" /> Ir para Discovery de Regras
          </Link>
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Em breve
          </CardTitle>
          <CardDescription>
            Esta tela ainda não está conectada ao backend e não mostra números reais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Sem dados fictícios</Badge>
            <Badge variant="secondary">Sem percentuais inventados</Badge>
            <Badge variant="secondary">Sem keywords estáticas</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Para criar regras com base no seu próprio histórico (OPEN), use a fila de discovery em{" "}
            <Link href="/confirm" className="underline font-medium">
              /confirm
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export const revalidate = 3600; // Revalidate every hour

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function DashboardError({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Erro Inesperado</h2>
          <p className="text-muted-foreground">
            {message || "Ocorreu um erro inesperado. Por favor, recarregue a página."}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="flex-1"
            >
              Recarregar
            </Button>
            <Link href="/transactions" className="flex-1">
              <Button className="w-full">Ver Transações</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

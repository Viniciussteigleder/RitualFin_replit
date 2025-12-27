import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Play, Trash2 } from "lucide-react";

export default function RulesPage() {
  const mockRules = [
    { id: "r-1", name: "Mercado Geral", keyword: "REWE;LIDL;EDEKA", category: "Mercado", type: "Despesa" },
    { id: "r-2", name: "Streaming", keyword: "NETFLIX;SPOTIFY", category: "Lazer", type: "Despesa" },
    { id: "r-3", name: "Salário", keyword: "COMPANY PAYROLL", category: "Receitas", type: "Receita" },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Regras</h1>
            <p className="text-muted-foreground mt-1">Gerencie como suas transações são categorizadas automaticamente.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Regra
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suas Regras</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rule.keyword.split(";").map((k) => (
                          <Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

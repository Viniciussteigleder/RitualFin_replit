"use client";

import { AlertTriangle, BarChart3, FileText, ListChecks, Settings, Tag } from "lucide-react";

interface ImpactItem {
  screen: string;
  icon: React.ReactNode;
  impact: string;
  severity: "high" | "medium" | "low";
}

const impacts: ImpactItem[] = [
  {
    screen: "Transações",
    icon: <FileText className="h-4 w-4" />,
    impact: "Categoria exibida muda imediatamente",
    severity: "high"
  },
  {
    screen: "Categorias/Taxonomia",
    icon: <Tag className="h-4 w-4" />,
    impact: "Somatórios por categoria são recalculados",
    severity: "high"
  },
  {
    screen: "Relatórios",
    icon: <BarChart3 className="h-4 w-4" />,
    impact: "Gráficos e totais mudam",
    severity: "high"
  },
  {
    screen: "Diagnóstico",
    icon: <AlertTriangle className="h-4 w-4" />,
    impact: "Pode reduzir inconsistências detectadas",
    severity: "medium"
  },
  {
    screen: "Regras",
    icon: <Settings className="h-4 w-4" />,
    impact: "Pode gerar conflito com outras regras",
    severity: "medium"
  },
  {
    screen: "Sugestões IA",
    icon: <ListChecks className="h-4 w-4" />,
    impact: "Novas sugestões podem aparecer ou desaparecer",
    severity: "low"
  }
];

export function ImpactMatrix() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-amber-600 bg-amber-50 border-amber-200";
      case "low": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "high": return "Alto";
      case "medium": return "Médio";
      case "low": return "Baixo";
      default: return "";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
              Tela
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
              Impacto
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
              Severidade
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {impacts.map((item, idx) => (
            <tr key={idx} className="hover:bg-secondary/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="text-primary">{item.icon}</div>
                  <span className="text-sm font-medium text-foreground">{item.screen}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-muted-foreground">{item.impact}</p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(item.severity)}`}>
                  {getSeverityLabel(item.severity)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

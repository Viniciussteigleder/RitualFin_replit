import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Shield, Settings, Bell, Eye, Check, Globe, Palette, Database, Trash2, Download, Key, CreditCard, Mail, Moon, Sun, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TABS = [
  { id: "conta", label: "Conta", icon: User, description: "Perfil e informacoes pessoais" },
  { id: "preferencias", label: "Preferencias", icon: Settings, description: "Aparencia e comportamento" },
  { id: "integracoes", label: "Integracoes", icon: Database, description: "Conexoes com outros servicos" },
  { id: "seguranca", label: "Seguranca", icon: Shield, description: "Senha e autenticacao" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("conta");
  const [showCents, setShowCents] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState(true);
  const [lazyMode, setLazyMode] = useState(true);
  const [autoConfirmHighConfidence, setAutoConfirmHighConfidence] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configuracoes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua conta e personalize o RitualFin.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 shrink-0">
            <Card className="bg-white border-0 shadow-sm sticky top-6">
              <CardContent className="p-3">
                <nav className="space-y-1">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                          isActive 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        data-testid={`tab-${tab.id}`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            {activeTab === "conta" && (
              <>
                <Card className="bg-white border-0 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-emerald-100/50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl">Usuario RitualFin</h3>
                        <p className="text-sm text-muted-foreground">Membro desde 2024</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-primary text-white">Plano Starter</Badge>
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Lazy Mode
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Editar Foto</Button>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Nome</Label>
                        <Input defaultValue="Usuario" className="bg-muted/30 border-0" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                        <Input defaultValue="usuario@exemplo.com" className="bg-muted/30 border-0" disabled />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-primary hover:bg-primary/90">Salvar Alteracoes</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Download className="h-4 w-4 text-primary" />
                      Exportar Dados
                    </CardTitle>
                    <CardDescription>
                      Baixe todas as suas transacoes e configuracoes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar CSV
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "preferencias" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Regional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Idioma</Label>
                        <Select defaultValue="pt-br">
                          <SelectTrigger className="bg-muted/30 border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-br">Portugues (Brasil)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Moeda</Label>
                        <Select defaultValue="eur">
                          <SelectTrigger className="bg-muted/30 border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eur">Euro (EUR)</SelectItem>
                            <SelectItem value="brl">Real (BRL)</SelectItem>
                            <SelectItem value="usd">Dollar (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      Aparencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-amber-500" />}
                        <div>
                          <p className="font-medium">Tema Escuro</p>
                          <p className="text-sm text-muted-foreground">Ativar modo noturno</p>
                        </div>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium">Mostrar Centavos</p>
                        <p className="text-sm text-muted-foreground">Exibir valores decimais</p>
                      </div>
                      <Switch checked={showCents} onCheckedChange={setShowCents} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Lazy Mode
                    </CardTitle>
                    <CardDescription>
                      Configure como a IA ajuda na categorizacao.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <div>
                        <p className="font-medium">Lazy Mode Ativo</p>
                        <p className="text-sm text-muted-foreground">IA pre-analisa e sugere categorias</p>
                      </div>
                      <Switch checked={lazyMode} onCheckedChange={setLazyMode} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium">Auto-confirmar Alta Confianca</p>
                        <p className="text-sm text-muted-foreground">Aceitar automaticamente sugestoes com 80%+ de confianca</p>
                      </div>
                      <Switch checked={autoConfirmHighConfidence} onCheckedChange={setAutoConfirmHighConfidence} />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "integracoes" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Fontes de Dados
                  </CardTitle>
                  <CardDescription>
                    Conecte suas contas bancarias e cartoes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Miles & More</p>
                        <p className="text-sm text-muted-foreground">Importacao via CSV</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">American Express</p>
                        <p className="text-sm text-muted-foreground">Em breve</p>
                      </div>
                    </div>
                    <Badge variant="outline">v2</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">Sparkasse</p>
                        <p className="text-sm text-muted-foreground">Em breve</p>
                      </div>
                    </div>
                    <Badge variant="outline">v2</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "seguranca" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      Alterar Senha
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Senha Atual</Label>
                      <Input type="password" className="bg-muted/30 border-0" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Nova Senha</Label>
                        <Input type="password" className="bg-muted/30 border-0" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Confirmar</Label>
                        <Input type="password" className="bg-muted/30 border-0" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-primary hover:bg-primary/90">Atualizar Senha</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-rose-50 border-rose-200/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-rose-700 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Zona de Perigo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-rose-700">Excluir Conta</p>
                        <p className="text-sm text-rose-600/80">Todos os dados serao apagados permanentemente.</p>
                      </div>
                      <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100">
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

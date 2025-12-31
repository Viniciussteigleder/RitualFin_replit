import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { User, Shield, Settings, Bell, Eye, Check, Globe, Palette, Database, Trash2, Download, Key, CreditCard, Mail, Moon, Sun, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { id: "conta", label: "Conta", icon: User, description: "Perfil e informações pessoais" },
  { id: "preferencias", label: "Preferências", icon: Settings, description: "Aparência e comportamento" },
  { id: "dicionarios", label: "Dicionários", icon: Database, description: "Comerciantes e categorias" },
  { id: "integracoes", label: "Integrações", icon: Database, description: "Conexões com outros serviços" },
  { id: "seguranca", label: "Segurança", icon: Shield, description: "Senha e autenticação" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("conta");
  const [showCents, setShowCents] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState(true);
  const [lazyMode, setLazyMode] = useState(true);
  const { toast } = useToast();

  // Fetch settings from API
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Configuracoes salvas",
        description: "Suas preferencias foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Nao foi possivel salvar as configuracoes.",
        variant: "destructive",
      });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
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
                      Assistência IA
                    </CardTitle>
                    <CardDescription>
                      Configure como a IA ajuda na categorização.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <div>
                        <p className="font-medium">Categorização Automática</p>
                        <p className="text-sm text-muted-foreground">IA pré-analisa e sugere categorias</p>
                      </div>
                      <Switch checked={lazyMode} onCheckedChange={setLazyMode} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium">Auto-confirmar Alta Confiança</p>
                        <p className="text-sm text-muted-foreground">
                          Aceitar automaticamente sugestões com {settings?.confidenceThreshold || 80}%+ de confiança
                        </p>
                      </div>
                      <Switch
                        checked={settings?.autoConfirmHighConfidence || false}
                        onCheckedChange={(checked) => {
                          updateSettingsMutation.mutate({ autoConfirmHighConfidence: checked });
                        }}
                        disabled={isLoading || updateSettingsMutation.isPending}
                      />
                    </div>
                    {settings?.autoConfirmHighConfidence && (
                      <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Limite de Confianca</Label>
                          <span className="text-sm font-bold text-primary">{settings?.confidenceThreshold || 80}%</span>
                        </div>
                        <Slider
                          value={[settings?.confidenceThreshold || 80]}
                          onValueChange={(values) => {
                            updateSettingsMutation.mutate({ confidenceThreshold: values[0] });
                          }}
                          min={50}
                          max={100}
                          step={5}
                          disabled={isLoading || updateSettingsMutation.isPending}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Transacoes com confianca acima deste limite serao confirmadas automaticamente
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "dicionarios" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Dicionário de Comerciantes
                    </CardTitle>
                    <CardDescription>
                      Gerencie aliases padronizados para descrições de transações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">Centralize suas descrições</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            Crie aliases personalizados para comerciantes e transações recorrentes.
                            Mantenha suas finanças organizadas com descrições consistentes e fáceis de entender.
                          </p>
                          <Link href="/merchant-dictionary">
                            <Button className="bg-primary hover:bg-primary/90 gap-2">
                              Acessar Dicionário Completo
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <p className="font-medium text-sm">Importação em Massa</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Importe e exporte aliases via Excel para gerenciamento em lote
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <p className="font-medium text-sm">Geração Automática</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Cria automaticamente chaves únicas baseadas nas transações
                        </p>
                      </div>
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
                    Conecte suas contas bancárias e cartões via importação CSV.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Miles & More</p>
                        <p className="text-sm text-muted-foreground">Importação CSV ativa</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">American Express</p>
                        <p className="text-sm text-muted-foreground">Multi-cartoes suportado</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sparkasse</p>
                        <p className="text-sm text-muted-foreground">Conta bancaria IBAN</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">Ativo</Badge>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-xl border-2 border-dashed">
                    <p className="text-sm text-muted-foreground">
                      <strong>Proximas integracoes:</strong> Nubank, Revolut, N26, Wise
                    </p>
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

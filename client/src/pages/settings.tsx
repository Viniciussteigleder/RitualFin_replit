import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Shield, Settings, Bell, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TABS = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "seguranca", label: "Seguranca", icon: Shield },
  { id: "preferencias", label: "Preferencias", icon: Settings },
  { id: "notificacoes", label: "Notificacoes", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [showCents, setShowCents] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState(true);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Preferencias da Conta</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua conta, seguranca e personalizacao do RitualFin.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 shrink-0">
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 space-y-6">
            {activeTab === "perfil" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Joao Silva</h3>
                        <p className="text-sm text-muted-foreground">Membro desde Jan 2024</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white mt-2">
                          Plano Pro
                        </span>
                      </div>
                      <Button variant="outline">Ver Perfil Publico</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold">Informacoes Pessoais</CardTitle>
                    <span className="text-xs text-muted-foreground">Ultima atualizacao: 2 dias atras</span>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input defaultValue="Joao Silva" className="bg-muted/30" />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input defaultValue="joao.silva@exemplo.com" className="bg-muted/30" disabled />
                        <p className="text-xs text-muted-foreground">Para alterar seu e-mail, entre em contato com o suporte.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea placeholder="Escreva um pouco sobre voce..." className="bg-muted/30 min-h-[80px]" />
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-primary hover:bg-primary/90">Salvar Alteracoes</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "seguranca" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold">Seguranca e Senha</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <Input type="password" defaultValue="********" className="bg-muted/30" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nova Senha</Label>
                      <Input type="password" className="bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Nova Senha</Label>
                      <Input type="password" className="bg-muted/30" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/90">Alterar Senha</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "preferencias" && (
              <>
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Preferencias Regionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Idioma</Label>
                        <Select defaultValue="pt-br">
                          <SelectTrigger className="bg-muted/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-br">Portugues (Brasil)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Moeda Principal</Label>
                        <Select defaultValue="eur">
                          <SelectTrigger className="bg-muted/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eur">Euro (EUR)</SelectItem>
                            <SelectItem value="brl">Real (BRL)</SelectItem>
                            <SelectItem value="usd">Dollar (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">A moeda esta travada no plano atual.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Visualizacao & Dados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Mostrar Centavos</p>
                        <p className="text-sm text-muted-foreground">Exibir valores decimais nos dashboards.</p>
                      </div>
                      <Switch checked={showCents} onCheckedChange={setShowCents} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tema Escuro</p>
                        <p className="text-sm text-muted-foreground">Alternar para o modo noturno automaticamente.</p>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Relatorios Mensais</p>
                        <p className="text-sm text-muted-foreground">Receber resumo financeiro por e-mail.</p>
                      </div>
                      <Switch checked={monthlyReports} onCheckedChange={setMonthlyReports} />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "notificacoes" && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Notificacoes</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Configuracoes de notificacao em breve.</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-rose-50 border-rose-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-rose-700">Zona de Perigo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-rose-600 mb-4">
                  Acoes irreversiveis relacionadas a sua conta e dados.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-rose-700">Excluir Conta</p>
                    <p className="text-sm text-rose-600">Todos os seus dados serao apagados permanentemente.</p>
                  </div>
                  <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100">
                    Excluir minha conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

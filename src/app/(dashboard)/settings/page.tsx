import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Globe, Database, Shield, AlertTriangle, Settings2, Bell, Heart, Link2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32 px-1 font-sans">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight font-display mb-2">Configurações</h1>
          <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">Gerencie suas preferências de conta, notificações e segurança do sistema.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto pb-4 -mx-1 px-1">
          <TabsList className="inline-flex bg-secondary/50 p-1.5 h-auto rounded-[2rem] gap-2 border border-border min-w-full sm:min-w-0">
            <TabsTrigger value="profile" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xl text-[11px] font-black uppercase tracking-widest transition-all">Perfil</TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xl text-[11px] font-black uppercase tracking-widest transition-all">Preferências</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xl text-[11px] font-black uppercase tracking-widest transition-all">Notificações</TabsTrigger>
            <TabsTrigger value="data" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xl text-[11px] font-black uppercase tracking-widest transition-all">Dados</TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xl text-[11px] font-black uppercase tracking-widest transition-all">Segurança</TabsTrigger>
            <TabsTrigger value="danger" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xl text-[11px] font-black uppercase tracking-widest transition-all text-destructive data-[state=active]:text-destructive">Perigo</TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-10 max-w-3xl">
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-card border border-border rounded-2xl p-10 shadow-sm overflow-hidden relative group">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-6">
                   <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground/30 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <User className="h-10 w-10" />
                   </div>
                   <div className="flex flex-col gap-2">
                      <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Foto de Perfil</h3>
                      <div className="flex gap-3">
                         <Button size="sm" variant="secondary" className="rounded-xl font-bold bg-secondary/80 hover:bg-secondary">Alterar Foto</Button>
                         <Button size="sm" variant="ghost" className="rounded-xl font-bold text-muted-foreground hover:text-destructive">Remover</Button>
                      </div>
                   </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nome Completo</Label>
                    <Input id="name" placeholder="Seu nome aqui" className="h-14 bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">E-mail</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" className="h-14 bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all" />
                  </div>
                  <Button className="w-full h-14 bg-foreground text-background font-bold rounded-2xl mt-4 shadow-xl shadow-foreground/5 hover:opacity-95 transition-all">Salvar Alterações</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-card border border-border rounded-2xl p-10 shadow-sm space-y-12">
               
               {/* Section: Locality */}
               <section>
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Região e Formato</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="language" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Idioma</Label>
                    <Select defaultValue="pt-PT">
                      <SelectTrigger id="language" className="h-14 bg-secondary/30 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="currency" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Moeda Padrão</Label>
                    <Select defaultValue="EUR">
                      <SelectTrigger id="currency" className="h-14 bg-secondary/30 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
               </section>

               <Separator className="bg-border/50" />

               {/* Section: AI Automation */}
               <section>
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Automação IA</h3>
                      <p className="text-sm font-medium text-muted-foreground">Otimize a velocidade de classificação.</p>
                    </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-secondary/20 border border-border/50">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">Auto-Aprovação</h4>
                      <p className="text-xs font-medium text-muted-foreground italic">Confirmar automaticamente quando confiança {'>'} 90%</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-3">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Limiar de Confiança</Label>
                      <Select defaultValue="90">
                        <SelectTrigger className="h-14 bg-secondary/30 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="95">95% (Máximo rigor)</SelectItem>
                          <SelectItem value="90">90% (Padrão sugerido)</SelectItem>
                          <SelectItem value="80">80% (Mais agilidade)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
               </section>

               <Separator className="bg-border/50" />

               {/* Section: UI */}
               <section>
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Settings2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Interface</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3 max-w-sm">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Vista Padrão do Extrato</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger className="h-14 bg-secondary/30 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="normal">Normal (Confortável)</SelectItem>
                        <SelectItem value="compact">Compacta (Alta densidade)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
               </section>

               <Button className="w-full h-16 bg-foreground text-background font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-foreground/5 transform active:scale-[0.99] transition-all">Salvar Todas as Preferências</Button>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
                     <Database className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Gestão de Dados</h3>
               </div>

               <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-base">Exportar Tudo</h4>
                    <p className="text-sm font-medium text-muted-foreground max-w-md">
                      Baixe todas as suas transações, orçamentos e metas em formato CSV ou JSON.
                    </p>
                  </div>
                  <Button variant="secondary" className="h-12 px-6 rounded-2xl font-bold bg-secondary/80 hover:bg-secondary">Exportar CSV</Button>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-base">Sincronização Externa</h4>
                    <p className="text-sm font-medium text-muted-foreground max-w-md">
                      Mantenha seus backups automáticos sincronizados com serviços na nuvem.
                    </p>
                  </div>
                  <Button variant="secondary" className="h-12 px-6 rounded-2xl font-bold bg-secondary/80 hover:bg-secondary flex gap-2">
                     <Link2 className="h-4 w-4" />
                     Conectar Drive
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                     <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-destructive font-display tracking-tight">Zona de Risco</h3>
               </div>

               <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-destructive">Excluir Todas as Transações</h4>
                  <p className="text-sm font-medium text-destructive/80 leading-relaxed max-w-xl">
                    Esta ação apagará permanentemente todos os seus lançamentos e não poderá ser desfeita. Seus orçamentos e contas permanecerão.
                  </p>
                  <div className="space-y-3 mt-6">
                    <Label htmlFor="confirmDelete" className="text-[10px] font-black text-destructive uppercase tracking-widest ml-1">
                      Digite "EXCLUIR" para confirmar
                    </Label>
                    <Input
                      id="confirmDelete"
                      placeholder="EXCLUIR"
                      className="h-14 bg-destructive/5 border-destructive/20 focus:bg-white dark:focus:bg-card focus:border-destructive/40 focus:ring-4 focus:ring-destructive/5 rounded-2xl transition-all font-bold placeholder:text-destructive/30"
                    />
                  </div>
                  <Button variant="destructive" className="w-full h-14 bg-destructive text-white font-bold rounded-2xl shadow-xl shadow-destructive/10 mt-4">
                    Confirmar Exclusão de Dados
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

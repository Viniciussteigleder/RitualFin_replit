import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
// removed Select imports
import { User, Globe, Database, Shield, AlertTriangle, Settings2, Bell, Heart, Link2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreferencesForm } from "@/components/settings/preferences-form";

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
             <PreferencesForm />
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

/**
 * Notifications Page
 *
 * Timeline of system notifications with filtering and mark-as-read functionality.
 */

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { Link } from "wouter";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  icon?: React.ComponentType<any>;
}

const resolveNotificationAction = (notification: Notification) => {
  const title = notification.title.toLowerCase();
  if (title.includes("upload")) {
    return { label: "Ver uploads", href: "/uploads" };
  }
  if (title.includes("meta")) {
    return { label: "Ver metas", href: "/goals" };
  }
  if (title.includes("ritual")) {
    return { label: "Ver rituais", href: "/rituals" };
  }
  return null;
};

const NOTIFICATION_COLORS = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    dot: "bg-emerald-500"
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    dot: "bg-amber-500"
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    dot: "bg-blue-500"
  },
  error: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "text-rose-600",
    dot: "bg-rose-500"
  }
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => notificationsApi.markRead(id, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = () => {
    const unread = notifications.filter((n) => !n.isRead);
    Promise.all(unread.map((n) => markReadMutation.mutateAsync({ id: n.id, isRead: true })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "important") return n.type === "warning" || n.type === "error";
    return true;
  });

  const typeCounts = useMemo(() => {
    return {
      important: notifications.filter((n) => n.type === "warning" || n.type === "error").length,
    };
  }, [notifications]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Notificações</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary/10 text-primary border-0">
                  {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Central de mensagens e alertas do sistema
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold mt-1">{notifications.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">notificações</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Não lidas</p>
                  <p className="text-3xl font-bold mt-1">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">pendentes</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Importantes</p>
                  <p className="text-3xl font-bold mt-1">
                    {typeCounts.important}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">alertas</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="bg-white border-0 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6 pt-6">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="all" className="flex-1 md:flex-none">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1 md:flex-none">
                  Não lidas
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-primary/10 text-primary border-0 text-xs px-1.5 py-0">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="important" className="flex-1 md:flex-none">
                  Importantes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="p-6">
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Carregando notificações...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">Nenhuma notificação</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    {activeTab === "unread"
                      ? "Você está em dia! Não há notificações não lidas."
                      : "Não há notificações para exibir neste momento."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const colors = NOTIFICATION_COLORS[notification.type];
                    const Icon = notification.icon || Bell;
                    const action = resolveNotificationAction(notification);

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 rounded-lg border transition-all cursor-pointer",
                          colors.bg,
                          colors.border,
                          !notification.isRead && "bg-primary/[0.02]"
                        )}
                        onClick={() => {
                          if (!notification.isRead) {
                            markReadMutation.mutate({ id: notification.id, isRead: true });
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg)}>
                            <Icon className={cn("h-5 w-5", colors.icon)} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3
                                className={cn(
                                  "font-semibold",
                                  !notification.isRead && "text-foreground"
                                )}
                              >
                                {notification.title}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(notification.createdAt), "HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(notification.createdAt), "dd 'de' MMMM", { locale: ptBR })}
                              </span>
                              <div className="flex items-center gap-2">
                                {action && (
                                  <Link href={action.href}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {action.label}
                                    </Button>
                                  </Link>
                                )}
                                {!notification.isRead && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markReadMutation.mutate({ id: notification.id, isRead: true });
                                    }}
                                  >
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    Marcar como lida
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-rose-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMutation.mutate(notification.id);
                                  }}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}

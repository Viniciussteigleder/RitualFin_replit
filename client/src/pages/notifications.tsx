/**
 * Notifications Page
 *
 * Timeline of system notifications with filtering and mark-as-read functionality.
 * Note: This is a UI shell - backend integration pending.
 */

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCheck,
  Upload,
  AlertTriangle,
  Calendar,
  CreditCard,
  Target,
  Sparkles,
  ChevronRight,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { notificationsCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  icon?: React.ComponentType<any>;
}

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
  const locale = useLocale();
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long" });
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

  const buildMockNotifications = (): Notification[] => [
    {
      id: "1",
      title: translate(locale, notificationsCopy.mockUploadTitle),
      message: formatMessage(translate(locale, notificationsCopy.mockUploadMessage), {
        count: 426,
        source: "Miles & More"
      }),
      type: "success",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
      actionUrl: "/transactions",
      icon: Upload
    },
    {
      id: "2",
      title: translate(locale, notificationsCopy.mockBudgetTitle),
      message: formatMessage(translate(locale, notificationsCopy.mockBudgetMessage), {
        spent: currencyFormatter.format(250),
        budget: currencyFormatter.format(200),
        category: "Lazer"
      }),
      type: "warning",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      actionUrl: "/dashboard",
      icon: AlertTriangle
    },
    {
      id: "3",
      title: translate(locale, notificationsCopy.mockWeeklyTitle),
      message: translate(locale, notificationsCopy.mockWeeklyMessage),
      type: "info",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      actionUrl: "/rituals",
      icon: Calendar
    },
    {
      id: "4",
      title: translate(locale, notificationsCopy.mockConfirmTitle),
      message: formatMessage(translate(locale, notificationsCopy.mockConfirmMessage), { count: 23 }),
      type: "info",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      actionUrl: "/confirm",
      icon: CheckCheck
    },
    {
      id: "5",
      title: translate(locale, notificationsCopy.mockGoalTitle),
      message: formatMessage(translate(locale, notificationsCopy.mockGoalMessage), {
        amount: currencyFormatter.format(500)
      }),
      type: "success",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      actionUrl: "/goals",
      icon: Target
    },
    {
      id: "6",
      title: translate(locale, notificationsCopy.mockCardTitle),
      message: formatMessage(translate(locale, notificationsCopy.mockCardMessage), {
        card: "American Express",
        days: 5,
        amount: currencyFormatter.format(1234.56)
      }),
      type: "warning",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      actionUrl: "/accounts",
      icon: CreditCard
    },
    {
      id: "7",
      title: translate(locale, notificationsCopy.mockAiTitle),
      message: formatMessage(translate(locale, notificationsCopy.mockAiMessage), { count: 15 }),
      type: "info",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      actionUrl: "/ai-keywords",
      icon: Sparkles
    }
  ];

  const [notifications, setNotifications] = useState<Notification[]>(() => buildMockNotifications());
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    setNotifications(prev => {
      const base = buildMockNotifications();
      const readMap = new Map(prev.map(n => [n.id, n.isRead]));
      return base.map(notification => ({
        ...notification,
        isRead: readMap.get(notification.id) ?? notification.isRead
      }));
    });
  }, [locale]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "important") return n.type === "warning" || n.type === "error";
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{translate(locale, notificationsCopy.title)}</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary/10 text-primary border-0">
                  {unreadCount} {unreadCount === 1
                    ? translate(locale, notificationsCopy.newSingle)
                    : translate(locale, notificationsCopy.newPlural)}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              {translate(locale, notificationsCopy.subtitle)}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              {translate(locale, notificationsCopy.markAllRead)}
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate(locale, notificationsCopy.statsTotal)}</p>
                  <p className="text-3xl font-bold mt-1">{notifications.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{translate(locale, notificationsCopy.statsNotifications)}</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate(locale, notificationsCopy.statsUnread)}</p>
                  <p className="text-3xl font-bold mt-1">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{translate(locale, notificationsCopy.statsPending)}</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate(locale, notificationsCopy.statsImportant)}</p>
                  <p className="text-3xl font-bold mt-1">
                    {notifications.filter(n => n.type === "warning" || n.type === "error").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{translate(locale, notificationsCopy.statsAlerts)}</p>
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
                  {translate(locale, notificationsCopy.tabAll)}
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1 md:flex-none">
                  {translate(locale, notificationsCopy.tabUnread)}
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-primary/10 text-primary border-0 text-xs px-1.5 py-0">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="important" className="flex-1 md:flex-none">
                  {translate(locale, notificationsCopy.tabImportant)}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              <CardContent className="p-0">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{translate(locale, notificationsCopy.emptyTitle)}</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {activeTab === "unread"
                        ? translate(locale, notificationsCopy.emptyUnread)
                        : translate(locale, notificationsCopy.emptyAll)}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => {
                      const colors = NOTIFICATION_COLORS[notification.type];
                      const Icon = notification.icon || Bell;

                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-5 transition-colors hover:bg-muted/30 cursor-pointer relative",
                            !notification.isRead && "bg-primary/[0.02]"
                          )}
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsRead(notification.id);
                            }
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl;
                            }
                          }}
                        >
                          {/* Unread indicator */}
                          {!notification.isRead && (
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1", colors.dot)} />
                          )}

                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                colors.bg,
                                "border",
                                colors.border
                              )}
                            >
                              <Icon className={cn("h-5 w-5", colors.icon)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className={cn(
                                  "font-semibold text-sm",
                                  !notification.isRead && "text-foreground"
                                )}>
                                  {notification.title}
                                </h3>
                                <time className="text-xs text-muted-foreground flex-shrink-0">
                                  {timeFormatter.format(notification.createdAt)}
                                </time>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3">
                                <time className="text-xs text-muted-foreground">
                                  {dateFormatter.format(notification.createdAt)}
                                </time>
                                {notification.actionUrl && (
                                  <>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <button
                                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = notification.actionUrl!;
                                      }}
                                    >
                                      {translate(locale, notificationsCopy.viewDetails)}
                                      <ChevronRight className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Mark as read button */}
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="flex-shrink-0 h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Backend Integration Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-blue-900 mb-1">
                {translate(locale, notificationsCopy.devTitle)}
              </p>
              <p className="text-xs text-blue-700">
                {translate(locale, notificationsCopy.devBody)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

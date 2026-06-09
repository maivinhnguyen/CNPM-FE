"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LogOut,
  Menu,
  ParkingCircle,
  LayoutDashboard,
  Car,
  History,
  ScanLine,
  ClipboardList,
  BarChart3,
  Users,
  FileText,
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole, AppNotification } from "@/types";
import { useState } from "react";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface MobileNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navByRole: Record<UserRole, MobileNavItem[]> = {
  student: [
    { title: "Dashboard", href: "/student", icon: LayoutDashboard },
    { title: "My Vehicles", href: "/student/vehicles", icon: Car },
    { title: "Parking History", href: "/student/history", icon: History },
  ],
  staff: [
    { title: "Check In/Out", href: "/staff", icon: ScanLine },
    { title: "Activity Log", href: "/staff/logs", icon: ClipboardList },
  ],
  admin: [
    { title: "Dashboard", href: "/admin", icon: BarChart3 },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Vehicles", href: "/admin/vehicles", icon: Car },
    { title: "System Logs", href: "/admin/logs", icon: FileText },
  ],
};

function NotificationDropdown({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationService.getMyNotifications(userId),
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "info": return <Info className="h-4 w-4 text-blue-500" />;
      case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative h-9 w-9" />
        }
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Thông báo</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80 flex items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead.mutate();
              }}
              disabled={markAllAsRead.isPending}>
              <CheckCheck className="h-3 w-3" /> Đánh dấu đã đọc
            </Button>
          )}
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                  className={`flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b border-border last:border-0 ${
                    !n.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-medium">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                  {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const role: UserRole = user?.role === "faculty" ? "admin" : (user?.role ?? "student");
  const items = navByRole[role] ?? [];
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex items-center h-14 px-4 lg:px-6 border-b border-border bg-background/80 backdrop-blur-md">
      {/* Mobile menu */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden mr-2" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
              <ParkingCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">ParkSmart</span>
              <span className="text-[11px] text-muted-foreground">
                Parking Management
              </span>
            </div>
          </div>
          <div className="px-3 py-2">
            <Badge variant="secondary" className="text-[11px]">
              {ROLE_LABELS[role]}
            </Badge>
          </div>
          <nav className="px-3 py-2 space-y-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== `/${role}` && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Page title area - pushed to right on desktop since sidebar has logo */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {user && <NotificationDropdown userId={user.id} />}
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              />
            }
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

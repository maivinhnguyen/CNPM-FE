"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";
import {
  LayoutDashboard,
  Car,
  History,
  ScanLine,
  ClipboardList,
  BarChart3,
  Users,
  FileText,
  ChevronLeft,
  ParkingCircle,
  LogOut,
  CreditCard,
  CalendarCheck,
  Wallet,
  CheckSquare,
  CalendarDays,
  Search,
  AlertTriangle,
  CalendarClock,
  Cpu,
  Building2,
  Receipt,
  LifeBuoy,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { ROLE_LABELS } from "@/lib/constants";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cardService } from "@/services/card.service";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navByRole: Record<UserRole, NavItem[]> = {
  student: [
    { title: "Tổng quan", href: "/student", icon: LayoutDashboard },
    { title: "Xe của tôi", href: "/student/vehicles", icon: Car },
    { title: "Lịch sử gửi xe", href: "/student/history", icon: History },
    { title: "Đăng Ký Thẻ", href: "/student/card", icon: CreditCard },
    { title: "Vé Xe Tháng", href: "/student/monthly-pass", icon: CalendarCheck },
    { title: "Ví Tiền", href: "/student/wallet", icon: Wallet },
    { title: "Đăng Ký Khách", href: "/student/visitor", icon: UserPlus },
    { title: "Hỗ Trợ", href: "/student/support", icon: LifeBuoy },
  ],
  staff: [
    { title: "Vào/Ra", href: "/staff", icon: ScanLine },
    { title: "Tra Cứu Xe", href: "/staff/vehicle-lookup", icon: Search },
    { title: "Báo Cáo Sự Cố", href: "/staff/incidents", icon: AlertTriangle },
    { title: "Ca Làm Của Tôi", href: "/staff/my-shift", icon: CalendarClock },
    { title: "Thiết Bị", href: "/staff/devices", icon: Cpu },
    { title: "Nhật ký hoạt động", href: "/staff/logs", icon: ClipboardList },
  ],
  admin: [
    { title: "Tổng quan", href: "/admin", icon: BarChart3 },
    { title: "Người dùng", href: "/admin/users", icon: Users },
    { title: "Phương tiện", href: "/admin/vehicles", icon: Car },
    { title: "Nhà Xe", href: "/admin/parking-lots", icon: Building2 },
    { title: "Duyệt Thẻ", href: "/admin/card-requests", icon: CheckSquare },
    { title: "Phân Ca", href: "/admin/shifts", icon: CalendarDays },
    { title: "Sự Cố", href: "/admin/incidents", icon: AlertTriangle },
    { title: "Thiết Bị", href: "/admin/devices", icon: Cpu },
    { title: "Giao Dịch", href: "/admin/transactions", icon: Receipt },
    { title: "Nhật ký hệ thống", href: "/admin/logs", icon: FileText },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role === "faculty" ? "admin" : (user?.role ?? "student");
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Fetch pending card request count for admin badge
  const { data: pendingCount } = useQuery({
    queryKey: ["pending-card-count"],
    queryFn: cardService.getPendingCount,
    enabled: role === "admin",
    refetchInterval: 30000,
  });

  const items: NavItem[] = (navByRole[role] ?? []).map((item) => {
    if (item.href === "/admin/card-requests" && pendingCount) {
      return { ...item, badge: pendingCount };
    }
    return item;
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground shrink-0">
          <ParkingCircle className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm tracking-tight">
              ParkSmart
            </span>
            <span className="text-xs text-muted-foreground">
              Hệ thống quản lý bãi xe
            </span>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <Badge variant="secondary" className="text-xs font-medium">
            {ROLE_LABELS[role]}
          </Badge>
        </div>
      )}

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border-l-3 border-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-3 border-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-sidebar-primary" : ""
                )}
              />
              {!collapsed && (
                <span className="flex-1">{item.title}</span>
              )}
              {!collapsed && item.badge && item.badge > 0 && (
                <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + actions footer */}
      <div className={cn("border-t border-border p-3 space-y-2")}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-auto py-2 gap-3",
                  collapsed ? "justify-center px-0" : "justify-start px-2"
                )}
              />
            }
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align={collapsed ? "center" : "end"} className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className={cn("flex", collapsed ? "justify-center" : "justify-between items-center")}>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5 text-xs", collapsed && "hidden")}
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className="h-4 w-4" />
            Thu gọn
          </Button>
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

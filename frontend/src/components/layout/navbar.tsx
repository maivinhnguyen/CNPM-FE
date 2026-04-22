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
import type { UserRole } from "@/types";
import { useState } from "react";

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

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const role = user?.role ?? "student";
  const items = navByRole[role];
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
      <div className="flex items-center gap-2">
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

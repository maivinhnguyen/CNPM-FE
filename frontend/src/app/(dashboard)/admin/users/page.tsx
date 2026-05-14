"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_LABELS } from "@/lib/constants";
import { mockUsers, delay } from "@/mock/data";
import { format } from "date-fns";
import { Users, Search, ShieldCheck, GraduationCap, Shield } from "lucide-react";
import type { UserRole } from "@/types";

async function getUsers() {
  await delay(500);
  return mockUsers;
}

const ROLE_STYLES: Record<UserRole, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  admin:   { color: "bg-violet-500/15 text-violet-700 dark:text-violet-400", icon: ShieldCheck },
  staff:   { color: "bg-blue-500/15 text-blue-700 dark:text-blue-400",       icon: Shield },
  student: { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: GraduationCap },
};

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: getUsers,
  });

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  const filtered = (users ?? []).filter((u) => {
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchSearch =
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  // Stats
  const adminCount   = (users ?? []).filter((u) => u.role === "admin").length;
  const staffCount   = (users ?? []).filter((u) => u.role === "staff").length;
  const studentCount = (users ?? []).filter((u) => u.role === "student").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Người Dùng"
        description="Xem và quản lý tất cả tài khoản trong hệ thống"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Quản trị viên", value: adminCount,   color: "text-violet-600", bg: "bg-violet-500/10", icon: ShieldCheck },
          { label: "Bảo vệ",        value: staffCount,   color: "text-blue-600",   bg: "bg-blue-500/10",   icon: Shield },
          { label: "Sinh viên",     value: studentCount, color: "text-emerald-600", bg: "bg-emerald-500/10", icon: GraduationCap },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label} className="card-glow border-0">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm tên, email, MSSV..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {(["all", "admin", "staff", "student"] as const).map((r) => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterRole === r ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}>
              {r === "all" ? "Tất cả" : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u, idx) => {
          const initials = u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
          const { color: roleColor, icon: RoleIcon } = ROLE_STYLES[u.role];
          const avatarGradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];

          return (
            <Card key={u.id} className="card-glow border-0 hover:shadow-lg transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br ${avatarGradient} text-white font-bold text-sm shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${roleColor} text-xs flex items-center gap-1`}>
                        <RoleIcon className="h-3 w-3" />
                        {ROLE_LABELS[u.role]}
                      </Badge>
                      {u.studentId && (
                        <span className="text-xs font-mono text-muted-foreground">{u.studentId}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Tham gia {format(new Date(u.createdAt), "dd/MM/yyyy")}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" title="Đang hoạt động" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-12 gap-3">
            <Users className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

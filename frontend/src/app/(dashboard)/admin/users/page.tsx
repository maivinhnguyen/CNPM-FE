"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { Users, Search, ShieldCheck, GraduationCap, Shield, Plus, Loader2 } from "lucide-react";
import type { UserRole, Member } from "@/types";
import { userService } from "@/services/user.service";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const ROLE_STYLES: Record<UserRole, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  admin:   { color: "bg-violet-500/15 text-violet-700 dark:text-violet-400", icon: ShieldCheck },
  staff:   { color: "bg-blue-500/15 text-blue-700 dark:text-blue-400",       icon: Shield },
  student: { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: GraduationCap },
};

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  pending_approval: { label: "Chờ duyệt", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  active:           { label: "Hoạt động", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  rejected:         { label: "Từ chối",   color: "bg-red-500/15 text-red-700 dark:text-red-400" },
  suspended:        { label: "Bị khóa",   color: "bg-slate-500/15 text-slate-700 dark:text-slate-400" },
};

function getUiRole(role: string): UserRole {
  if (role === "faculty") return "admin";
  if (role in ROLE_STYLES) return role as UserRole;
  return "student";
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
];

const userFormSchema = z
  .object({
    name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    role: z.enum(["student", "staff", "admin"] as const),
    studentId: z.string().optional(),
    phone: z.string().optional(),
  })
  .refine((data) => {
    if (data.role === "student" && !data.studentId) {
      return false;
    }
    return true;
  }, {
    message: "Mã sinh viên là bắt buộc đối với sinh viên",
    path: ["studentId"],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: rawUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAllUsers,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["members"],
    queryFn: () => apiClient.get<Member[] | null>(ENDPOINTS.MEMBERS.LIST).then((res) => res ?? []),
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      studentId: "",
      phone: "",
    },
  });

  const watchRole = form.watch("role");

  const createUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      let memberId: string | null = null;

      // 1. Create member if role is student (or studentId is provided)
      if (values.role === "student" && values.studentId) {
        const member = await apiClient.post<Member>(ENDPOINTS.MEMBERS.LIST, {
          studentId: values.studentId,
          fullName: values.name,
          phone: values.phone || null,
        });
        memberId = member.id;
      }

      // 2. Create user (directly active since admin created it)
      return userService.createUser({
        email: values.email,
        password: values.password,
        role: values.role,
        memberId,
        status: "active",
      });
    },
    onSuccess: () => {
      toast.success("Tạo người dùng thành công!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo người dùng thất bại!");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      userService.updateUserStatus(id, status),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái người dùng!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật trạng thái thất bại!");
    },
  });

  const isLoading = usersLoading || membersLoading;

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  // Merge User and Member info
  const users = rawUsers.map((u) => {
    const member = u.memberId ? members.find((m) => m.id === u.memberId) : null;
    return {
      ...u,
      name: member ? member.fullName : u.email.split("@")[0],
      studentId: member ? member.studentId : undefined,
    };
  });

  const filtered = users.filter((u) => {
    const matchRole = filterRole === "all" || getUiRole(u.role) === filterRole;
    const matchSearch =
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  // Stats
  const adminCount   = users.filter((u) => getUiRole(u.role) === "admin").length;
  const staffCount   = users.filter((u) => getUiRole(u.role) === "staff").length;
  const studentCount = users.filter((u) => getUiRole(u.role) === "student").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Người Dùng"
        description="Xem và quản lý tất cả tài khoản trong hệ thống"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo tài khoản mới</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((v) => createUserMutation.mutate(v))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyen Van An" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@domain.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input placeholder="Tối thiểu 8 ký tự" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">Sinh viên</SelectItem>
                            <SelectItem value="staff">Bảo vệ</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchRole === "student" && (
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã sinh viên</FormLabel>
                          <FormControl>
                            <Input placeholder="SV20260001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại (Tùy chọn)</FormLabel>
                        <FormControl>
                          <Input placeholder="0987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      "Tạo tài khoản"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
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
          const uiRole = getUiRole(u.role);
          const { color: roleColor, icon: RoleIcon } = ROLE_STYLES[uiRole];
          const avatarGradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const statusVal = u.status || "pending_approval";
          const statusStyle = STATUS_STYLES[statusVal] || STATUS_STYLES.pending_approval;

          return (
            <Card key={u.id} className="card-glow border-0 hover:shadow-lg transition-shadow flex flex-col justify-between">
              <CardContent className="pt-5 pb-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br ${avatarGradient} text-white font-bold text-sm shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <Badge className={`${roleColor} text-[10px] flex items-center gap-1 h-5 px-1.5`}>
                          <RoleIcon className="h-3 w-3" />
                          {ROLE_LABELS[uiRole]}
                        </Badge>
                        {u.studentId && (
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded">{u.studentId}</span>
                        )}
                        <Badge className={`${statusStyle.color} text-[10px] h-5 px-1.5`}>
                          {statusStyle.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Tham gia {format(new Date(u.createdAt), "dd/MM/yyyy")}
                    </span>
                  </div>

                  {statusVal === "pending_approval" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: u.id, status: "active" })}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-destructive hover:bg-destructive/5 text-xs h-8 border-destructive/20"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: u.id, status: "rejected" })}
                      >
                        Từ chối
                      </Button>
                    </div>
                  )}
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

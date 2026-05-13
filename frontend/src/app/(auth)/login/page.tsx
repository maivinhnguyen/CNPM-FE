"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  ParkingCircle, Loader2, Mail, Lock, ArrowRight, Eye, EyeOff,
  GraduationCap, ShieldCheck, UserCog,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
type LoginValues = z.infer<typeof loginSchema>;

const demoAccounts = [
  { email: "student@university.edu.vn", label: "Sinh viên", icon: GraduationCap },
  { email: "guard@parksmart.vn",         label: "Bảo vệ",    icon: ShieldCheck },
  { email: "admin@parksmart.vn",         label: "Admin",      icon: UserCog },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    try {
      const res = await authService.login(values);
      setAuth(res.user, res.token);
      toast.success(`Chào mừng, ${res.user.name}!`);
      router.push(`/${res.user.role}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-500">
          <ParkingCircle className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900 tracking-tight">ParkSmart</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Đăng nhập</h2>
        <p className="text-sm text-slate-500">Chào mừng trở lại! Vui lòng nhập thông tin.</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="you@university.edu.vn"
                    type="email"
                    autoComplete="email"
                    className="pl-10 h-11 rounded-lg border border-slate-300 !bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-400 shadow-sm"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )} />

          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="pl-10 pr-10 h-11 rounded-lg border border-slate-300 !bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-400 shadow-sm"
                    {...field}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )} />

          <Button type="submit" disabled={isLoading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
            {isLoading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang đăng nhập...</>
              : <>Đăng nhập <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
      </Form>

      {/* Register link */}
      <p className="text-sm text-center text-slate-500">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
          Đăng ký ngay
        </Link>
      </p>

      {/* Demo accounts */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium px-1">Tài khoản demo</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {demoAccounts.map(({ email, label, icon: Icon }) => (
            <button key={email} type="button"
              onClick={() => { form.setValue("email", email); form.setValue("password", "demo123"); }}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all text-center group">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 transition-colors">
                <Icon className="h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">{label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-slate-400">Click để điền tự động — mật khẩu bất kỳ</p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  ParkingCircle, Loader2, User, Mail, Lock, IdCard,
  ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck, UserCog,
} from "lucide-react";
import type { UserRole } from "@/types";

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
    role: z.enum(["student", "staff", "admin"] as const),
    studentId: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const roles = [
  { value: "student", label: "Sinh viên",  icon: GraduationCap },
  { value: "staff",   label: "Bảo vệ",     icon: ShieldCheck },
  { value: "admin",   label: "Admin",       icon: UserCog },
] as const;

const inputCls =
  "h-11 rounded-lg border border-slate-300 !bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-400 shadow-sm";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "student", studentId: "" },
  });

  const watchRole = form.watch("role");

  const onSubmit = async (values: RegisterValues) => {
    setIsLoading(true);
    try {
      await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role as UserRole,
        studentId: values.studentId,
      });
      toast.success("Đăng ký thành công! Vui lòng chờ admin phê duyệt tài khoản.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-500">
          <ParkingCircle className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900 tracking-tight">ParkSmart</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Tạo tài khoản</h2>
        <p className="text-sm text-slate-500">Điền thông tin để bắt đầu sử dụng hệ thống.</p>
      </div>

      {/* Role selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Loại tài khoản</p>
        <div className="grid grid-cols-3 gap-2">
          {roles.map(({ value, label, icon: Icon }) => {
            const active = watchRole === value;
            return (
              <button key={value} type="button"
                onClick={() => form.setValue("role", value)}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all ${
                  active
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                }`}>
                <Icon className={`h-5 w-5 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span className={`text-xs font-semibold ${active ? "text-emerald-700" : "text-slate-500"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Họ và tên</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Nguyen Van An" className={`pl-10 ${inputCls}`} {...field} />
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )} />

          {/* Email */}
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="you@university.edu.vn" type="email" className={`pl-10 ${inputCls}`} {...field} />
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )} />

          {/* Student ID */}
          {watchRole === "student" && (
            <FormField control={form.control} name="studentId" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">Mã sinh viên</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="SV20210001" className={`pl-10 ${inputCls}`} {...field} />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )} />
          )}

          {/* Password */}
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Tối thiểu 6 ký tự" type={showPass ? "text" : "password"} className={`pl-10 pr-10 ${inputCls}`} {...field} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )} />

          {/* Confirm Password */}
          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Nhập lại mật khẩu" type={showConfirm ? "text" : "password"} className={`pl-10 pr-10 ${inputCls}`} {...field} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )} />

          <Button type="submit" disabled={isLoading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
            {isLoading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo tài khoản...</>
              : <>Tạo tài khoản <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
      </Form>

      {/* Login link */}
      <p className="text-sm text-center text-slate-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

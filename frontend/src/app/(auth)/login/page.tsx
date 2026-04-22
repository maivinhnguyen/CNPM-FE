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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ParkingCircle, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(values);
      setAuth(response.user, response.token);
      toast.success(`Welcome back, ${response.user.name}!`);
      router.push(`/${response.user.role}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
          <ParkingCircle className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold">ParkSmart</span>
      </div>

      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@university.edu.vn"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 space-y-4">
        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>

        {/* Demo accounts */}
        <div className="rounded-xl border border-dashed border-border p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground text-center">
            Demo Accounts (any password)
          </p>
          <div className="grid gap-1.5">
            {[
              { email: "student@university.edu.vn", label: "Student" },
              { email: "guard@parksmart.vn", label: "Staff" },
              { email: "admin@parksmart.vn", label: "Admin" },
            ].map((account) => (
              <button
                key={account.email}
                type="button"
                className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                onClick={() => {
                  form.setValue("email", account.email);
                  form.setValue("password", "demo123");
                }}
              >
                <span className="font-medium">{account.label}</span>
                <span className="text-muted-foreground">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

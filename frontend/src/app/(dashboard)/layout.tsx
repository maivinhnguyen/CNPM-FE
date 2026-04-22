"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {user.role !== "staff" && <Navbar />}
        <main
          className={
            user.role === "staff"
              ? "flex-1 p-4 lg:p-6 overflow-hidden flex flex-col"
              : "flex-1 p-4 lg:p-6 overflow-auto"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}

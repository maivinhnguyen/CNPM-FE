"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    if (isClient && (!isAuthenticated || !user)) {
      router.replace("/login");
    }
  }, [isClient, isAuthenticated, user, router]);

  if (!isClient || !isAuthenticated || !user) {
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
          className={cn(
            "flex-1 overflow-auto dashboard-bg",
            user.role === "staff"
              ? "p-4 lg:p-6 flex flex-col"
              : "p-5 lg:p-7"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

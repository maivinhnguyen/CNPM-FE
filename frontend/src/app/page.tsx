"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
    } else {
      router.replace(`/${user.role}`);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  );
}

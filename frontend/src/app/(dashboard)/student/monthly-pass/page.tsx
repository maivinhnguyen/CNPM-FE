"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletService } from "@/services/wallet.service";
import { vehicleService } from "@/services/vehicle.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  CalendarCheck, Clock, CheckCircle2, PlusCircle,
  Car, Calendar, AlertTriangle,
} from "lucide-react";
import {
  MONTHLY_PASS_STATUS_LABELS,
  MONTHLY_PASS_STATUS_COLORS,
  MONTHLY_PASS_PRICE,
} from "@/lib/constants";
import { format, differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";
import type { MonthlyPass } from "@/types";

function CountdownBadge({ endDate }: { endDate: string }) {
  const days = differenceInDays(parseISO(endDate), new Date());
  if (days < 0) return null;
  const color = days <= 5 ? "text-red-600 dark:text-red-400" : days <= 10 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
  return (
    <div className={`flex items-center gap-1.5 text-sm font-semibold ${color}`}>
      <Clock className="h-4 w-4" />
      Còn {days} ngày
    </div>
  );
}

function ActivePassCard({ pass }: { pass: MonthlyPass }) {
  const daysLeft = differenceInDays(parseISO(pass.endDate), new Date());
  const daysTotal = differenceInDays(parseISO(pass.endDate), parseISO(pass.startDate));
  const progress = Math.max(0, Math.round((daysLeft / daysTotal) * 100));
  const barColor = daysLeft <= 5 ? "bg-red-500" : daysLeft <= 10 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 overflow-hidden">
      <CardContent className="pt-6 pb-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Vé đang hiệu lực</p>
            <p className="text-2xl font-bold mt-1">{pass.vehicleBrand}</p>
            <p className="text-sm text-muted-foreground">{pass.vehiclePlate}</p>
          </div>
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/15">
            <CalendarCheck className="h-7 w-7 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <CountdownBadge endDate={pass.endDate} />
            <span className="text-muted-foreground">{progress}% còn lại</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{format(parseISO(pass.startDate), "dd/MM/yyyy")}</span>
            <span>{format(parseISO(pass.endDate), "dd/MM/yyyy")}</span>
          </div>
        </div>

        {daysLeft <= 7 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Vé sắp hết hạn! Hãy gia hạn để không bị gián đoạn.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MonthlyPassPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showRegister, setShowRegister] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const { data: passes, isLoading: passLoading } = useQuery({
    queryKey: ["monthly-passes", user?.id],
    queryFn: () => walletService.getMonthlyPasses(user!.id),
    enabled: !!user,
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: () => walletService.getWallet(user!.id),
    enabled: !!user,
  });

  const { data: vehicles, isLoading: vehicleLoading } = useQuery({
    queryKey: ["my-vehicles", user?.id],
    queryFn: () => vehicleService.getMyVehicles(user!.id),
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: () => {
      const v = vehicles?.find((x) => x.id === selectedVehicle);
      if (!v) throw new Error("Chọn xe");
      return walletService.registerMonthlyPass(user!.id, v.id, v.licensePlate, `${v.brand} ${v.model}`, selectedMonth);
    },
    onSuccess: () => {
      toast.success("Đăng ký vé tháng thành công!");
      queryClient.invalidateQueries({ queryKey: ["monthly-passes"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      setShowRegister(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (passLoading || walletLoading || vehicleLoading) return <LoadingSkeleton type="page" />;

  const activePass = passes?.find((p) => p.status === "active");
  const history = passes?.filter((p) => p.status !== "active") ?? [];

  // Generate next 3 available months
  const now = new Date();
  const monthOptions = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` };
  });

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Vé Xe Tháng" description="Đăng ký vé tháng để ra vào bãi xe không giới hạn" />

      {/* Wallet balance hint */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/40">
        <div className="text-sm text-muted-foreground">Số dư ví</div>
        <div className="font-bold text-lg">{fmt(wallet?.balance ?? 0)}</div>
      </div>

      {activePass ? <ActivePassCard pass={activePass} /> : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-10 gap-3">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10">
              <CalendarCheck className="h-7 w-7 text-primary" />
            </div>
            <p className="font-semibold">Chưa có vé tháng hiệu lực</p>
            <p className="text-sm text-muted-foreground">Đăng ký vé tháng để tự động ra vào bãi xe</p>
          </CardContent>
        </Card>
      )}

      {/* Register button */}
      {!showRegister && (
        <Button className="w-full gap-2" onClick={() => setShowRegister(true)}>
          <PlusCircle className="h-4 w-4" />
          Đăng ký vé tháng mới
        </Button>
      )}

      {/* Registration form */}
      {showRegister && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />Đăng ký vé tháng</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">Chọn xe</p>
              <div className="grid grid-cols-1 gap-2">
                {(vehicles ?? []).map((v) => (
                  <button key={v.id} type="button"
                    onClick={() => setSelectedVehicle(v.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedVehicle === v.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${selectedVehicle === v.id ? "bg-primary/10" : "bg-muted"}`}>
                      <Car className={`h-4 w-4 ${selectedVehicle === v.id ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{v.licensePlate}</p>
                      <p className="text-xs text-muted-foreground">{v.brand} {v.model} • {v.color}</p>
                    </div>
                    {selectedVehicle === v.id && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Chọn tháng</p>
              <div className="grid grid-cols-3 gap-2">
                {monthOptions.map((m) => (
                  <button key={m.value} type="button"
                    onClick={() => setSelectedMonth(m.value)}
                    className={`p-3 rounded-xl border text-center text-sm transition-all ${selectedMonth === m.value ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/50"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <span className="text-sm text-muted-foreground">Phí vé tháng</span>
              <span className="font-bold text-lg">{fmt(MONTHLY_PASS_PRICE)}</span>
            </div>

            {wallet && wallet.balance < MONTHLY_PASS_PRICE && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Số dư không đủ. Vui lòng nạp thêm tiền vào ví.
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRegister(false)}>Hủy</Button>
              <Button className="flex-1"
                disabled={!selectedVehicle || !selectedMonth || (wallet?.balance ?? 0) < MONTHLY_PASS_PRICE || registerMutation.isPending}
                onClick={() => registerMutation.mutate()}>
                {registerMutation.isPending ? "Đang xử lý..." : `Thanh toán ${fmt(MONTHLY_PASS_PRICE)}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Lịch sử vé tháng</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {history.map((pass: MonthlyPass) => (
              <div key={pass.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pass.vehiclePlate}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(pass.startDate), "dd/MM")} – {format(parseISO(pass.endDate), "dd/MM/yyyy")}</p>
                  </div>
                </div>
                <Badge className={MONTHLY_PASS_STATUS_COLORS[pass.status]}>{MONTHLY_PASS_STATUS_LABELS[pass.status]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

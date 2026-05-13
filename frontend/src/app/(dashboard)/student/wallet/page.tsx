"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletService } from "@/services/wallet.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Wallet, ArrowUpCircle, ArrowDownCircle, QrCode,
  Banknote, Smartphone, TrendingUp, History, ChevronRight,
} from "lucide-react";
import {
  TOPUP_PRESETS,
  TRANSACTION_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { format } from "date-fns";
import { toast } from "sonner";
import type { PaymentMethod, WalletTransaction } from "@/types";

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: "bank_qr", label: "QR Ngân hàng", icon: QrCode, desc: "VietQR / Napas" },
  { id: "momo", label: "MoMo", icon: Smartphone, desc: "Ví điện tử MoMo" },
  { id: "cash", label: "Tiền mặt", icon: Banknote, desc: "Tại quầy hỗ trợ" },
];

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isCredit = tx.amount > 0;
  const fmt = (n: number) => (n > 0 ? "+" : "") + Math.abs(n).toLocaleString("vi-VN") + "đ";
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${isCredit ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
          {isCredit
            ? <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
            : <ArrowDownCircle className="h-4 w-4 text-red-500" />}
        </div>
        <div>
          <p className="text-sm font-medium">{tx.description}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(tx.createdAt), "HH:mm dd/MM/yyyy")}
            {tx.method && ` • ${PAYMENT_METHOD_LABELS[tx.method]}`}
          </p>
        </div>
      </div>
      <span className={`font-semibold text-sm ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
        {fmt(tx.amount)}
      </span>
    </div>
  );
}

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>("bank_qr");

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: () => walletService.getWallet(user!.id),
    enabled: !!user,
  });

  const topupMutation = useMutation({
    mutationFn: () => walletService.topUp(user!.id, amount, method),
    onSuccess: (updated) => {
      toast.success(`Nạp ${amount.toLocaleString("vi-VN")}đ thành công!`);
      queryClient.setQueryData(["wallet", user?.id], updated);
      setShowTopup(false);
      setAmount(0);
    },
    onError: () => toast.error("Nạp tiền thất bại. Thử lại sau."),
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const txs = wallet?.transactions ?? [];
  const totalTopup = txs.filter((t) => t.type === "topup" && t.status === "completed").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Ví Tiền" description="Quản lý số dư và nạp tiền tài khoản" />

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-lg">
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2 opacity-80">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">Số dư tài khoản</span>
          </div>
          <div>
            <p className="text-4xl font-bold tracking-tight">{fmt(wallet?.balance ?? 0)}</p>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-75">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>Tổng nạp: {fmt(totalTopup)}</span>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-white text-primary hover:bg-white/90 gap-2 font-semibold"
            onClick={() => setShowTopup(!showTopup)}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Nạp tiền
          </Button>
        </div>
      </div>

      {/* Top-up panel */}
      {showTopup && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ArrowUpCircle className="h-4 w-4" />Nạp tiền vào ví</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Amount presets */}
            <div className="space-y-2">
              <Label>Chọn mệnh giá</Label>
              <div className="grid grid-cols-4 gap-2">
                {TOPUP_PRESETS.map((p) => (
                  <button key={p} type="button"
                    onClick={() => setAmount(p)}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${amount === p ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"}`}>
                    {(p / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-amount">Hoặc nhập số tiền</Label>
              <div className="relative">
                <Input
                  id="custom-amount"
                  type="number"
                  min={10000}
                  step={10000}
                  placeholder="VD: 300000"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">đ</span>
              </div>
              {amount > 0 && <p className="text-xs text-muted-foreground">{fmt(amount)}</p>}
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label>Phương thức thanh toán</Label>
              <div className="space-y-2">
                {paymentMethods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button key={m.id} type="button"
                      onClick={() => setMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${method === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${method === m.id ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`h-4 w-4 ${method === m.id ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      {method === m.id && <ChevronRight className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowTopup(false)}>Hủy</Button>
              <Button className="flex-1 gap-2"
                disabled={!amount || amount < 10000 || topupMutation.isPending}
                onClick={() => topupMutation.mutate()}>
                {topupMutation.isPending ? "Đang xử lý..." : `Nạp ${amount > 0 ? fmt(amount) : ""}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch sử giao dịch
            <Badge variant="secondary" className="ml-auto">{txs.length} giao dịch</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có giao dịch nào</p>
          ) : (
            <div>{txs.map((tx: WalletTransaction) => <TransactionRow key={tx.id} tx={tx} />)}</div>
          )}
        </CardContent>
      </Card>

      {/* Quick info */}
      <Card className="bg-muted/40">
        <CardContent className="py-4 space-y-2 text-sm">
          <p className="font-medium text-foreground">Thông tin nạp tiền:</p>
          {["Nạp tiền được xử lý ngay lập tức", "Số tiền tối thiểu mỗi lần nạp: 10,000đ", "Liên hệ hỗ trợ nếu giao dịch bị lỗi: 1900-xxxx"].map((t) => (
            <div key={t} className="flex items-start gap-2 text-muted-foreground">
              <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-primary" /><span>{t}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

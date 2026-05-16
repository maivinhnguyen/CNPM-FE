"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Copy, CheckCheck, X, Info, BarChart
} from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  TOPUP_PRESETS,
  TRANSACTION_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import type { PaymentMethod, WalletTransaction } from "@/types";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  { id: "bank_qr", label: "QR Ngân hàng", icon: QrCode,    desc: "VietQR / Napas — quét & chuyển khoản" },
  { id: "momo",    label: "MoMo",          icon: Smartphone, desc: "Ví điện tử MoMo" },
  { id: "cash",    label: "Tiền mặt",      icon: Banknote,   desc: "Tại quầy hỗ trợ bãi xe" },
];

const BANK_INFO = {
  bankName: "Vietcombank",
  accountNumber: "0123456789",
  accountName: "CONG TY PARKSMART",
};

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

// ── QR Panel ──────────────────────────────────────────────────
function QRPanel({ amount, onClose }: { amount: number; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const copyAccount = () => {
    navigator.clipboard.writeText(BANK_INFO.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            Quét mã QR để thanh toán
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code image */}
        <div className="flex justify-center">
          <div className="relative bg-white rounded-2xl p-4 shadow-md border border-border">
            <Image
              src="/qr-payment.png"
              alt="QR thanh toán ParkSmart"
              width={200}
              height={200}
              className="rounded-lg"
            />
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full">
                VietQR / Napas
              </span>
            </div>
          </div>
        </div>

        {/* Amount to transfer */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">Số tiền cần chuyển</p>
          <p className="text-3xl font-bold text-primary">{fmt(amount)}</p>
        </div>

        {/* Bank info */}
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Ngân hàng</span>
            <span className="text-sm font-semibold">{BANK_INFO.bankName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Số tài khoản</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold">{BANK_INFO.accountNumber}</span>
              <button onClick={copyAccount}
                className="text-primary hover:text-primary/80 transition-colors">
                {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Chủ tài khoản</span>
            <span className="text-sm font-semibold">{BANK_INFO.accountName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Nội dung CK</span>
            <span className="text-sm font-mono font-semibold text-primary">PARKSMART NAP {amount}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Sau khi chuyển khoản, số dư sẽ được cập nhật tự động trong vòng 1-2 phút. Nhập đúng nội dung chuyển khoản để hệ thống xác nhận.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showTopup, setShowTopup] = useState(false);
  const [showQR, setShowQR] = useState(false);
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
      setShowQR(false);
      setAmount(0);
    },
    onError: () => toast.error("Nạp tiền thất bại. Thử lại sau."),
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const txs = wallet?.transactions ?? [];
  const totalTopup = txs
    .filter((t) => t.type === "topup" && t.status === "completed")
    .reduce((s, t) => s + t.amount, 0);

  const handleProceed = () => {
    if (method === "bank_qr" || method === "momo") {
      setShowQR(true);
    } else {
      topupMutation.mutate();
    }
  };

  // Prepare chart data
  const chartData = [...txs]
    .filter(t => t.amount < 0) // only spending
    .reduce((acc: any, t) => {
      const month = format(new Date(t.createdAt), "MM/yyyy");
      const existing = acc.find((a: any) => a.month === month);
      if (existing) {
        existing.spending += Math.abs(t.amount);
      } else {
        acc.push({ month, spending: Math.abs(t.amount) });
      }
      return acc;
    }, [])
    .reverse()
    .slice(0, 4); // last 4 months

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
          <Button size="sm" className="bg-white text-primary hover:bg-white/90 gap-2 font-semibold"
            onClick={() => { setShowTopup(!showTopup); setShowQR(false); }}>
            <ArrowUpCircle className="h-4 w-4" />
            Nạp tiền
          </Button>
        </div>
      </div>

      {/* Top-up panel */}
      {showTopup && !showQR && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-primary" />
              Nạp tiền vào ví
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Amount presets */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chọn mệnh giá</Label>
              <div className="grid grid-cols-4 gap-2">
                {TOPUP_PRESETS.map((p) => (
                  <button key={p} type="button"
                    onClick={() => setAmount(p)}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      amount === p ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border hover:border-primary/50"
                    }`}>
                    {(p / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-amount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Hoặc nhập số tiền
              </Label>
              <div className="relative">
                <Input id="custom-amount" type="number" min={10000} step={10000}
                  placeholder="VD: 300000"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">đ</span>
              </div>
              {amount > 0 && (
                <p className="text-xs text-muted-foreground">= {fmt(amount)}</p>
              )}
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phương thức thanh toán</Label>
              <div className="space-y-2">
                {paymentMethods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button key={m.id} type="button"
                      onClick={() => setMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        method === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}>
                      <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${method === m.id ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`h-5 w-5 ${method === m.id ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      {method === m.id && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCheck className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowTopup(false)}>Hủy</Button>
              <Button className="flex-1 gap-2"
                disabled={!amount || amount < 10000 || topupMutation.isPending}
                onClick={handleProceed}>
                {(method === "bank_qr" || method === "momo")
                  ? <><QrCode className="h-4 w-4" />Xem mã QR</>
                  : topupMutation.isPending ? "Đang xử lý..." : `Nạp ${amount > 0 ? fmt(amount) : ""}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Panel */}
      {showTopup && showQR && amount > 0 && (
        <>
          <QRPanel amount={amount} onClose={() => setShowQR(false)} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowQR(false)}>← Quay lại</Button>
            <Button className="flex-1 gap-2"
              disabled={topupMutation.isPending}
              onClick={() => topupMutation.mutate()}>
              {topupMutation.isPending ? "Đang xác nhận..." : "Xác nhận đã chuyển khoản"}
            </Button>
          </div>
        </>
      )}

      {/* Transaction history */}
      <Card className="card-glow border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch sử giao dịch
            <Badge variant="secondary" className="ml-auto">{txs.length} giao dịch</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txs.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-8">Chưa có giao dịch nào</p>
            : <div>{txs.map((tx: WalletTransaction) => <TransactionRow key={tx.id} tx={tx} />)}</div>
          }
        </CardContent>
      </Card>

      {/* Spending Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Thống kê chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString("vi-VN")}đ`, "Đã tiêu"]}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="spending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Thông tin nạp tiền</p>
          {[
            "Nạp qua QR: tiền vào ngay sau khi chuyển khoản thành công",
            "Số tiền tối thiểu mỗi lần nạp: 10,000đ",
            "Liên hệ hỗ trợ nếu giao dịch bị lỗi: 1900-xxxx",
          ].map((t) => (
            <div key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-primary" /><span>{t}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

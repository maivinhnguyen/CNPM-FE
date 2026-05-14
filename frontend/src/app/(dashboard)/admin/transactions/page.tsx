"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Receipt, Search, TrendingUp, CheckCircle2,
  XCircle, Clock, Banknote, CreditCard,
  Wallet, Contact, ChevronDown, ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Transaction, TransactionType, TransactionStatus, PaymentMethod } from "@/types";

// ── Config ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<TransactionType, { label: string }> = {
  parking_fee:  { label: "Phí gửi xe" },
  subscription: { label: "Đăng ký vé tháng" },
  penalty:      { label: "Phí phạt" },
};

const STATUS_CONFIG: Record<TransactionStatus, { label: string; color: string; icon: React.ComponentType<{className?: string}> }> = {
  success: { label: "Thành công", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  pending: { label: "Đang chờ",   color: "bg-amber-500/15 text-amber-700 dark:text-amber-400",      icon: Clock },
  failed:  { label: "Thất bại",   color: "bg-red-500/15 text-red-700 dark:text-red-400",             icon: XCircle },
};

const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: React.ComponentType<{className?: string}> }> = {
  cash:          { label: "Tiền mặt",    icon: Banknote },
  bank_transfer: { label: "Chuyển khoản", icon: CreditCard },
  e_wallet:      { label: "Ví điện tử",   icon: Wallet },
  rfid_card:     { label: "Thẻ từ",       icon: Contact },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// ── Transaction Row ───────────────────────────────────────────
function TransactionRow({ tx }: { tx: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const { label: typeLabel } = TYPE_CONFIG[tx.type];
  const { label: statusLabel, color: statusColor, icon: StatusIcon } = STATUS_CONFIG[tx.status];
  const { label: paymentLabel, icon: PaymentIcon } = PAYMENT_CONFIG[tx.paymentMethod];

  return (
    <div className={`rounded-xl border transition-colors ${
      tx.status === "failed" ? "border-red-500/30 bg-red-500/5" :
      tx.status === "pending" ? "border-amber-500/30 bg-amber-500/5" :
      "border-border bg-card"
    }`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors rounded-xl"
      >
        <div className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
          tx.status === "success" ? "bg-emerald-500/10 text-emerald-600" :
          tx.status === "failed" ? "bg-red-500/10 text-red-600" :
          "bg-amber-500/10 text-amber-600"
        }`}>
          <Receipt className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{tx.description}</p>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span>{typeLabel}</span>
            {tx.userName && <span>· {tx.userName}</span>}
          </p>
        </div>

        <div className="text-right shrink-0 mr-2">
          <p className={`font-bold text-sm ${tx.status === "success" ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
            {formatCurrency(tx.amount)}
          </p>
          <div className="flex justify-end mt-1">
            <Badge className={`${statusColor} text-[10px] px-1.5 py-0`}>
              {statusLabel}
            </Badge>
          </div>
        </div>

        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mã giao dịch</p>
              <p className="text-sm font-mono font-medium">{tx.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Thời gian</p>
              <p className="text-sm font-medium">{format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Phương thức</p>
              <div className="flex items-center gap-1.5">
                <PaymentIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{paymentLabel}</span>
              </div>
            </div>
            {tx.vehiclePlate && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Biển số xe</p>
                <p className="text-sm font-mono font-medium">{tx.vehiclePlate}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "all">("all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.getAll,
  });

  const { data: summary } = useQuery({
    queryKey: ["transaction-summary"],
    queryFn: transactionService.getSummary,
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  const filtered = transactions.filter((tx) => {
    const matchType   = filterType === "all"   || tx.type === filterType;
    const matchStatus = filterStatus === "all" || tx.status === filterStatus;
    const matchSearch = !searchTerm ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch Sử Giao Dịch"
        description="Tra cứu tất cả các giao dịch thanh toán trong hệ thống"
      />

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Phí gửi xe</p>
              <p className="text-xl font-bold">{formatCurrency(summary.parkingFees)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Đăng ký vé tháng</p>
              <p className="text-xl font-bold">{formatCurrency(summary.subscriptionFees)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex flex-col justify-center h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tổng giao dịch</span>
                <span className="font-bold">{summary.totalTransactions}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-emerald-600">Thành công</span>
                <span className="font-bold text-emerald-600">{summary.successCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm mã GD, mô tả, tên người dùng, biển số..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "success", "pending", "failed"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}>
              {s === "all" ? "Tất cả trạng thái" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "parking_fee", "subscription", "penalty"] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}>
              {t === "all" ? "Tất cả loại phí" : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-14 gap-3">
            <Receipt className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground font-medium">Không tìm thấy giao dịch nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}

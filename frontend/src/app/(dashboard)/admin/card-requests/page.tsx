"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService } from "@/services/card.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  CheckSquare, Clock, CheckCircle2, XCircle,
  User, Car, Calendar, CreditCard, AlertTriangle,
} from "lucide-react";
import {
  CARD_REQUEST_STATUS_LABELS,
  CARD_REQUEST_STATUS_COLORS,
} from "@/lib/constants";
import { format } from "date-fns";
import { toast } from "sonner";
import type { CardRequest, CardRequestStatus } from "@/types";

type Filter = CardRequestStatus | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "approved", label: "Đã duyệt" },
  { id: "rejected", label: "Từ chối" },
];

function RequestRow({
  request,
  onApprove,
  onReject,
  isActing,
}: {
  request: CardRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isActing: boolean;
}) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <Card className={`transition-all ${request.status === "pending" ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 font-bold text-primary text-sm">
              {request.userName.split(" ").pop()?.[0] ?? "?"}
            </div>
            <div>
              <p className="font-semibold text-sm">{request.userName}</p>
              <p className="text-xs text-muted-foreground">{request.studentId}</p>
            </div>
          </div>
          <Badge className={CARD_REQUEST_STATUS_COLORS[request.status]}>
            {CARD_REQUEST_STATUS_LABELS[request.status]}
          </Badge>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pl-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Car className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">{request.vehiclePlate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{request.vehicleBrand} {request.vehicleModel} • {request.vehicleColor}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>CCCD: {request.idCardNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{format(new Date(request.submittedAt), "dd/MM/yyyy HH:mm")}</span>
          </div>
          {request.cardUid && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 col-span-2">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono font-semibold">{request.cardUid}</span>
            </div>
          )}
          {request.rejectedReason && (
            <div className="flex items-start gap-2 text-red-600 dark:text-red-400 col-span-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>Lý do từ chối: {request.rejectedReason}</span>
            </div>
          )}
          {request.note && (
            <div className="col-span-2 text-xs text-muted-foreground italic">
              Ghi chú: {request.note}
            </div>
          )}
        </div>

        {/* Actions for pending */}
        {request.status === "pending" && !rejectMode && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              disabled={isActing} onClick={() => onApprove(request.id)}>
              <CheckCircle2 className="h-3.5 w-3.5" />Duyệt
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
              disabled={isActing} onClick={() => setRejectMode(true)}>
              <XCircle className="h-3.5 w-3.5" />Từ chối
            </Button>
          </div>
        )}

        {/* Reject reason form */}
        {rejectMode && (
          <div className="space-y-2 pt-1">
            <Label className="text-xs">Lý do từ chối *</Label>
            <Textarea rows={2} placeholder="Nhập lý do từ chối..." value={reason}
              onChange={(e) => setReason(e.target.value)} className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1"
                onClick={() => { setRejectMode(false); setReason(""); }}>
                Hủy
              </Button>
              <Button size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={!reason.trim() || isActing}
                onClick={() => { onReject(request.id, reason); setRejectMode(false); }}>
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}

        {request.reviewedAt && (
          <p className="text-xs text-muted-foreground">
            Duyệt bởi {request.reviewedBy} lúc {format(new Date(request.reviewedAt), "HH:mm dd/MM/yyyy")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminCardRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("pending");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["card-requests", filter],
    queryFn: () => cardService.getAllCardRequests(filter),
  });

  const { data: pendingCount } = useQuery({
    queryKey: ["pending-card-count"],
    queryFn: cardService.getPendingCount,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => cardService.approveCardRequest(id, user?.name ?? "Admin"),
    onSuccess: () => {
      toast.success("Đã duyệt yêu cầu thành công!");
      queryClient.invalidateQueries({ queryKey: ["card-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-card-count"] });
    },
    onError: () => toast.error("Có lỗi xảy ra."),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cardService.rejectCardRequest(id, reason, user?.name ?? "Admin"),
    onSuccess: () => {
      toast.success("Đã từ chối yêu cầu.");
      queryClient.invalidateQueries({ queryKey: ["card-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-card-count"] });
    },
    onError: () => toast.error("Có lỗi xảy ra."),
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  const allRequests = requests ?? [];
  const pendingReqs = allRequests.filter((r) => r.status === "pending");
  const approvedReqs = allRequests.filter((r) => r.status === "approved");
  const isActing = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title="Duyệt Yêu Cầu Thẻ" description="Xem xét và phê duyệt yêu cầu đăng ký thẻ xe từ sinh viên" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-500/15">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Chờ duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/15">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filter === "all" ? approvedReqs.length : "-"}</p>
                <p className="text-xs text-muted-foreground">Đã duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allRequests.length}</p>
                <p className="text-xs text-muted-foreground">Tổng yêu cầu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.id} type="button"
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filter === f.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50 text-muted-foreground"}`}>
            {f.label}
            {f.id === "pending" && (pendingCount ?? 0) > 0 && (
              <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request list */}
      {allRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
            <CheckSquare className="h-12 w-12 opacity-30" />
            <p className="font-medium">Không có yêu cầu nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allRequests.map((req: CardRequest) => (
            <RequestRow key={req.id} request={req} isActing={isActing}
              onApprove={(id) => approveMutation.mutate(id)}
              onReject={(id, reason) => rejectMutation.mutate({ id, reason })} />
          ))}
        </div>
      )}
    </div>
  );
}

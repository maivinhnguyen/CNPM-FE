"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService } from "@/services/card.service";
import { vehicleService } from "@/services/vehicle.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  CreditCard, CheckCircle2, Clock, XCircle, ChevronRight,
  Car, User, FileText, Send, Plus, Info, Sparkles, ShieldAlert
} from "lucide-react";
import { CARD_REQUEST_STATUS_LABELS, CARD_REQUEST_STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { toast } from "sonner";
import type { CardRequest } from "@/types";

// ── Status Timeline ────────────────────────────────────────────
function StatusTimeline({ request }: { request: CardRequest }) {
  const steps = [
    { icon: FileText, label: "Nộp hồ sơ" },
    { icon: Clock, label: "Chờ duyệt" },
    { icon: CheckCircle2, label: "Đã duyệt" },
  ];
  const currentStep = request.status === "pending" ? 1 : request.status === "approved" ? 2 : 0;

  if (request.status === "rejected") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
        <XCircle className="h-8 w-8 text-red-500 shrink-0" />
        <div>
          <p className="font-semibold text-red-600 dark:text-red-400">Yêu cầu bị từ chối</p>
          {request.rejectedReason && (
            <p className="text-sm text-muted-foreground mt-0.5">Lý do: {request.rejectedReason}</p>
          )}
          {request.reviewedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Xử lý lúc {format(new Date(request.reviewedAt), "HH:mm dd/MM/yyyy")}
              {request.reviewedBy && ` · ${request.reviewedBy}`}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const done = idx <= currentStep;
        const active = idx === currentStep;
        return (
          <div key={idx} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all ${
                done ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
              } ${active ? "ring-4 ring-primary/20" : ""}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-medium text-center ${done ? "text-primary" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-5 rounded ${idx < currentStep ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Registration Form ──────────────────────────────────────────
function RegistrationForm({
  isRenew = false,
  vehicles,
  onSubmit,
  onCancel,
  isPending,
}: {
  isRenew?: boolean;
  vehicles: { id: string; licensePlate: string; brand: string; model: string; color: string }[];
  onSubmit: (data: { vehiclePlate: string; vehicleBrand: string; vehicleModel: string; vehicleColor: string; idCardNumber: string; note: string }) => void;
  onCancel?: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    vehiclePlate: "", vehicleBrand: "", vehicleModel: "", vehicleColor: "", idCardNumber: "", note: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isValid = form.vehiclePlate && form.vehicleBrand && form.vehicleModel && form.vehicleColor && form.idCardNumber;

  return (
    <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {isRenew ? "Đăng ký lại thẻ xe" : "Đơn đăng ký thẻ mới"}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Điền đầy đủ thông tin bên dưới để gửi yêu cầu đăng ký thẻ RFID
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Quick fill from registered vehicles */}
        {vehicles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Điền nhanh từ xe đã đăng ký
            </Label>
            <div className="flex flex-wrap gap-2">
              {vehicles.map((v) => (
                <button key={v.id} type="button"
                  onClick={() => setForm((f) => ({ ...f, vehiclePlate: v.licensePlate, vehicleBrand: v.brand, vehicleModel: v.model, vehicleColor: v.color }))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm group">
                  <Car className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-mono font-medium">{v.licensePlate}</span>
                  <span className="text-muted-foreground text-xs">{v.brand}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle info */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Car className="h-3.5 w-3.5" />Thông tin phương tiện
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="plate" className="text-xs">Biển số xe <span className="text-red-500">*</span></Label>
              <Input id="plate" placeholder="VD: 59F1-12345"
                className="font-mono uppercase"
                value={form.vehiclePlate}
                onChange={(e) => set("vehiclePlate", e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="color" className="text-xs">Màu xe <span className="text-red-500">*</span></Label>
              <Input id="color" placeholder="VD: Đỏ, Đen, Trắng"
                value={form.vehicleColor}
                onChange={(e) => set("vehicleColor", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-xs">Hãng xe <span className="text-red-500">*</span></Label>
              <Input id="brand" placeholder="Honda / Yamaha / Suzuki"
                value={form.vehicleBrand}
                onChange={(e) => set("vehicleBrand", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model" className="text-xs">Dòng xe <span className="text-red-500">*</span></Label>
              <Input id="model" placeholder="Wave / Exciter / Vision"
                value={form.vehicleModel}
                onChange={(e) => set("vehicleModel", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <User className="h-3.5 w-3.5" />Thông tin cá nhân
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="cccd" className="text-xs">
              Số CCCD / CMND <span className="text-red-500">*</span>
            </Label>
            <Input id="cccd" placeholder="12 chữ số" maxLength={12}
              value={form.idCardNumber}
              onChange={(e) => set("idCardNumber", e.target.value)} />
            <p className="text-xs text-muted-foreground">Dùng để xác minh danh tính, không được chia sẻ cho bên thứ ba.</p>
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-xs">Ghi chú <span className="text-muted-foreground">(tùy chọn)</span></Label>
          <Textarea id="note" rows={2}
            placeholder="Thông tin bổ sung cho ban quản lý..."
            value={form.note}
            onChange={(e) => set("note", e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">Hủy</Button>
          )}
          <Button className="flex-1 gap-2"
            disabled={!isValid || isPending}
            onClick={() => onSubmit(form)}>
            {isPending
              ? "Đang gửi..."
              : <><Send className="h-4 w-4" />Gửi yêu cầu đăng ký</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function StudentCardPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [showReplaceForm, setShowReplaceForm] = useState(false);

  const { data: cardRequest, isLoading: reqLoading } = useQuery({
    queryKey: ["my-card-request", user?.id],
    queryFn: () => cardService.getMyCardRequest(),
    enabled: !!user,
  });

  const { data: vehicles = [], isLoading: vLoading } = useQuery({
    queryKey: ["my-vehicles", user?.id],
    queryFn: () => vehicleService.getMyVehicles(),
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: (data: Parameters<typeof cardService.submitCardRequest>[0]) =>
      cardService.submitCardRequest(data),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu đăng ký thẻ!");
      queryClient.invalidateQueries({ queryKey: ["my-card-request"] });
      setShowRenewForm(false);
    },
    onError: () => toast.error("Có lỗi xảy ra. Vui lòng thử lại."),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => cardService.reportLostCard(id),
    onSuccess: () => {
      toast.success("Thẻ đã được khóa khẩn cấp thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-card-request"] });
    },
    onError: () => toast.error("Khóa thẻ thất bại. Vui lòng thử lại."),
  });

  const handleSubmit = (formData: { vehiclePlate: string; vehicleBrand: string; vehicleModel: string; vehicleColor: string; idCardNumber: string; note: string }) => {
    submitMutation.mutate({
      userId: user!.id,
      userName: user!.name,
      studentId: user!.studentId ?? "",
      ...formData,
    });
  };

  const handleBlockCard = () => {
    if (window.confirm("CẢNH BÁO: Thẻ sẽ bị vô hiệu hóa lập tức ở cổng. Bạn sẽ cần làm thủ tục xin cấp thẻ mới. Bạn có chắc chắn muốn khóa thẻ không?")) {
      blockMutation.mutate(cardRequest!.id);
    }
  };

  if (reqLoading || vLoading) return <LoadingSkeleton type="page" />;



  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Đăng Ký Thẻ Xe"
        description="Đăng ký thẻ RFID để ra vào bãi đỗ xe thông minh"
      />

      {/* ── Case 1: Has approved card ── */}
      {cardRequest?.status === "approved" && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/8 to-emerald-500/3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Thẻ xe của bạn
              </CardTitle>
              <Badge className={CARD_REQUEST_STATUS_COLORS[cardRequest.status]}>
                {CARD_REQUEST_STATUS_LABELS[cardRequest.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <StatusTimeline request={cardRequest} />

            {cardRequest.cardUid && (
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20">
                  <CreditCard className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Mã thẻ RFID</p>
                  <p className="text-2xl font-bold font-mono tracking-widest mt-0.5">{cardRequest.cardUid}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Biển số xe", value: cardRequest.vehiclePlate },
                { label: "Loại xe", value: `${cardRequest.vehicleBrand} ${cardRequest.vehicleModel}` },
                { label: "Ngày nộp", value: format(new Date(cardRequest.submittedAt), "dd/MM/yyyy HH:mm") },
                cardRequest.reviewedAt
                  ? { label: "Ngày duyệt", value: format(new Date(cardRequest.reviewedAt), "dd/MM/yyyy HH:mm") }
                  : null,
              ].filter(Boolean).map((item) => item && (
                <div key={item.label} className="px-3 py-2.5 rounded-xl bg-background/60 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Option to request card replacement */}
            {!showReplaceForm ? (
              <div className="flex gap-2 mt-1">
                <Button variant="outline" size="sm" className="flex-1 gap-2"
                  onClick={() => setShowReplaceForm(true)}>
                  <Plus className="h-4 w-4" />
                  Yêu cầu đổi thẻ
                </Button>
                <Button variant="destructive" size="sm" className="gap-2"
                  onClick={handleBlockCard}
                  disabled={blockMutation.isPending}>
                  <ShieldAlert className="h-4 w-4" />
                  {blockMutation.isPending ? "Đang xử lý..." : "Báo mất thẻ"}
                </Button>
              </div>
            ) : (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Đơn yêu cầu đổi thẻ mới
                </p>
                <RegistrationForm
                  isRenew
                  vehicles={vehicles}
                  onSubmit={handleSubmit}
                  onCancel={() => setShowReplaceForm(false)}
                  isPending={submitMutation.isPending}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Case 2: Has pending request ── */}
      {cardRequest?.status === "pending" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Yêu cầu đang chờ duyệt
              </CardTitle>
              <Badge className={CARD_REQUEST_STATUS_COLORS[cardRequest.status]}>
                {CARD_REQUEST_STATUS_LABELS[cardRequest.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusTimeline request={cardRequest} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Biển số xe", value: cardRequest.vehiclePlate },
                { label: "Loại xe", value: `${cardRequest.vehicleBrand} ${cardRequest.vehicleModel}` },
                { label: "Ngày nộp", value: format(new Date(cardRequest.submittedAt), "dd/MM/yyyy HH:mm") },
              ].map((item) => (
                <div key={item.label} className="px-3 py-2.5 rounded-xl bg-background border border-amber-500/20">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
              ⏳ Thời gian xử lý từ 1–3 ngày làm việc. Bạn sẽ được thông báo khi có kết quả.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Case 3: Rejected — show status + option to re-register ── */}
      {cardRequest?.status === "rejected" && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Yêu cầu trước đã bị từ chối
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline request={cardRequest} />
          </CardContent>
        </Card>
      )}

      {/* ── Case 3b: Blocked — show status + option to re-register ── */}
      {cardRequest?.status === "blocked" && (
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Thẻ đã bị khóa (Báo mất)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400">Thẻ của bạn đã bị vô hiệu hóa</p>
                <p className="text-sm text-muted-foreground mt-0.5">Không ai có thể sử dụng thẻ này để ra vào bãi xe nữa. Bạn có thể đăng ký cấp thẻ mới.</p>
              </div>
            </div>
            
            <Button className="w-full gap-2" onClick={() => setShowRenewForm(true)}>
              <Plus className="h-4 w-4" />
              Đăng ký cấp thẻ mới
            </Button>

            {showRenewForm && (
              <RegistrationForm
                isRenew
                vehicles={vehicles}
                onSubmit={handleSubmit}
                onCancel={() => setShowRenewForm(false)}
                isPending={submitMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Case 4: No request yet → Show form directly ── */}
      {!cardRequest && (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/8 border border-primary/20">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/15 shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Bạn chưa có thẻ xe</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Điền thông tin bên dưới để gửi yêu cầu đăng ký thẻ RFID
              </p>
            </div>
          </div>
          <RegistrationForm
            vehicles={vehicles}
            onSubmit={handleSubmit}
            isPending={submitMutation.isPending}
          />
        </>
      )}

      {/* ── Case 5: Rejected → show re-register form toggle ── */}
      {cardRequest?.status === "rejected" && !showRenewForm && (
        <Button className="w-full gap-2" onClick={() => setShowRenewForm(true)}>
          <Plus className="h-4 w-4" />
          Đăng ký thẻ mới
        </Button>
      )}
      {cardRequest?.status === "rejected" && showRenewForm && (
        <RegistrationForm
          isRenew
          vehicles={vehicles}
          onSubmit={handleSubmit}
          onCancel={() => setShowRenewForm(false)}
          isPending={submitMutation.isPending}
        />
      )}

      {/* ── Notes ── */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Lưu ý khi đăng ký thẻ</p>
          {[
            "Mỗi sinh viên chỉ được đăng ký 1 thẻ tại một thời điểm",
            "Thời gian xử lý từ 1–3 ngày làm việc",
            "Sau khi được duyệt, đến văn phòng nhận thẻ vật lý",
            "Thẻ chỉ hợp lệ với phương tiện đã đăng ký",
          ].map((t) => (
            <div key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span>{t}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

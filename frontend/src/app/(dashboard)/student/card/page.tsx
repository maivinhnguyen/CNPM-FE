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
  Car, User, FileText, Send,
} from "lucide-react";
import { CARD_REQUEST_STATUS_LABELS, CARD_REQUEST_STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { toast } from "sonner";
import type { CardRequest } from "@/types";

function StatusTimeline({ request }: { request: CardRequest }) {
  const steps = [
    { icon: FileText, label: "Nộp hồ sơ" },
    { icon: Clock, label: "Chờ duyệt" },
    { icon: CheckCircle2, label: "Đã duyệt" },
  ];
  const currentStep = request.status === "pending" ? 1 : request.status === "approved" ? 2 : 0;

  if (request.status === "rejected") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <XCircle className="h-8 w-8 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-600 dark:text-red-400">Yêu cầu bị từ chối</p>
            {request.rejectedReason && (
              <p className="text-sm text-muted-foreground mt-0.5">Lý do: {request.rejectedReason}</p>
            )}
          </div>
        </div>
        {request.reviewedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Xử lý lúc {format(new Date(request.reviewedAt), "HH:mm dd/MM/yyyy")}
            {request.reviewedBy && ` bởi ${request.reviewedBy}`}
          </p>
        )}
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
              <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all ${done ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"} ${active ? "ring-4 ring-primary/20" : ""}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-medium text-center ${done ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
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

export default function StudentCardPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehiclePlate: "", vehicleBrand: "", vehicleModel: "", vehicleColor: "", idCardNumber: "", note: "" });

  const { data: cardRequest, isLoading: reqLoading } = useQuery({
    queryKey: ["my-card-request", user?.id],
    queryFn: () => cardService.getMyCardRequest(user!.id),
    enabled: !!user,
  });

  const { data: vehicles, isLoading: vLoading } = useQuery({
    queryKey: ["my-vehicles", user?.id],
    queryFn: () => vehicleService.getMyVehicles(user!.id),
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: () => cardService.submitCardRequest({ userId: user!.id, userName: user!.name, studentId: user!.studentId ?? "", ...form }),
    onSuccess: () => { toast.success("Đã gửi yêu cầu đăng ký thẻ!"); queryClient.invalidateQueries({ queryKey: ["my-card-request"] }); setShowForm(false); },
    onError: () => toast.error("Có lỗi xảy ra. Vui lòng thử lại."),
  });

  if (reqLoading || vLoading) return <LoadingSkeleton type="page" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Đăng Ký Thẻ Xe" description="Đăng ký thẻ RFID để sử dụng bãi đỗ xe thông minh" />

      {cardRequest && (
        <Card className={cardRequest.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" : cardRequest.status === "rejected" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" />Trạng thái yêu cầu</CardTitle>
              <Badge className={CARD_REQUEST_STATUS_COLORS[cardRequest.status]}>{CARD_REQUEST_STATUS_LABELS[cardRequest.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <StatusTimeline request={cardRequest} />
            {cardRequest.status === "approved" && cardRequest.cardUid && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-emerald-500/30">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mã thẻ của bạn</p>
                  <p className="text-xl font-bold font-mono tracking-widest text-emerald-600 dark:text-emerald-400">{cardRequest.cardUid}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Biển số xe</p><p className="font-medium">{cardRequest.vehiclePlate}</p></div>
              <div><p className="text-xs text-muted-foreground">Loại xe</p><p className="font-medium">{cardRequest.vehicleBrand} {cardRequest.vehicleModel}</p></div>
              <div><p className="text-xs text-muted-foreground">Ngày nộp</p><p className="font-medium">{format(new Date(cardRequest.submittedAt), "dd/MM/yyyy HH:mm")}</p></div>
              {cardRequest.reviewedAt && <div><p className="text-xs text-muted-foreground">Ngày duyệt</p><p className="font-medium">{format(new Date(cardRequest.reviewedAt), "dd/MM/yyyy HH:mm")}</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {(!cardRequest || cardRequest.status === "rejected") && !showForm && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold">{!cardRequest ? "Bạn chưa có thẻ xe" : "Đăng ký lại thẻ xe"}</p>
              <p className="text-sm text-muted-foreground mt-1">Điền thông tin để đăng ký thẻ RFID ra vào bãi xe</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2"><CreditCard className="h-4 w-4" />Đăng ký ngay</Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Thông tin đăng ký</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {vehicles && vehicles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Chọn nhanh từ xe đã đăng ký</Label>
                <div className="flex flex-wrap gap-2">
                  {vehicles.map((v) => (
                    <button key={v.id} type="button"
                      onClick={() => setForm((f) => ({ ...f, vehiclePlate: v.licensePlate, vehicleBrand: v.brand, vehicleModel: v.model, vehicleColor: v.color }))}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm">
                      <Car className="h-3.5 w-3.5 text-muted-foreground" />{v.licensePlate}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label htmlFor="plate">Biển số xe *</Label><Input id="plate" placeholder="59F1-12345" value={form.vehiclePlate} onChange={(e) => setForm((f) => ({ ...f, vehiclePlate: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label htmlFor="color">Màu xe *</Label><Input id="color" placeholder="VD: Đỏ" value={form.vehicleColor} onChange={(e) => setForm((f) => ({ ...f, vehicleColor: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label htmlFor="brand">Hãng xe *</Label><Input id="brand" placeholder="Honda / Yamaha" value={form.vehicleBrand} onChange={(e) => setForm((f) => ({ ...f, vehicleBrand: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label htmlFor="model">Dòng xe *</Label><Input id="model" placeholder="Wave / Exciter" value={form.vehicleModel} onChange={(e) => setForm((f) => ({ ...f, vehicleModel: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cccd" className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Số CCCD *</Label>
              <Input id="cccd" placeholder="12 chữ số" maxLength={12} value={form.idCardNumber} onChange={(e) => setForm((f) => ({ ...f, idCardNumber: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <Textarea id="note" rows={2} placeholder="Thông tin bổ sung..." value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Hủy</Button>
              <Button className="flex-1 gap-2"
                disabled={!form.vehiclePlate || !form.vehicleBrand || !form.vehicleModel || !form.vehicleColor || !form.idCardNumber || submitMutation.isPending}
                onClick={() => submitMutation.mutate()}>
                {submitMutation.isPending ? "Đang gửi..." : <><Send className="h-4 w-4" />Gửi yêu cầu</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/40">
        <CardContent className="py-4 space-y-2 text-sm">
          <p className="font-medium text-foreground">Lưu ý khi đăng ký thẻ:</p>
          {["Mỗi sinh viên chỉ được đăng ký 1 thẻ tại một thời điểm", "Thời gian xử lý từ 1–3 ngày làm việc", "Sau khi được duyệt, đến văn phòng nhận thẻ vật lý"].map((t) => (
            <div key={t} className="flex items-start gap-2 text-muted-foreground">
              <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-primary" /><span>{t}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

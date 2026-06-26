"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { visitorService } from "@/services/visitor.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { UserPlus, CheckCircle2, Calendar, Car } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import QRCode from "react-qr-code";

export default function VisitorPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [validDate, setValidDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: passes, isLoading } = useQuery({
    queryKey: ["my-visitor-passes", user?.id],
    queryFn: () => visitorService.getMyPasses(),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () => visitorService.createVisitorPass(user!.id, visitorName, visitorPhone, vehiclePlate, validDate),
    onSuccess: () => {
      toast.success("Đăng ký thành công! Đã tạo mã QR.");
      queryClient.invalidateQueries({ queryKey: ["my-visitor-passes"] });
      setShowForm(false);
      setVisitorName("");
      setVisitorPhone("");
      setVehiclePlate("");
    },
    onError: () => toast.error("Đăng ký thất bại"),
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Đăng ký khách" description="Tạo mã QR gửi xe trước cho bạn bè, người thân đến thăm" />

      {showForm ? (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Đăng ký xe khách
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên khách</Label>
                <Input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} placeholder="VD: Trần Thị B" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại (Tùy chọn)</Label>
                <Input value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} placeholder="09xxxx" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Biển số xe khách</Label>
                <Input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="59X1-12345" />
              </div>
              <div className="space-y-2">
                <Label>Ngày đến thăm</Label>
                <Input type="date" value={validDate} onChange={(e) => setValidDate(e.target.value)} min={format(new Date(), "yyyy-MM-dd")} />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              <Button onClick={() => createMutation.mutate()} disabled={!visitorName || !vehiclePlate || createMutation.isPending} className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> {createMutation.isPending ? "Đang xử lý..." : "Xác nhận đăng ký"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <UserPlus className="h-4 w-4" /> Thêm khách mới
        </Button>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {passes?.map((p) => (
          <Card key={p.id} className={`overflow-hidden ${p.status === "valid" ? "border-emerald-500/50 shadow-md" : "opacity-75"}`}>
            <div className={`p-4 ${p.status === "valid" ? "bg-emerald-500/10" : "bg-muted"}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{p.visitorName}</h3>
                  <Badge variant={p.status === "valid" ? "default" : "secondary"} className="mt-1">
                    {p.status === "valid" ? "Còn hiệu lực" : "Hết hạn / Đã dùng"}
                  </Badge>
                </div>
                {p.status === "valid" && (
                  <div className="bg-white p-1 rounded-md">
                    <QRCode value={p.qrCodeData} size={60} />
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="h-4 w-4" /> <span className="font-medium text-foreground">{p.vehiclePlate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> <span>{format(new Date(p.validDate), "dd/MM/yyyy")}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {passes?.length === 0 && !showForm && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
            Bạn chưa đăng ký khách nào
          </div>
        )}
      </div>
    </div>
  );
}

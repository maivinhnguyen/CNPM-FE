"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceService } from "@/services/device.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Camera, GitBranch, ScanLine, Radio,
  WifiOff, Wrench, CheckCircle2,
  Clock, Bell, RefreshCw, Flag,
} from "lucide-react";

import { toast } from "sonner";
import type { Device, DeviceType, DeviceStatus } from "@/types";

const TYPE_CONFIG: Record<DeviceType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  camera:      { label: "Camera",        icon: Camera },
  barrier:     { label: "Barrier/Cổng",  icon: GitBranch },
  rfid_reader: { label: "Đầu đọc RFID",  icon: ScanLine },
  sensor:      { label: "Cảm biến",      icon: Radio },
};

const STATUS_CONFIG: Record<DeviceStatus, { label: string; dotColor: string; badgeColor: string }> = {
  online:      { label: "Hoạt động",   dotColor: "bg-emerald-500", badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  offline:     { label: "Mất kết nối", dotColor: "bg-red-500 animate-pulse", badgeColor: "bg-red-500/15 text-red-700 dark:text-red-400" },
  warning:     { label: "Cảnh báo",    dotColor: "bg-amber-500 animate-pulse", badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  maintenance: { label: "Bảo trì",     dotColor: "bg-blue-500", badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
};

function DeviceStatusRow({ device, onReport }: {
  device: Device;
  onReport: (id: string, name: string) => void;
}) {
  const { icon: TypeIcon } = TYPE_CONFIG[device.type];
  const { label, dotColor, badgeColor } = STATUS_CONFIG[device.status];
  const isProblematic = device.status === "offline" || device.status === "warning";

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
      device.status === "offline" ? "border-red-500/30 bg-red-500/5" :
      device.status === "warning" ? "border-amber-500/30 bg-amber-500/5" :
      "border-border bg-card"
    }`}>
      {/* Status dot */}
      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />

      {/* Icon */}
      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted shrink-0">
        <TypeIcon className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{device.name}</p>
        <p className="text-xs text-muted-foreground">{device.locationLabel}</p>
      </div>

      {/* Alert count */}
      {device.alertCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-red-600 font-semibold shrink-0">
          <Bell className="h-3.5 w-3.5" />
          <span>{device.alertCount}</span>
        </div>
      )}

      {/* Badge */}
      <Badge className={`${badgeColor} shrink-0 text-xs`}>{label}</Badge>

      {/* Report button — only for problematic devices */}
      {isProblematic && (
        <Button size="sm" variant="outline"
          className="h-7 px-2.5 text-xs gap-1 border-red-500/30 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 shrink-0"
          onClick={() => onReport(device.id, device.name)}>
          <Flag className="h-3 w-3" />Báo lỗi
        </Button>
      )}

      {device.status === "online" && (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      )}
      {device.status === "maintenance" && (
        <Wrench className="h-4 w-4 text-blue-500 shrink-0" />
      )}
    </div>
  );
}

export default function StaffDevicesPage() {
  const queryClient = useQueryClient();
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const [reportMsg, setReportMsg] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: deviceService.getAll,
    refetchInterval: 30000,
  });

  const { data: summary } = useQuery({
    queryKey: ["device-summary"],
    queryFn: deviceService.getSummary,
    refetchInterval: 30000,
  });

  const reportMutation = useMutation({
    mutationFn: () => deviceService.reportFault(reportTarget!.id, reportMsg, severity),
    onSuccess: () => {
      toast.success("Đã báo lỗi thiết bị lên hệ thống!");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device-summary"] });
      setReportTarget(null);
      setReportMsg("");
      setSeverity("medium");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  // Group by type
  const grouped = (["camera", "barrier", "rfid_reader", "sensor"] as DeviceType[]).map((type) => ({
    type,
    devices: devices.filter((d) => d.type === type),
  })).filter((g) => g.devices.length > 0);

  const problemDevices = devices.filter((d) => d.status === "offline" || d.status === "warning");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Trạng Thái Thiết Bị"
          description="Theo dõi hoạt động thiết bị tại cổng trực của bạn"
        />
        <Button variant="outline" size="sm" className="gap-2 shrink-0"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["devices"] });
            queryClient.invalidateQueries({ queryKey: ["device-summary"] });
          }}>
          <RefreshCw className="h-3.5 w-3.5" />Làm mới
        </Button>
      </div>

      {/* Quick status overview */}
      {summary && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Hoạt động", value: summary.online, color: "text-emerald-600" },
            { label: "Cảnh báo", value: summary.warning, color: summary.warning > 0 ? "text-amber-600" : "text-muted-foreground" },
            { label: "Bảo trì", value: summary.maintenance, color: "text-blue-600" },
            { label: "Mất kết nối", value: summary.offline, color: summary.offline > 0 ? "text-red-600" : "text-muted-foreground" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="pt-3 pb-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Problem devices alert */}
      {problemDevices.length > 0 && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/5 space-y-2">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-red-600" />
            <p className="font-semibold text-sm text-red-700 dark:text-red-400">
              {problemDevices.length} thiết bị cần chú ý
            </p>
          </div>
          <div className="space-y-1.5">
            {problemDevices.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-xs text-red-600/80 dark:text-red-400/80">
                <span className={`h-1.5 w-1.5 rounded-full ${d.status === "offline" ? "bg-red-500" : "bg-amber-500"}`} />
                <span className="font-medium">{d.name}</span>
                <span className="text-muted-foreground">— {STATUS_CONFIG[d.status].label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report fault modal */}
      {reportTarget && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flag className="h-4 w-4 text-amber-600" />
              Báo lỗi: {reportTarget.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Severity */}
            <div className="space-y-1.5">
              <Label className="text-xs">Mức độ nghiêm trọng</Label>
              <div className="flex gap-2">
                {([
                  { value: "low",    label: "Nhẹ",   color: "border-blue-500/50 text-blue-700" },
                  { value: "medium", label: "Vừa",   color: "border-amber-500/50 text-amber-700" },
                  { value: "high",   label: "Nghiêm trọng", color: "border-red-500/50 text-red-700" },
                ] as const).map(({ value, label, color }) => (
                  <button key={value} type="button"
                    onClick={() => setSeverity(value)}
                    className={`flex-1 text-xs py-2 rounded-lg border font-medium transition-all ${
                      severity === value ? `${color} bg-white dark:bg-background` : "border-border text-muted-foreground hover:border-primary/40"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mô tả lỗi <span className="text-red-500">*</span></Label>
              <Textarea rows={3} placeholder="VD: Camera không hiển thị hình ảnh, màn hình tối..."
                value={reportMsg} onChange={(e) => setReportMsg(e.target.value)} className="text-sm" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setReportTarget(null)}>Hủy</Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" disabled={!reportMsg || reportMutation.isPending}
                onClick={() => reportMutation.mutate()}>
                {reportMutation.isPending ? "Đang gửi..." : "Gửi báo lỗi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Devices grouped by type */}
      {grouped.map(({ type, devices: devList }) => {
        const { label, icon: TypeIcon } = TYPE_CONFIG[type];
        const onlineCount = devList.filter((d) => d.status === "online").length;
        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <TypeIcon className="h-4 w-4" />{label}
              </h3>
              <span className="text-xs text-muted-foreground">
                {onlineCount}/{devList.length} hoạt động
              </span>
            </div>
            <div className="space-y-2">
              {devList.map((device) => (
                <DeviceStatusRow
                  key={device.id}
                  device={device}
                  onReport={(id, name) => { setReportTarget({ id, name }); setReportMsg(""); }}
                />
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-center text-muted-foreground/60 flex items-center justify-center gap-1.5">
        <Clock className="h-3 w-3" />
        Tự động cập nhật mỗi 30 giây
      </p>
    </div>
  );
}

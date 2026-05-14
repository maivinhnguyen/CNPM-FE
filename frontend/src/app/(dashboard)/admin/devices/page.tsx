"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceService } from "@/services/device.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Cpu, Camera, GitBranch, ScanLine, Radio,
  Wifi, WifiOff, AlertTriangle, Wrench, CheckCircle2,
  Clock, Search, ChevronDown, ChevronUp, Bell, X,
  RefreshCw, Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import type { Device, DeviceAlert, DeviceStatus, DeviceType } from "@/types";

const TYPE_CONFIG: Record<DeviceType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  camera:      { label: "Camera",       icon: Camera },
  barrier:     { label: "Barrier",      icon: GitBranch },
  rfid_reader: { label: "Đầu đọc RFID", icon: ScanLine },
  sensor:      { label: "Cảm biến",     icon: Radio },
};

const STATUS_CONFIG: Record<DeviceStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  online:      { label: "Hoạt động",    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: Wifi },
  offline:     { label: "Mất kết nối",  color: "bg-red-500/15 text-red-700 dark:text-red-400",             icon: WifiOff },
  warning:     { label: "Cảnh báo",     color: "bg-amber-500/15 text-amber-700 dark:text-amber-400",        icon: AlertTriangle },
  maintenance: { label: "Bảo trì",      color: "bg-blue-500/15 text-blue-700 dark:text-blue-400",           icon: Wrench },
};

function DeviceCard({ device, alerts, onStatusChange, onResolveAlert, isActing }: {
  device: Device;
  alerts: DeviceAlert[];
  onStatusChange: (id: string, status: DeviceStatus, notes?: string) => void;
  onResolveAlert: (alertId: string) => void;
  isActing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [noteVal, setNoteVal] = useState(device.notes ?? "");

  const { icon: TypeIcon } = TYPE_CONFIG[device.type];
  const { icon: StatusIcon, color: statusColor, label: statusLabel } = STATUS_CONFIG[device.status];
  const devAlerts = alerts.filter((a) => a.deviceId === device.id);
  const isOffline = device.status === "offline";

  return (
    <Card className={`transition-all ${isOffline ? "border-red-500/40 bg-red-500/5" : device.status === "warning" ? "border-amber-500/30" : ""}`}>
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/20 transition-colors rounded-xl">
        {/* Icon */}
        <div className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
          device.status === "online" ? "bg-emerald-500/10" :
          device.status === "offline" ? "bg-red-500/10" :
          device.status === "warning" ? "bg-amber-500/10" : "bg-blue-500/10"
        }`}>
          <TypeIcon className={`h-5 w-5 ${
            device.status === "online" ? "text-emerald-600" :
            device.status === "offline" ? "text-red-600" :
            device.status === "warning" ? "text-amber-600" : "text-blue-600"
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{device.name}</p>
            {device.alertCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                <Bell className="h-3 w-3" />{device.alertCount} cảnh báo
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{device.locationLabel} · {TYPE_CONFIG[device.type].label}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge className={statusColor}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusLabel}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-4">
          {/* Device details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "IP", value: device.ipAddress ?? "N/A" },
              { label: "Firmware", value: device.firmwareVersion ?? "N/A" },
              { label: "Cài đặt", value: device.installedAt },
              { label: "Lần cuối thấy", value: formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true, locale: vi }) },
            ].map(({ label, value }) => (
              <div key={label} className="px-3 py-2 rounded-lg bg-muted/50">
                <p className="text-muted-foreground mb-0.5">{label}</p>
                <p className="font-mono font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {devAlerts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cảnh báo hiện tại</p>
              {devAlerts.map((alert) => (
                <div key={alert.id} className={`flex items-start justify-between gap-2 px-3 py-2 rounded-lg border ${
                  alert.severity === "high" ? "border-red-500/30 bg-red-500/5" :
                  alert.severity === "medium" ? "border-amber-500/30 bg-amber-500/5" : "border-muted bg-muted/30"
                }`}>
                  <div>
                    <p className="text-xs font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-emerald-600 shrink-0"
                    onClick={() => onResolveAlert(alert.id)} disabled={isActing}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ghi chú</p>
            <Textarea rows={2} className="text-sm" value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              placeholder="Ghi chú về thiết bị..." />
          </div>

          {/* Status change */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thay đổi trạng thái</p>
            <div className="grid grid-cols-2 gap-2">
              {(["online", "warning", "maintenance", "offline"] as DeviceStatus[]).map((s) => {
                const { icon: SIcon, label } = STATUS_CONFIG[s];
                return (
                  <Button key={s} size="sm" variant={device.status === s ? "default" : "outline"}
                    className="gap-1.5 text-xs justify-start"
                    disabled={device.status === s || isActing}
                    onClick={() => onStatusChange(device.id, s, noteVal)}>
                    <SIcon className="h-3.5 w-3.5" />{label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdminDevicesPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<DeviceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: devices = [], isLoading: devLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: deviceService.getAll,
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["device-alerts"],
    queryFn: () => deviceService.getAlerts(),
    refetchInterval: 30000,
  });

  const { data: summary } = useQuery({
    queryKey: ["device-summary"],
    queryFn: deviceService.getSummary,
    refetchInterval: 30000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: DeviceStatus; notes?: string }) =>
      deviceService.updateStatus(id, status, notes),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái thiết bị!");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) => deviceService.resolveAlert(alertId),
    onSuccess: () => {
      toast.success("Đã đánh dấu cảnh báo đã xử lý!");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["device-summary"] });
    },
  });

  const isActing = statusMutation.isPending || resolveAlertMutation.isPending;

  if (devLoading) return <LoadingSkeleton type="page" />;

  const filtered = devices.filter((d) => {
    const matchType   = filterType === "all" || d.type === filterType;
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    const matchSearch = !searchTerm ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.locationLabel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader title="Quản Lý Thiết Bị" description="Theo dõi và quản lý camera, barrier, cảm biến trong bãi xe" />
        <Button variant="outline" size="sm" className="gap-2 shrink-0"
          onClick={() => { queryClient.invalidateQueries({ queryKey: ["devices"] }); queryClient.invalidateQueries({ queryKey: ["device-alerts"] }); }}>
          <RefreshCw className="h-3.5 w-3.5" />Làm mới
        </Button>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Tổng thiết bị", value: summary.total, color: "text-foreground", bg: "bg-muted" },
            { label: "Hoạt động", value: summary.online, color: "text-emerald-600", bg: "bg-emerald-500/10" },
            { label: "Cảnh báo", value: summary.warning, color: summary.warning > 0 ? "text-amber-600" : "text-muted-foreground", bg: summary.warning > 0 ? "bg-amber-500/10" : "bg-muted" },
            { label: "Bảo trì", value: summary.maintenance, color: "text-blue-600", bg: "bg-blue-500/10" },
            { label: "Mất kết nối", value: summary.offline, color: summary.offline > 0 ? "text-red-600" : "text-muted-foreground", bg: summary.offline > 0 ? "bg-red-500/10" : "bg-muted" },
          ].map(({ label, value, color, bg }) => (
            <Card key={label}>
              <CardContent className="pt-3 pb-3">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Offline/Warning alert banner */}
      {summary && (summary.offline > 0 || summary.warning > 0) && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/40 bg-red-500/8">
          <WifiOff className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-sm text-red-700 dark:text-red-400">
              {summary.offline > 0 && `${summary.offline} thiết bị mất kết nối`}
              {summary.offline > 0 && summary.warning > 0 && " · "}
              {summary.warning > 0 && `${summary.warning} thiết bị có cảnh báo`}
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">Kiểm tra và xử lý sớm để đảm bảo hệ thống hoạt động ổn định</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm tên thiết bị, vị trí..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "camera", "barrier", "rfid_reader", "sensor"] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}>
              {t === "all" ? "Tất cả" : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["all", "online", "warning", "maintenance", "offline"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}>
              {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Device grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((device: Device) => (
          <DeviceCard key={device.id} device={device} alerts={alerts} isActing={isActing}
            onStatusChange={(id, status, notes) => statusMutation.mutate({ id, status, notes })}
            onResolveAlert={(alertId) => resolveAlertMutation.mutate(alertId)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-12 gap-3">
            <Cpu className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground">Không tìm thấy thiết bị nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

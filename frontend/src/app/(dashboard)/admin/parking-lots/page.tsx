"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parkingLotService } from "@/services/parking-lot.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Building2, Plus, Search, MapPin, Clock, Phone, User,
  ChevronDown, ChevronUp, Trash2, X, Check,
  Car, CheckCircle2, Wrench, XCircle,
  ParkingCircle, Layers, Trees,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { ParkingLot, ParkingLotStatus, ParkingLotType } from "@/types";

// ── Config ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ParkingLotStatus, { label: string; color: string; icon: React.ComponentType<{className?: string}> }> = {
  active:      { label: "Đang hoạt động", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  inactive:    { label: "Ngừng hoạt động", color: "bg-red-500/15 text-red-700 dark:text-red-400",           icon: XCircle },
  maintenance: { label: "Đang bảo trì",   color: "bg-amber-500/15 text-amber-700 dark:text-amber-400",      icon: Wrench },
};

const TYPE_CONFIG: Record<ParkingLotType, { label: string; icon: React.ComponentType<{className?: string}> }> = {
  indoor:      { label: "Trong nhà",  icon: Building2 },
  outdoor:     { label: "Ngoài trời", icon: Trees },
  multi_level: { label: "Đa tầng",    icon: Layers },
};

// ── Occupancy bar ──────────────────────────────────────────────
function OccupancyBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{current}/{total} chỗ</span>
        <span className={`font-bold ${pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-emerald-600"}`}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Parking Lot Card ───────────────────────────────────────────
function ParkingLotCard({
  lot,
  onStatusChange,
  onDelete,
  isActing,
}: {
  lot: ParkingLot;
  onStatusChange: (id: string, status: ParkingLotStatus) => void;
  onDelete: (id: string, name: string) => void;
  isActing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { label: statusLabel, color: statusColor, icon: StatusIcon } = STATUS_CONFIG[lot.status];
  const { label: typeLabel, icon: TypeIcon } = TYPE_CONFIG[lot.type];

  return (
    <Card className={`transition-all ${lot.status === "inactive" ? "opacity-70" : ""}`}>
      {/* Header — clickable to expand */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-muted/20 transition-colors rounded-xl"
      >
        {/* Left icon */}
        <div className={`flex items-center justify-center h-12 w-12 rounded-xl shrink-0 mt-0.5 ${
          lot.status === "active" ? "bg-primary/10" :
          lot.status === "maintenance" ? "bg-amber-500/10" : "bg-muted"
        }`}>
          <ParkingCircle className={`h-6 w-6 ${
            lot.status === "active" ? "text-primary" :
            lot.status === "maintenance" ? "text-amber-600" : "text-muted-foreground"
          }`} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-base">{lot.name}</h3>
            <Badge className={`${statusColor} text-xs shrink-0`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{lot.address}</span>
          </div>
          <OccupancyBar current={lot.currentOccupancy} total={lot.totalCapacity} />
        </div>

        {/* Type badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
            <TypeIcon className="h-3.5 w-3.5" />
            {typeLabel}
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-border/50 space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm pt-3">
            {[
              { icon: Clock, label: "Giờ hoạt động", value: `${lot.openTime} – ${lot.closeTime}` },
              { icon: Car, label: "Sức chứa", value: `${lot.totalCapacity} chỗ` },
              { icon: User, label: "Quản lý", value: lot.managerName ?? "—" },
              { icon: Phone, label: "Liên hệ", value: lot.contactPhone ?? "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/50">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {lot.description && (
            <p className="text-sm text-muted-foreground leading-relaxed px-1 border-l-2 border-muted pl-3">
              {lot.description}
            </p>
          )}

          {/* Timestamps */}
          <p className="text-xs text-muted-foreground">
            Đăng ký: {format(new Date(lot.createdAt), "dd/MM/yyyy")} ·
            Cập nhật: {format(new Date(lot.updatedAt), "dd/MM/yyyy HH:mm")}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <p className="text-xs font-semibold text-muted-foreground self-center mr-1">Trạng thái:</p>
            {(["active", "maintenance", "inactive"] as ParkingLotStatus[]).map((s) => {
              const { label, icon: SIcon } = STATUS_CONFIG[s];
              return (
                <Button key={s} size="sm" variant={lot.status === s ? "default" : "outline"}
                  className="gap-1.5 text-xs h-8"
                  disabled={lot.status === s || isActing}
                  onClick={() => onStatusChange(lot.id, s)}>
                  <SIcon className="h-3.5 w-3.5" />{label}
                </Button>
              );
            })}
            <div className="ml-auto">
              <Button size="sm" variant="outline"
                className="gap-1.5 text-xs h-8 border-red-500/30 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                disabled={isActing}
                onClick={() => onDelete(lot.id, lot.name)}>
                <Trash2 className="h-3.5 w-3.5" />Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Create Form ────────────────────────────────────────────────
const DEFAULT_FORM = {
  name: "", address: "", type: "outdoor" as ParkingLotType,
  totalCapacity: 100, openTime: "06:00", closeTime: "22:00",
  contactPhone: "", managerName: "", description: "",
};

function CreateForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULT_FORM);

  const createMutation = useMutation({
    mutationFn: () => parkingLotService.create({ ...form, status: "active" }),
    onSuccess: (lot) => {
      toast.success(`Đã thêm nhà xe "${lot.name}" vào hệ thống!`);
      queryClient.invalidateQueries({ queryKey: ["parking-lots"] });
      queryClient.invalidateQueries({ queryKey: ["parking-lot-summary"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Đăng ký nhà xe mới
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name + type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Tên nhà xe <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: Bãi xe E - Tòa A3" value={form.name}
              onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Địa chỉ <span className="text-red-500">*</span></Label>
            <Input placeholder="Địa chỉ cụ thể của nhà xe" value={form.address}
              onChange={(e) => set("address", e.target.value)} />
          </div>
        </div>

        {/* Type selector */}
        <div className="space-y-1.5">
          <Label className="text-xs">Loại nhà xe</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(TYPE_CONFIG) as [ParkingLotType, typeof TYPE_CONFIG["indoor"]][]).map(([k, { label, icon: Icon }]) => (
              <button key={k} type="button"
                onClick={() => set("type", k)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                  form.type === k ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"
                }`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Capacity + hours */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sức chứa (xe) <span className="text-red-500">*</span></Label>
            <Input type="number" min={1} value={form.totalCapacity}
              onChange={(e) => set("totalCapacity", parseInt(e.target.value) || 1)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Giờ mở cửa</Label>
            <Input type="time" value={form.openTime} onChange={(e) => set("openTime", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Giờ đóng cửa</Label>
            <Input type="time" value={form.closeTime} onChange={(e) => set("closeTime", e.target.value)} />
          </div>
        </div>

        {/* Manager + phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Tên quản lý</Label>
            <Input placeholder="Nguyễn Văn A" value={form.managerName}
              onChange={(e) => set("managerName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Số điện thoại</Label>
            <Input placeholder="028 xxxx xxxx" value={form.contactPhone}
              onChange={(e) => set("contactPhone", e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs">Mô tả</Label>
          <Textarea rows={2} placeholder="Ghi chú về nhà xe, tiện ích, vị trí đặc biệt..."
            value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
          <Button className="flex-1 gap-2"
            disabled={!form.name || !form.address || createMutation.isPending}
            onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? "Đang lưu..." : <><Check className="h-4 w-4" />Đăng ký nhà xe</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AdminParkingLotsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ParkingLotStatus | "all">("all");
  const [filterType, setFilterType] = useState<ParkingLotType | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ["parking-lots"],
    queryFn: parkingLotService.getAll,
  });

  const { data: summary } = useQuery({
    queryKey: ["parking-lot-summary"],
    queryFn: parkingLotService.getSummary,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ParkingLotStatus }) =>
      parkingLotService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái nhà xe!");
      queryClient.invalidateQueries({ queryKey: ["parking-lots"] });
      queryClient.invalidateQueries({ queryKey: ["parking-lot-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => parkingLotService.delete(id),
    onSuccess: () => {
      toast.success("Đã xóa nhà xe!");
      queryClient.invalidateQueries({ queryKey: ["parking-lots"] });
      queryClient.invalidateQueries({ queryKey: ["parking-lot-summary"] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isActing = statusMutation.isPending || deleteMutation.isPending;

  const filtered = lots.filter((l) => {
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchType   = filterType === "all"   || l.type === filterType;
    const matchSearch = !searchTerm ||
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.managerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <PageHeader
          title="Quản Lý Nhà Xe"
          description="Đăng ký, theo dõi sức chứa và tình trạng hoạt động các bãi xe"
        />
        <Button className="gap-2 shrink-0" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? <><X className="h-4 w-4" />Đóng</> : <><Plus className="h-4 w-4" />Đăng ký nhà xe</>}
        </Button>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Tổng nhà xe",     value: summary.totalLots,        color: "text-foreground",       bg: "bg-muted" },
            { label: "Đang hoạt động",  value: summary.activeLots,       color: "text-emerald-600",      bg: "bg-emerald-500/10" },
            { label: "Tổng sức chứa",   value: `${summary.totalCapacity} xe`, color: "text-blue-600",   bg: "bg-blue-500/10" },
            { label: "Đang đỗ",         value: summary.currentOccupancy, color: "text-violet-600",       bg: "bg-violet-500/10" },
            { label: "Tỷ lệ lấp đầy",   value: `${summary.occupancyRate}%`,
              color: summary.occupancyRate >= 90 ? "text-red-600" : summary.occupancyRate >= 70 ? "text-amber-600" : "text-emerald-600",
              bg: summary.occupancyRate >= 90 ? "bg-red-500/10" : "bg-muted" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="pt-3 pb-3">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create form */}
      {showCreate && <CreateForm onClose={() => setShowCreate(false)} />}

      {/* Delete confirm */}
      {deleteTarget && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
            <p className="text-sm">
              Xác nhận xóa nhà xe <span className="font-semibold">&ldquo;{deleteTarget.name}&rdquo;</span>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}>
                Xóa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm tên, địa chỉ, quản lý..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "active", "maintenance", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}>
              {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["all", "indoor", "outdoor", "multi_level"] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}>
              {t === "all" ? "Tất cả loại" : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Lots list */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-14 gap-3">
            <Building2 className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground font-medium">Không tìm thấy nhà xe nào</p>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" />Đăng ký nhà xe đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lot: ParkingLot) => (
            <ParkingLotCard
              key={lot.id}
              lot={lot}
              isActing={isActing}
              onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
              onDelete={(id, name) => setDeleteTarget({ id, name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentService } from "@/services/incident.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  AlertTriangle, Plus, CheckCircle2, ArrowUpCircle,
  Clock, Car, X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import type { IncidentType, IncidentStatus, Incident } from "@/types";

const INCIDENT_TYPES: { value: IncidentType; label: string; emoji: string }[] = [
  { value: "unregistered",    label: "Xe không đăng ký", emoji: "🚫" },
  { value: "wrong_parking",   label: "Đậu xe sai vị trí", emoji: "⚠️" },
  { value: "damaged_vehicle", label: "Xe bị hỏng/trầy",   emoji: "🔧" },
  { value: "suspicious",      label: "Hành vi đáng ngờ",  emoji: "👁️" },
  { value: "other",           label: "Khác",               emoji: "📝" },
];

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string }> = {
  open:      { label: "Đang mở",     color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  resolved:  { label: "Đã giải quyết", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  escalated: { label: "Đã báo lên",  color: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

function IncidentCard({
  incident,
  onResolve,
  onEscalate,
  isActing,
}: {
  incident: Incident;
  onResolve: (id: string, note: string) => void;
  onEscalate: (id: string) => void;
  isActing: boolean;
}) {
  const [showResolve, setShowResolve] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const typeInfo = INCIDENT_TYPES.find((t) => t.value === incident.type);
  const statusCfg = STATUS_CONFIG[incident.status];

  return (
    <Card className={incident.status === "escalated" ? "border-red-500/30" : ""}>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeInfo?.emoji}</span>
            <div>
              <p className="font-semibold text-sm">{typeInfo?.label}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true, locale: vi })}
              </p>
            </div>
          </div>
          <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
        </div>

        {incident.vehiclePlate && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50">
            <Car className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm font-semibold">{incident.vehiclePlate}</span>
            {incident.location && (
              <span className="text-xs text-muted-foreground ml-auto">📍 {incident.location}</span>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed">{incident.description}</p>

        {incident.resolvedNote && (
          <div className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              <span className="font-semibold">Ghi chú giải quyết:</span> {incident.resolvedNote}
            </p>
          </div>
        )}

        {incident.status === "open" && !showResolve && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline"
              className="flex-1 gap-1.5 text-xs border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              onClick={() => setShowResolve(true)} disabled={isActing}>
              <CheckCircle2 className="h-3.5 w-3.5" />Giải quyết
            </Button>
            <Button size="sm" variant="outline"
              className="flex-1 gap-1.5 text-xs border-red-500/30 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              onClick={() => onEscalate(incident.id)} disabled={isActing}>
              <ArrowUpCircle className="h-3.5 w-3.5" />Báo cấp trên
            </Button>
          </div>
        )}

        {showResolve && (
          <div className="space-y-2.5">
            <Textarea rows={2} placeholder="Ghi chú cách giải quyết..."
              value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowResolve(false)}>Hủy</Button>
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isActing}
                onClick={() => { onResolve(incident.id, resolveNote); setShowResolve(false); }}>
                Xác nhận
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function IncidentsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "all">("all");
  const [form, setForm] = useState<{
    vehiclePlate: string; type: IncidentType; description: string; location: string;
  }>({ vehiclePlate: "", type: "wrong_parking", description: "", location: "" });

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents", user?.id],
    queryFn: () => incidentService.getAll(user?.id),
  });

  const reportMutation = useMutation({
    mutationFn: () => incidentService.report({
      reportedBy: user!.id,
      reporterName: user!.name,
      vehiclePlate: form.vehiclePlate || undefined,
      type: form.type,
      description: form.description,
      location: form.location || undefined,
    }),
    onSuccess: () => {
      toast.success("Đã gửi báo cáo sự cố!");
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setShowCreate(false);
      setForm({ vehiclePlate: "", type: "wrong_parking", description: "", location: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => incidentService.resolve(id, note),
    onSuccess: () => { toast.success("Đã đánh dấu giải quyết!"); queryClient.invalidateQueries({ queryKey: ["incidents"] }); },
  });

  const escalateMutation = useMutation({
    mutationFn: (id: string) => incidentService.escalate(id),
    onSuccess: () => { toast.success("Đã báo lên cấp trên!"); queryClient.invalidateQueries({ queryKey: ["incidents"] }); },
  });

  const isActing = resolveMutation.isPending || escalateMutation.isPending;
  const filtered = filterStatus === "all" ? incidents : incidents.filter((i) => i.status === filterStatus);
  const openCount = incidents.filter((i) => i.status === "open").length;

  if (isLoading) return <LoadingSkeleton type="page" />;

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader
        title="Báo Cáo Sự Cố"
        description="Ghi nhận và theo dõi các sự cố trong ca trực"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tổng sự cố", value: incidents.length, color: "text-foreground" },
          { label: "Đang mở", value: openCount, color: openCount > 0 ? "text-amber-600" : "text-muted-foreground" },
          { label: "Đã giải quyết", value: incidents.filter((i) => i.status === "resolved").length, color: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create + Filter row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(["all", "open", "resolved", "escalated"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}>
              {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? <><X className="h-3.5 w-3.5" />Đóng</> : <><Plus className="h-3.5 w-3.5" />Báo cáo mới</>}
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Tạo báo cáo sự cố mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {INCIDENT_TYPES.map((t) => (
                <button key={t.value} type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                    form.type === t.value ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/40"
                  }`}>
                  <span>{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Biển số xe (nếu có)</Label>
                <Input placeholder="59F1-12345" className="h-9 text-sm font-mono uppercase"
                  value={form.vehiclePlate} onChange={(e) => setForm((f) => ({ ...f, vehiclePlate: e.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Vị trí</Label>
                <Input placeholder="VD: Khu A - Ô số 5" className="h-9 text-sm"
                  value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mô tả sự cố <span className="text-red-500">*</span></Label>
              <Textarea rows={3} placeholder="Mô tả chi tiết sự cố xảy ra..."
                value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button className="flex-1" disabled={!form.description || reportMutation.isPending}
                onClick={() => reportMutation.mutate()}>
                {reportMutation.isPending ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incidents list */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-10 gap-2">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Không có sự cố nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((incident: Incident) => (
            <IncidentCard key={incident.id} incident={incident} isActing={isActing}
              onResolve={(id, note) => resolveMutation.mutate({ id, note })}
              onEscalate={(id) => escalateMutation.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
}

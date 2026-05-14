"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentService } from "@/services/incident.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  AlertTriangle, CheckCircle2, ArrowUpCircle, Clock,
  Car, User, Filter, Search, ShieldAlert, TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import type { Incident, IncidentStatus, IncidentType } from "@/types";

const INCIDENT_TYPES: Record<IncidentType, { label: string; emoji: string }> = {
  unregistered:    { label: "Xe không đăng ký", emoji: "🚫" },
  wrong_parking:   { label: "Đậu sai vị trí",   emoji: "⚠️" },
  damaged_vehicle: { label: "Xe bị hỏng",        emoji: "🔧" },
  suspicious:      { label: "Hành vi đáng ngờ",  emoji: "👁️" },
  other:           { label: "Khác",               emoji: "📝" },
};

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string }> = {
  open:      { label: "Đang mở",       color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  resolved:  { label: "Đã giải quyết", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  escalated: { label: "Báo lên admin", color: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

function IncidentRow({ incident, onResolve, isActing }: {
  incident: Incident;
  onResolve: (id: string, note: string) => void;
  isActing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const type = INCIDENT_TYPES[incident.type];
  const status = STATUS_CONFIG[incident.status];
  const isEscalated = incident.status === "escalated";

  return (
    <div className={`rounded-xl border transition-colors ${isEscalated ? "border-red-500/40 bg-red-500/5" : "border-border bg-card"}`}>
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors rounded-xl"
      >
        <span className="text-xl shrink-0">{type.emoji}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{type.label}</p>
            {isEscalated && (
              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                <ShieldAlert className="h-3 w-3" />Cần xử lý
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{incident.description}</p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge className={status.color}>{status.label}</Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true, locale: vi })}
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {incident.vehiclePlate && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <Car className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono font-semibold">{incident.vehiclePlate}</span>
              </div>
            )}
            {incident.location && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <span className="text-sm">📍</span>
                <span className="text-sm">{incident.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{incident.reporterName}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{new Date(incident.createdAt).toLocaleString("vi-VN")}</span>
            </div>
          </div>

          {incident.resolvedNote && (
            <div className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                <span className="font-semibold">Ghi chú:</span> {incident.resolvedNote}
              </p>
            </div>
          )}

          {incident.status !== "resolved" && (
            <div className="space-y-2">
              <Textarea
                rows={2}
                placeholder="Ghi chú xử lý của admin..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                  disabled={isActing}
                  onClick={() => { onResolve(incident.id, resolveNote || "Admin đã xử lý"); setExpanded(false); }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đánh dấu đã xử lý
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminIncidentsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents-admin"],
    queryFn: () => incidentService.getAll(), // no staffId = all
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      incidentService.resolve(id, note),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái sự cố!");
      queryClient.invalidateQueries({ queryKey: ["incidents-admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  const escalatedCount = incidents.filter((i) => i.status === "escalated").length;
  const openCount      = incidents.filter((i) => i.status === "open").length;
  const resolvedCount  = incidents.filter((i) => i.status === "resolved").length;

  const filtered = incidents.filter((i) => {
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    const matchSearch =
      !searchTerm ||
      i.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Sự Cố"
        description="Xem và xử lý các sự cố được bảo vệ báo cáo"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng sự cố", value: incidents.length, icon: AlertTriangle, color: "text-foreground", bg: "bg-muted" },
          { label: "Báo lên admin", value: escalatedCount, icon: ShieldAlert, color: escalatedCount > 0 ? "text-red-600" : "text-muted-foreground", bg: escalatedCount > 0 ? "bg-red-500/10" : "bg-muted" },
          { label: "Đang mở", value: openCount, icon: TrendingUp, color: openCount > 0 ? "text-amber-600" : "text-muted-foreground", bg: openCount > 0 ? "bg-amber-500/10" : "bg-muted" },
          { label: "Đã xử lý", value: resolvedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Escalated alert banner */}
      {escalatedCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/40 bg-red-500/8">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-red-700 dark:text-red-400">
              {escalatedCount} sự cố cần xử lý gấp
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              Bảo vệ đã báo lên cấp trên và đang chờ admin giải quyết
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/40 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 shrink-0"
            onClick={() => setFilterStatus("escalated")}
          >
            Xem ngay
          </Button>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Tìm theo biển số, mô tả, tên bảo vệ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "escalated", "open", "resolved"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}
              {s === "escalated" && escalatedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                  {escalatedCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents list */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-12 gap-3">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground">Không có sự cố nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((incident: Incident) => (
            <IncidentRow
              key={incident.id}
              incident={incident}
              isActing={resolveMutation.isPending}
              onResolve={(id, note) => resolveMutation.mutate({ id, note })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

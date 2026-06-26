"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftService } from "@/services/shift.service";
import { incidentService } from "@/services/incident.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  CalendarClock, Clock, CheckCircle2, AlertTriangle,
  BarChart3, CalendarDays, Sun, Sunrise, Sunset, Moon,
  PlayCircle, StopCircle, ClipboardList, ChevronDown,
  ChevronUp, Loader2, MessageSquare, History, ArrowRight,
} from "lucide-react";
import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { SHIFT_STATUS_LABELS, SHIFT_STATUS_COLORS, SHIFT_TYPE_COLORS } from "@/lib/constants";
import { toast } from "sonner";
import type { WorkShift, ShiftType } from "@/types";
import Link from "next/link";

const SHIFT_ICONS: Record<ShiftType, React.ComponentType<{ className?: string }>> = {
  morning: Sunrise, afternoon: Sun, evening: Sunset, night: Moon,
};

function dateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Hôm nay";
  if (isTomorrow(d)) return "Ngày mai";
  if (isYesterday(d)) return "Hôm qua";
  return format(d, "EEEE, dd/MM/yyyy", { locale: vi });
}

function shiftDuration(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 1440; // overnight
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

// ── Active Shift Panel ─────────────────────────────────────────
function ActiveShiftPanel({ shift, onEnd }: { shift: WorkShift; onEnd: () => void }) {
  const [showEndForm, setShowEndForm] = useState(false);
  const [handoverNote, setHandoverNote] = useState("");
  const queryClient = useQueryClient();

  const endMutation = useMutation({
    mutationFn: () => shiftService.confirmEnd(shift.id, handoverNote || undefined),
    onSuccess: () => {
      toast.success("Đã kết thúc ca làm việc!");
      queryClient.invalidateQueries({ queryKey: ["my-shifts"] });
      onEnd();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const Icon = SHIFT_ICONS[shift.type];

  return (
    <Card className="border-emerald-500/40 bg-emerald-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Ca đang hoạt động
          </CardTitle>
          <Badge className={SHIFT_STATUS_COLORS.active}>🟢 Đang trực</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/15">
            <Icon className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-base">{shift.name}</p>
            <p className="text-sm text-muted-foreground">
              {shift.startTime} – {shift.endTime} · {shiftDuration(shift.startTime, shift.endTime)} · {dateLabel(shift.date)}
            </p>
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Check-in", value: shift.totalCheckIns ?? 0, color: "text-emerald-600" },
            { label: "Check-out", value: shift.totalCheckOuts ?? 0, color: "text-blue-600" },
            { label: "Sự cố", value: shift.incidentCount ?? 0, color: shift.incidentCount ? "text-red-500" : "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-background border">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/staff/logs">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <ClipboardList className="h-3.5 w-3.5" />
              Xem nhật ký
            </Button>
          </Link>
          <Link href="/staff/incidents">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Báo sự cố
            </Button>
          </Link>
        </div>

        {/* End shift */}
        {!showEndForm ? (
          <Button
            variant="outline"
            className="w-full gap-2 border-red-500/30 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            onClick={() => setShowEndForm(true)}
          >
            <StopCircle className="h-4 w-4" />
            Kết thúc ca
          </Button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Ghi chú bàn giao <span className="text-muted-foreground">(tùy chọn)</span></Label>
              <Textarea
                rows={3}
                placeholder="VD: Xe 59F1-xxx đang chờ chủ xe, kiểm tra camera khu B trước khi bàn giao..."
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowEndForm(false)}>
                Hủy
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                disabled={endMutation.isPending}
                onClick={() => endMutation.mutate()}
              >
                {endMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
                Xác nhận kết thúc
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Upcoming Shift Card ────────────────────────────────────────
function UpcomingShiftCard({ shift, onStart, isStarting }: { shift: WorkShift; onStart: (id: string) => void; isStarting: boolean }) {

  const Icon = SHIFT_ICONS[shift.type];
  const isNow = isToday(parseISO(shift.date));

  return (
    <Card className={isNow ? "border-blue-500/30 bg-blue-500/5" : ""}>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${SHIFT_TYPE_COLORS[shift.type].split(" ")[0]}`}>
            <Icon className={`h-5 w-5 ${SHIFT_TYPE_COLORS[shift.type].split(" ")[1]}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{shift.name}</p>
              {isNow && <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 text-xs">Hôm nay</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              {shift.startTime} – {shift.endTime} · {shiftDuration(shift.startTime, shift.endTime)} · {dateLabel(shift.date)}
            </p>
          </div>
          <Badge className={SHIFT_STATUS_COLORS[shift.status]}>{SHIFT_STATUS_LABELS[shift.status]}</Badge>
        </div>

        {shift.notes && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="italic">{shift.notes}</span>
          </div>
        )}

        {isNow && (
          <Button
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onStart(shift.id)}
            disabled={isStarting}
          >
            {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Bắt đầu ca ngay
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── History Row ────────────────────────────────────────────────
function HistoryRow({ shift }: { shift: WorkShift }) {
  const [open, setOpen] = useState(false);
  const Icon = SHIFT_ICONS[shift.type];

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${SHIFT_TYPE_COLORS[shift.type].split(" ")[0]}`}>
          <Icon className={`h-4 w-4 ${SHIFT_TYPE_COLORS[shift.type].split(" ")[1]}`} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold">{shift.name}</p>
          <p className="text-xs text-muted-foreground">{dateLabel(shift.date)} · {shift.startTime}–{shift.endTime}</p>
        </div>
        <Badge className={`${SHIFT_STATUS_COLORS[shift.status]} mr-1`}>{SHIFT_STATUS_LABELS[shift.status]}</Badge>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Check-in", value: shift.totalCheckIns ?? "—" },
              { label: "Check-out", value: shift.totalCheckOuts ?? "—" },
              { label: "Sự cố", value: shift.incidentCount ?? "—" },
            ].map((s) => (
              <div key={s.label} className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-base font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          {shift.notes && (
            <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">{shift.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function MyShiftPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: allShifts = [], isLoading } = useQuery({
    queryKey: ["my-shifts", user?.id],
    queryFn: () => user ? shiftService.getStaffShiftHistory(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents", user?.id],
    queryFn: () => incidentService.getAll(user?.id),
    enabled: !!user,
  });

  const startMutation = useMutation({
    mutationFn: (shiftId: string) => shiftService.confirmStart(shiftId),
    onSuccess: () => {
      toast.success("Đã bắt đầu ca làm việc!");
      queryClient.invalidateQueries({ queryKey: ["my-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingSkeleton type="page" />;

  const today = format(new Date(), "yyyy-MM-dd");
  const activeShift  = allShifts.find((s) => s.status === "active");
  const todayShifts  = allShifts.filter((s) => s.date === today && s.status === "scheduled");
  const upcomingShifts = allShifts
    .filter((s) => s.date > today && s.status === "scheduled")
    .slice(0, 4);
  const historyShifts = allShifts
    .filter((s) => s.status === "completed" || s.status === "cancelled")
    .slice(0, 10);

  const totalHours = allShifts
    .filter((s) => s.status === "completed")
    .reduce((acc, s) => {
      const [sh, sm] = s.startTime.split(":").map(Number);
      const [eh, em] = s.endTime.split(":").map(Number);
      let mins = (eh * 60 + em) - (sh * 60 + sm);
      if (mins < 0) mins += 1440;
      return acc + mins / 60;
    }, 0);

  const openIncidents = incidents.filter((i) => i.status === "open").length;
  const totalCheckIns = allShifts
    .filter((s) => s.status === "completed" || s.status === "active")
    .reduce((acc, s) => acc + (s.totalCheckIns ?? 0), 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Ca Làm Của Tôi" description="Quản lý ca trực, bàn giao và theo dõi hoạt động" />

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Giờ đã làm", value: `${totalHours.toFixed(0)}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Tổng check-in", value: totalCheckIns, icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Ca hoàn thành", value: historyShifts.filter((s) => s.status === "completed").length, icon: CheckCircle2, color: "text-violet-600", bg: "bg-violet-500/10" },
          { label: "Sự cố đang mở", value: openIncidents, icon: AlertTriangle, color: openIncidents > 0 ? "text-amber-600" : "text-muted-foreground", bg: openIncidents > 0 ? "bg-amber-500/10" : "bg-muted" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active shift */}
      {activeShift && (
        <ActiveShiftPanel
          shift={activeShift}
          onEnd={() => queryClient.invalidateQueries({ queryKey: ["my-shifts"] })}
        />
      )}

      {/* Today's scheduled shifts */}
      {todayShifts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />Ca hôm nay
          </h3>
          {todayShifts.map((shift) => (
            <UpcomingShiftCard
              key={shift.id}
              shift={shift}
              isStarting={startMutation.isPending}
              onStart={(id) => startMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Upcoming shifts */}
      {upcomingShifts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />Ca sắp tới
          </h3>
          {upcomingShifts.map((shift) => (
            <UpcomingShiftCard
              key={shift.id}
              shift={shift}
              isStarting={false}
              onStart={(id) => startMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* No shifts today */}
      {!activeShift && todayShifts.length === 0 && upcomingShifts.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-10 gap-3 text-center">
            <CalendarClock className="h-12 w-12 text-muted-foreground/25" />
            <p className="font-semibold text-muted-foreground">Không có ca nào sắp tới</p>
            <p className="text-sm text-muted-foreground/70 max-w-xs">Liên hệ quản lý để được phân ca</p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {historyShifts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <History className="h-4 w-4" />Lịch sử ca
          </h3>
          <div className="space-y-2">
            {historyShifts.map((shift) => (
              <HistoryRow key={shift.id} shift={shift} />
            ))}
          </div>
          <Link href="/staff/logs">
            <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
              Xem toàn bộ nhật ký <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

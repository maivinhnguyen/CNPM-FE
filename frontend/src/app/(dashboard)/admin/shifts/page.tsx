"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftService } from "@/services/shift.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  CalendarDays, Clock, Users, UserPlus, UserMinus,
  ChevronLeft, ChevronRight, Plus, Activity,
  CheckCircle2, AlertCircle, Sun, Sunset, Moon, Sunrise,
  BarChart3, X,
} from "lucide-react";
import {
  SHIFT_TYPE_LABELS,
  SHIFT_TYPE_COLORS,
  SHIFT_STATUS_LABELS,
  SHIFT_STATUS_COLORS,
} from "@/lib/constants";
import { format, addDays, subDays, parseISO, isToday } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import type { WorkShift, ShiftType, User } from "@/types";

const SHIFT_ICONS: Record<ShiftType, React.ComponentType<{ className?: string }>> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

// Helper: get 7-day window starting from a base date
function getWeekDates(base: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(base, i));
}

function ShiftCard({
  shift,
  staffList,
  onAssign,
  onRemove,
  onUpdateNotes,
  isActing,
}: {
  shift: WorkShift;
  staffList: User[];
  onAssign: (shiftId: string, staffId: string) => void;
  onRemove: (shiftId: string, staffId: string) => void;
  onUpdateNotes: (shiftId: string, notes: string) => void;
  isActing: boolean;
}) {
  const [showAssign, setShowAssign] = useState(false);
  const [noteEdit, setNoteEdit] = useState(false);
  const [noteVal, setNoteVal] = useState(shift.notes ?? "");
  const Icon = SHIFT_ICONS[shift.type];

  const unassignedStaff = staffList.filter(
    (s) => !shift.staffIds.includes(s.id)
  );
  const isActive = shift.status === "active";
  const isCompleted = shift.status === "completed";

  return (
    <Card
      className={`transition-all ${
        isActive
          ? "border-emerald-500/40 bg-emerald-500/5"
          : isCompleted
          ? "opacity-75"
          : ""
      }`}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center h-9 w-9 rounded-lg ${SHIFT_TYPE_COLORS[shift.type].replace("text-", "bg-").split(" ")[0]}15`}
            >
              <Icon className={`h-4 w-4 ${SHIFT_TYPE_COLORS[shift.type].split(" ")[1]}`} />
            </div>
            <div>
              <p className="font-semibold text-sm">{shift.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {shift.startTime} – {shift.endTime}
              </p>
            </div>
          </div>
          <Badge className={SHIFT_STATUS_COLORS[shift.status]}>
            {isActive && <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />}
            {SHIFT_STATUS_LABELS[shift.status]}
          </Badge>
        </div>

        {/* Activity stats (active/completed) */}
        {(isActive || isCompleted) && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Check-in", value: shift.totalCheckIns ?? 0, color: "text-emerald-600" },
              { label: "Check-out", value: shift.totalCheckOuts ?? 0, color: "text-blue-600" },
              { label: "Sự cố", value: shift.incidentCount ?? 0, color: shift.incidentCount ? "text-red-600" : "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="text-center p-2 rounded-lg bg-muted/50">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Staff list */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Nhân viên ({shift.staffIds.length})
            </p>
            {!isCompleted && unassignedStaff.length > 0 && (
              <button
                onClick={() => setShowAssign(!showAssign)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" />
                Thêm
              </button>
            )}
          </div>

          {shift.staffNames.length === 0 ? (
            <p className="text-xs text-muted-foreground italic px-1">Chưa có nhân viên nào</p>
          ) : (
            <div className="space-y-1">
              {shift.staffNames.map((name, i) => (
                <div
                  key={shift.staffIds[i]}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/50 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {name.split(" ").pop()?.[0]}
                    </div>
                    <span className="text-sm">{name}</span>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => onRemove(shift.id, shift.staffIds[i])}
                      disabled={isActing}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick assign dropdown */}
          {showAssign && unassignedStaff.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              {unassignedStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { onAssign(shift.id, s.id); setShowAssign(false); }}
                  disabled={isActing}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {s.name.split(" ").pop()?.[0]}
                  </div>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {!noteEdit ? (
          <div className="flex items-start gap-2">
            <p className="text-xs text-muted-foreground flex-1 italic">
              {shift.notes ?? "Không có ghi chú"}
            </p>
            {!isCompleted && (
              <button onClick={() => setNoteEdit(true)} className="text-xs text-primary hover:underline shrink-0">
                {shift.notes ? "Sửa" : "Thêm ghi chú"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea rows={2} value={noteVal} onChange={(e) => setNoteVal(e.target.value)} className="text-sm" placeholder="Ghi chú ca làm..." />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setNoteEdit(false); setNoteVal(shift.notes ?? ""); }}>Hủy</Button>
              <Button size="sm" className="flex-1" onClick={() => { onUpdateNotes(shift.id, noteVal); setNoteEdit(false); }}>Lưu</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminShiftsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", type: "morning" as ShiftType, startTime: "06:00", endTime: "14:00", notes: "" });

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);

  const { data: allShifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => shiftService.getShifts(),
  });

  const { data: staffList = [], isLoading: staffLoading } = useQuery({
    queryKey: ["staff-list"],
    queryFn: shiftService.getStaffList,
  });

  const assignMutation = useMutation({
    mutationFn: ({ shiftId, staffId }: { shiftId: string; staffId: string }) =>
      shiftService.assignStaff(shiftId, staffId, user?.name ?? "Admin"),
    onSuccess: () => { toast.success("Đã phân công nhân viên!"); queryClient.invalidateQueries({ queryKey: ["shifts"] }); },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: ({ shiftId, staffId }: { shiftId: string; staffId: string }) =>
      shiftService.removeStaff(shiftId, staffId),
    onSuccess: () => { toast.success("Đã xóa nhân viên khỏi ca!"); queryClient.invalidateQueries({ queryKey: ["shifts"] }); },
    onError: (err: Error) => toast.error(err.message),
  });

  const notesMutation = useMutation({
    mutationFn: ({ shiftId, notes }: { shiftId: string; notes: string }) =>
      shiftService.updateNotes(shiftId, notes),
    onSuccess: () => { toast.success("Đã cập nhật ghi chú!"); queryClient.invalidateQueries({ queryKey: ["shifts"] }); },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      shiftService.createShift({ name: createForm.name || SHIFT_TYPE_LABELS[createForm.type], type: createForm.type, startTime: createForm.startTime, endTime: createForm.endTime, date: selectedDate, notes: createForm.notes }),
    onSuccess: () => {
      toast.success("Đã tạo ca làm việc!");
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setShowCreate(false);
      setCreateForm({ name: "", type: "morning", startTime: "06:00", endTime: "14:00", notes: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (shiftsLoading || staffLoading) return <LoadingSkeleton type="page" />;

  const shiftsOnDate = (allShifts ?? []).filter((s) => s.date === selectedDate);
  const activeShifts = (allShifts ?? []).filter((s) => s.status === "active");
  const unfilledShifts = (allShifts ?? []).filter((s) => s.status === "scheduled" && s.staffIds.length === 0);

  // Stats
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayShifts = (allShifts ?? []).filter((s) => s.date === todayStr);
  const totalCheckIns = todayShifts.reduce((acc, s) => acc + (s.totalCheckIns ?? 0), 0);

  const isActing = assignMutation.isPending || removeMutation.isPending || notesMutation.isPending;

  // Shift count per day for calendar dots
  const shiftCountByDate: Record<string, { total: number; unfilled: number }> = {};
  (allShifts ?? []).forEach((s) => {
    if (!shiftCountByDate[s.date]) shiftCountByDate[s.date] = { total: 0, unfilled: 0 };
    shiftCountByDate[s.date].total++;
    if (s.staffIds.length === 0 && s.status === "scheduled") shiftCountByDate[s.date].unfilled++;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Phân Ca Làm Việc" description="Quản lý lịch trực và giám sát hoạt động từng ca" />

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ca đang hoạt động", value: activeShifts.length, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Chưa phân nhân viên", value: unfilledShifts.length, icon: AlertCircle, color: unfilledShifts.length > 0 ? "text-red-500" : "text-muted-foreground", bg: unfilledShifts.length > 0 ? "bg-red-500/10" : "bg-muted" },
          { label: "Check-in hôm nay", value: totalCheckIns, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Tổng nhân viên", value: staffList.length, icon: Users, color: "text-violet-600", bg: "bg-violet-500/10" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${s.bg}`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Left: Weekly calendar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Lịch tuần
                </CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setBaseDate((d) => subDays(d, 7))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setBaseDate((d) => addDays(d, 7))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {weekDates.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const counts = shiftCountByDate[dateStr];
                const isSelected = dateStr === selectedDate;
                const isTodayDate = isToday(d);

                return (
                  <button key={dateStr} type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`text-center w-8 ${isTodayDate && !isSelected ? "font-bold text-primary" : ""}`}>
                        <p className="text-xs opacity-70">{format(d, "EEE", { locale: vi })}</p>
                        <p className="text-sm font-semibold">{format(d, "d")}</p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {counts ? (
                          <>
                            <span className={`text-xs ${isSelected ? "opacity-80" : "text-muted-foreground"}`}>
                              {counts.total} ca
                            </span>
                            {counts.unfilled > 0 && (
                              <span className={`text-xs ${isSelected ? "text-red-200" : "text-red-500"}`}>
                                {counts.unfilled} chưa có NV
                              </span>
                            )}
                          </>
                        ) : (
                          <span className={`text-xs ${isSelected ? "opacity-60" : "text-muted-foreground"}`}>Chưa có ca</span>
                        )}
                      </div>
                    </div>
                    {isTodayDate && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>Hôm nay</span>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Staff list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Danh sách nhân viên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {staffList.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {s.name.split(" ").pop()?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Shifts for selected date */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold capitalize">
                {isToday(parseISO(selectedDate)) ? "Hôm nay — " : ""}
                {format(parseISO(selectedDate), "EEEE, dd/MM/yyyy", { locale: vi })}
              </h2>
              <p className="text-sm text-muted-foreground">{shiftsOnDate.length} ca được lên lịch</p>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
              {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showCreate ? "Đóng" : "Tạo ca"}
            </Button>
          </div>

          {/* Create shift form */}
          {showCreate && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tạo ca làm mới — {format(parseISO(selectedDate), "dd/MM/yyyy")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Loại ca</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["morning", "afternoon", "evening", "night"] as ShiftType[]).map((t) => {
                        const Icon = SHIFT_ICONS[t];
                        return (
                          <button key={t} type="button"
                            onClick={() => {
                              const times: Record<ShiftType, [string, string]> = { morning: ["06:00", "14:00"], afternoon: ["14:00", "22:00"], evening: ["17:00", "23:00"], night: ["22:00", "06:00"] };
                              setCreateForm((f) => ({ ...f, type: t, startTime: times[t][0], endTime: times[t][1] }));
                            }}
                            className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs transition-all ${createForm.type === t ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/50"}`}>
                            <Icon className="h-3.5 w-3.5" />{SHIFT_TYPE_LABELS[t]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Giờ bắt đầu</Label>
                      <Input type="time" value={createForm.startTime} onChange={(e) => setCreateForm((f) => ({ ...f, startTime: e.target.value }))} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Giờ kết thúc</Label>
                      <Input type="time" value={createForm.endTime} onChange={(e) => setCreateForm((f) => ({ ...f, endTime: e.target.value }))} className="h-8 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tên ca (tùy chọn)</Label>
                  <Input placeholder={SHIFT_TYPE_LABELS[createForm.type]} value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ghi chú</Label>
                  <Textarea rows={2} placeholder="Ghi chú cho ca này..." value={createForm.notes} onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))} className="text-sm" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Hủy</Button>
                  <Button className="flex-1" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
                    {createMutation.isPending ? "Đang tạo..." : "Tạo ca"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shifts list */}
          {shiftsOnDate.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center py-12 gap-3">
                <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Chưa có ca làm nào cho ngày này</p>
                <Button variant="outline" onClick={() => setShowCreate(true)} className="gap-2">
                  <Plus className="h-4 w-4" />Tạo ca đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {shiftsOnDate.map((shift: WorkShift) => (
                <ShiftCard key={shift.id} shift={shift} staffList={staffList as User[]}
                  isActing={isActing}
                  onAssign={(shiftId, staffId) => assignMutation.mutate({ shiftId, staffId })}
                  onRemove={(shiftId, staffId) => removeMutation.mutate({ shiftId, staffId })}
                  onUpdateNotes={(shiftId, notes) => notesMutation.mutate({ shiftId, notes })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

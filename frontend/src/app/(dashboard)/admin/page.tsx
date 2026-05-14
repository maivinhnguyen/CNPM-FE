"use client";

import { useQuery } from "@tanstack/react-query";
import { parkingService } from "@/services/parking.service";
import { useParkingStore } from "@/stores/parking-store";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Car,
  ParkingCircle,
  TrendingUp,
  Clock,
  Users,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminDashboardPage() {
  const { currentOccupancy, totalCapacity } = useParkingStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["parking-stats"],
    queryFn: parkingService.getStats,
  });

  const { data: hourlyData, isLoading: hourlyLoading } = useQuery({
    queryKey: ["hourly-data"],
    queryFn: parkingService.getHourlyData,
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ["daily-data"],
    queryFn: parkingService.getDailyData,
  });

  const isLoading = statsLoading || hourlyLoading || dailyLoading;

  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

  const occupancyPercent = Math.round(
    (currentOccupancy / totalCapacity) * 100
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều khiển Admin"
        description="Quản lý và phân tích bãi xe thời gian thực"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng xe hôm nay"
          value={stats?.totalToday ?? 0}
          icon={Car}
          trend={{ value: 12, isPositive: true }}
          description="Lượt vào bãi hôm nay"
          variant="blue"
        />
        <StatCard
          title="Đang đỗ"
          value={`${currentOccupancy} / ${totalCapacity}`}
          icon={ParkingCircle}
          description={`${occupancyPercent}% công suất sử dụng`}
          variant="green"
        />
        <StatCard
          title="Giờ cao điểm"
          value={stats?.peakHour ?? "—"}
          icon={TrendingUp}
          description="Lưu lượng cao nhất trong ngày"
          variant="orange"
        />
        <StatCard
          title="Thời gian gửi TB"
          value={stats?.averageDuration ?? "—"}
          icon={Clock}
          description="Thời gian gửi xe trung bình"
          variant="purple"
        />
      </div>

      {/* Occupancy Progress */}
      <Card className="card-glow border-0 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Mật độ xe thời gian thực
            </CardTitle>
            <span className={cn_occupancy_badge(occupancyPercent)}>
              {occupancyPercent >= 90 ? "🔴 Gần đầy" : occupancyPercent >= 70 ? "🟡 Đông" : "🟢 Bình thường"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                <span className="font-bold text-foreground">{currentOccupancy}</span> xe đang đỗ
              </span>
              <span className="font-bold text-lg">{occupancyPercent}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={cn_occupancy(occupancyPercent)}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 xe</span>
              <span>{totalCapacity} chỗ tối đa</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Activity Chart */}
        <Card className="card-glow border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Hoạt động hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="checkInGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.50 0.18 258)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="oklch(0.50 0.18 258)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="checkOutGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.58 0.17 155)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="oklch(0.58 0.17 155)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="checkIns" name="Vào"
                    stroke="oklch(0.50 0.18 258)" fill="url(#checkInGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="checkOuts" name="Ra"
                    stroke="oklch(0.58 0.17 155)" fill="url(#checkOutGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Overview Chart */}
        <Card className="card-glow border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Tổng quan tuần
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                  />
                  <Bar dataKey="total" name="Tổng số xe" fill="oklch(0.50 0.18 258)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn_occupancy(percent: number): string {
  const base = "h-full rounded-full transition-all duration-700";
  if (percent >= 90) return `${base} bg-gradient-to-r from-red-500 to-red-600`;
  if (percent >= 70) return `${base} bg-gradient-to-r from-amber-400 to-amber-500`;
  return `${base} bg-gradient-to-r from-emerald-400 to-emerald-500`;
}

function cn_occupancy_badge(percent: number): string {
  const base = "text-xs font-semibold px-3 py-1 rounded-full";
  if (percent >= 90) return `${base} bg-red-500/15 text-red-700 dark:text-red-400`;
  if (percent >= 70) return `${base} bg-amber-500/15 text-amber-700 dark:text-amber-400`;
  return `${base} bg-emerald-500/15 text-emerald-700 dark:text-emerald-400`;
}

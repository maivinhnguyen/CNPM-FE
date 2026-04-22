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
        title="Admin Dashboard"
        description="Real-time parking analytics and management"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Vehicles Today"
          value={stats?.totalToday ?? 0}
          icon={Car}
          trend={{ value: 12, isPositive: true }}
          description="Vehicles checked in today"
        />
        <StatCard
          title="Current Occupancy"
          value={`${currentOccupancy} / ${totalCapacity}`}
          icon={ParkingCircle}
          description={`${occupancyPercent}% capacity used`}
        />
        <StatCard
          title="Peak Hour"
          value={stats?.peakHour ?? "—"}
          icon={TrendingUp}
          description="Highest traffic period"
        />
        <StatCard
          title="Avg Duration"
          value={stats?.averageDuration ?? "—"}
          icon={Clock}
          description="Average parking time"
        />
      </div>

      {/* Occupancy Progress Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-Time Occupancy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {currentOccupancy} vehicles parked
              </span>
              <span className="font-medium">{occupancyPercent}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn_occupancy(occupancyPercent)}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{totalCapacity} spots</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient
                      id="checkInGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.588 0.243 264.376)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.588 0.243 264.376)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="checkOutGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.72 0.19 145)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.72 0.19 145)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="checkIns"
                    name="Check Ins"
                    stroke="oklch(0.588 0.243 264.376)"
                    fill="url(#checkInGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="checkOuts"
                    name="Check Outs"
                    stroke="oklch(0.72 0.19 145)"
                    fill="url(#checkOutGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Bar
                    dataKey="total"
                    name="Total Vehicles"
                    fill="oklch(0.588 0.243 264.376)"
                    radius={[6, 6, 0, 0]}
                  />
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
  const base = "h-full rounded-full transition-all duration-500";
  if (percent >= 90) return `${base} bg-destructive`;
  if (percent >= 70) return `${base} bg-amber-500`;
  return `${base} bg-emerald-500`;
}

"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import { vehicleService } from "@/services/vehicle.service";
import { parkingService } from "@/services/parking.service";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ParkingCircle, Clock, CheckCircle2 } from "lucide-react";
import { PARKING_STATUS_LABELS, PARKING_STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["my-vehicles", user?.id],
    queryFn: () => vehicleService.getMyVehicles(user!.id),
    enabled: !!user,
  });

  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ["my-parking", user?.id],
    queryFn: () => parkingService.getRecords(user?.id),
    enabled: !!user,
  });

  const isLoading = vehiclesLoading || recordsLoading;

  const activeParking = records?.filter((r) => r.status === "checked_in") ?? [];
  const recentRecords = records?.slice(0, 5) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="page" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ").pop()}`}
        description="Here's an overview of your parking activity"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Registered Vehicles"
          value={vehicles?.length ?? 0}
          icon={Car}
          description="Active vehicles"
        />
        <StatCard
          title="Currently Parked"
          value={activeParking.length}
          icon={ParkingCircle}
          description={
            activeParking.length > 0
              ? `Zone ${activeParking[0]?.zone}`
              : "No vehicle parked"
          }
        />
        <StatCard
          title="This Month"
          value={records?.length ?? 0}
          icon={Clock}
          description="Total parking sessions"
        />
        <StatCard
          title="Status"
          value={activeParking.length > 0 ? "Parked" : "Available"}
          icon={CheckCircle2}
          description={
            activeParking.length > 0
              ? `Since ${format(new Date(activeParking[0].checkInTime), "h:mm a")}`
              : "Ready to park"
          }
        />
      </div>

      {/* Active Parking */}
      {activeParking.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Currently Parked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeParking.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary font-mono text-sm font-bold">
                      {record.zone}
                    </div>
                    <div>
                      <p className="font-medium">{record.licensePlate}</p>
                      <p className="text-xs text-muted-foreground">
                        Checked in at{" "}
                        {format(new Date(record.checkInTime), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <Badge className={PARKING_STATUS_COLORS[record.status]}>
                    {PARKING_STATUS_LABELS[record.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Parking History</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No parking records yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {record.licensePlate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.checkInTime), "MMM d, yyyy")}
                        {" • "}
                        {format(new Date(record.checkInTime), "h:mm a")}
                        {record.checkOutTime &&
                          ` → ${format(new Date(record.checkOutTime), "h:mm a")}`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={PARKING_STATUS_COLORS[record.status]}
                  >
                    {PARKING_STATUS_LABELS[record.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

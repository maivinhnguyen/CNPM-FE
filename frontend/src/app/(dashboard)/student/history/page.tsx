"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import { parkingService } from "@/services/parking.service";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";
import { PARKING_STATUS_LABELS, PARKING_STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";

export default function StudentHistoryPage() {
  const user = useAuthStore((s) => s.user);

  const { data: records, isLoading } = useQuery({
    queryKey: ["my-parking", user?.id],
    queryFn: () => parkingService.getRecords(user?.id),
    enabled: !!user,
  });

  if (isLoading) {
    return <LoadingSkeleton type="table" count={8} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parking History"
        description="View all your past parking sessions"
      />

      {records?.length === 0 ? (
        <EmptyState
          icon={History}
          title="No parking history"
          description="Your parking sessions will appear here"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono font-medium">
                      {record.licensePlate}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.checkInTime), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.checkInTime), "h:mm a")}
                    </TableCell>
                    <TableCell>
                      {record.checkOutTime
                        ? format(new Date(record.checkOutTime), "h:mm a")
                        : "—"}
                    </TableCell>
                    <TableCell>{record.zone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={PARKING_STATUS_COLORS[record.status]}
                      >
                        {PARKING_STATUS_LABELS[record.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { parkingService } from "@/services/parking.service";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PARKING_STATUS_LABELS, PARKING_STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";

export default function StaffLogsPage() {
  const { data: records, isLoading } = useQuery({
    queryKey: ["all-parking"],
    queryFn: () => parkingService.getRecords(),
  });

  if (isLoading) {
    return <LoadingSkeleton type="table" count={10} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Recent check-in and check-out activity"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Today&apos;s Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Owner</TableHead>
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
                    <div>
                      <p className="text-sm font-medium">{record.ownerName}</p>
                      {record.ownerStudentId && (
                        <p className="text-xs text-muted-foreground">
                          {record.ownerStudentId}
                        </p>
                      )}
                    </div>
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
    </div>
  );
}

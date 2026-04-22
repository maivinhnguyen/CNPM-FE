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

export default function AdminLogsPage() {
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
        title="System Logs"
        description="Complete parking activity log"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Parking Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {record.id}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {record.licensePlate}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{record.ownerName}</p>
                      {record.ownerStudentId && (
                        <p className="text-xs text-muted-foreground">
                          {record.ownerStudentId}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{record.staffName}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {format(new Date(record.checkInTime), "h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.checkInTime), "MMM d")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.checkOutTime ? (
                      <div>
                        <p className="text-sm">
                          {format(new Date(record.checkOutTime), "h:mm a")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(record.checkOutTime), "MMM d")}
                        </p>
                      </div>
                    ) : (
                      "—"
                    )}
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

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
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["all-parking"],
    queryFn: () => parkingService.getSessions(),
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
                <TableHead>Plate (In)</TableHead>
                <TableHead>Card</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono font-medium">
                    {session.plateIn ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {session.cardUid}
                  </TableCell>
                  <TableCell>
                    {format(new Date(session.checkInTime), "h:mm a")}
                  </TableCell>
                  <TableCell>
                    {session.checkOutTime
                      ? format(new Date(session.checkOutTime), "h:mm a")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={PARKING_STATUS_COLORS[session.status]}
                    >
                      {PARKING_STATUS_LABELS[session.status]}
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

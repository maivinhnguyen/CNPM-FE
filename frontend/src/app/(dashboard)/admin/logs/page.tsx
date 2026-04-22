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
        title="System Logs"
        description="Complete parking activity log"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Parking Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Card</TableHead>
                <TableHead>Plate (In)</TableHead>
                <TableHead>Plate (Out)</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {session.id}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {session.cardUid}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {session.plateIn ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {session.plateOut ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {format(new Date(session.checkInTime), "h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.checkInTime), "MMM d")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.checkOutTime ? (
                      <div>
                        <p className="text-sm">
                          {format(new Date(session.checkOutTime), "h:mm a")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.checkOutTime), "MMM d")}
                        </p>
                      </div>
                    ) : (
                      "—"
                    )}
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

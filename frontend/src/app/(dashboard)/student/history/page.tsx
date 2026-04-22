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

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["my-parking", user?.id],
    queryFn: () => parkingService.getSessions(user?.id),
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

      {sessions?.length === 0 ? (
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
                  <TableHead>Plate (In)</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Date</TableHead>
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
                      {format(new Date(session.checkInTime), "MMM d, yyyy")}
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
      )}
    </div>
  );
}

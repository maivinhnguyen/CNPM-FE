"use client";

import { useQuery } from "@tanstack/react-query";
import { vehicleService } from "@/services/vehicle.service";
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
import { format } from "date-fns";

export default function AdminVehiclesPage() {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["all-vehicles"],
    queryFn: vehicleService.getAllVehicles,
  });

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Management"
        description="View all registered vehicles in the system"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Brand / Model</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles?.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-bold">
                    {v.licensePlate}
                  </TableCell>
                  <TableCell>
                    {v.brand} {v.model}
                  </TableCell>
                  <TableCell>{v.color}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{v.ownerName}</p>
                      {v.ownerStudentId && (
                        <p className="text-xs text-muted-foreground">
                          {v.ownerStudentId}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(v.registeredAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        v.isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                      }
                    >
                      {v.isActive ? "Active" : "Inactive"}
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

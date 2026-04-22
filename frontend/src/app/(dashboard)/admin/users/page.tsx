"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS } from "@/lib/constants";
import { mockUsers, delay } from "@/mock/data";
import { format } from "date-fns";

async function getUsers() {
  await delay(500);
  return mockUsers;
}

export default function AdminUsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: getUsers,
  });

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all system users"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => {
                const initials = u.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {u.studentId ?? "—"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

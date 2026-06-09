"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { incidentService } from "@/services/incident.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Search, Car, User, CreditCard,
  CheckCircle2, XCircle, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function VehicleLookupPage() {
  const [query, setQuery] = useState("");
  const [searchPlate, setSearchPlate] = useState("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["vehicle-lookup", searchPlate],
    queryFn: () => incidentService.lookupVehicleByPlate(searchPlate),
    enabled: !!searchPlate,
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearchPlate(query.trim());
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Tra Cứu Xe"
        description="Tìm kiếm thông tin xe theo biển số đăng ký"
      />

      {/* Search bar */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10 h-11 text-sm font-mono uppercase"
                placeholder="Nhập biển số VD: 59F1-12345"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button className="h-11 px-6 gap-2" onClick={handleSearch} disabled={isFetching}>
              {isFetching ? "Đang tìm..." : <><Search className="h-4 w-4" />Tra cứu</>}
            </Button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mt-3">
            <p className="text-xs text-muted-foreground self-center">Tra nhanh:</p>
            {["59F1-12345", "51D3-11111", "59E1-22222"].map((plate) => (
              <button key={plate} type="button"
                onClick={() => { setQuery(plate); setSearchPlate(plate); }}
                className="text-xs px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 font-mono transition-colors">
                {plate}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && <LoadingSkeleton type="card" />}

      {searchPlate && !isLoading && data === null && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="flex flex-col items-center py-10 gap-3">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-500/10">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
            <p className="font-semibold text-red-600 dark:text-red-400">Không tìm thấy xe</p>
            <p className="text-sm text-muted-foreground text-center">
              Biển số <span className="font-mono font-semibold">{searchPlate}</span> chưa được đăng ký trong hệ thống
            </p>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs mt-1"
              onClick={() => toast.info("Yêu cầu chủ xe đăng ký thẻ tại văn phòng")}>
              Hướng dẫn đăng ký
            </Button>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          {/* Vehicle info */}
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4 text-emerald-600" />
                  Thông tin xe
                </CardTitle>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                  {data.vehicle.licensePlate}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Hãng xe", value: data.vehicle.brand },
                  { label: "Dòng xe", value: data.vehicle.model },
                  { label: "Màu sắc", value: data.vehicle.color },
                  { label: "Đăng ký", value: format(new Date(data.vehicle.registeredAt), "dd/MM/yyyy") },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs text-muted-foreground">
                  Xe {data.vehicle.isActive ? "đang hoạt động" : "đã ngưng"} trong hệ thống
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Owner info */}
          {data.owner && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Thông tin chủ xe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                    {data.owner.name.split(" ").pop()?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{data.owner.name}</p>
                    <p className="text-sm text-muted-foreground">{data.owner.email}</p>
                    {data.owner.studentId && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">{data.owner.studentId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/staff/incidents"
              className="flex-1 inline-flex items-center justify-center gap-2 text-sm h-10 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
            >
              <ChevronRight className="h-4 w-4" />
              Báo cáo sự cố với xe này
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searchPlate && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center py-12 gap-3 text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-muted">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-muted-foreground">Nhập biển số để tra cứu</p>
            <p className="text-sm text-muted-foreground/70 max-w-xs">
              Tra cứu thông tin chủ xe, trạng thái đăng ký và lịch sử ra vào
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

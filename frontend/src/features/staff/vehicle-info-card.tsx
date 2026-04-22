import { cn } from "@/lib/utils";
import { Car, User, Hash, Palette, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VehicleLookupResult } from "@/types";

interface VehicleInfoCardProps {
  vehicle: NonNullable<VehicleLookupResult["vehicle"]>;
  currentStatus?: string;
  variant?: "default" | "sidebar";
  className?: string;
}

export function VehicleInfoCard({
  vehicle,
  currentStatus,
  variant = "default",
  className,
}: VehicleInfoCardProps) {
  return (
    <div
      className={cn(
        variant === "sidebar" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4",
        className
      )}
    >
      {/* Vehicle Info */}
      <div
        className={cn(
          "rounded-xl border border-border bg-card space-y-3",
          variant === "sidebar" ? "p-3" : "p-4"
        )}
      >
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Vehicle Info
          </h4>
        </div>
        <div className="space-y-2">
          <div className="px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border">
            <span className="text-base font-bold font-mono tracking-wider">{vehicle.licensePlate}</span>
          </div>
          <InfoRow
            icon={Car}
            label="Model"
            value={`${vehicle.brand} ${vehicle.model}`}
          />
          <InfoRow icon={Palette} label="Color" value={vehicle.color} />
          {currentStatus && (
            <div className="pt-0.5">
              <Badge
                className={cn(
                  "text-xs h-5 px-1.5",
                  currentStatus === "checked_in"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                )}
              >
                {currentStatus === "checked_in" ? "Currently Parked" : "Not Parked"}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Student / Owner Info */}
      <div
        className={cn(
          "rounded-xl border border-border bg-card space-y-3",
          variant === "sidebar" ? "p-3" : "p-4"
        )}
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Student Info
          </h4>
        </div>
        <div className="space-y-2">
          <InfoRow icon={User} label="Name" value={vehicle.ownerName} />
          {vehicle.ownerStudentId && (
            <InfoRow
              icon={GraduationCap}
              label="Student ID"
              value={vehicle.ownerStudentId}
              mono
            />
          )}
          <div className="pt-0.5">
            <Badge
              className={cn(
                "text-xs h-5 px-1.5",
                vehicle.isRegistered
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-500/15 text-red-700 dark:text-red-400"
              )}
            >
              {vehicle.isRegistered ? "Registered" : "Not Registered"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground min-w-[60px]">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium",
          mono && "font-mono font-bold tracking-wide"
        )}
      >
        {value}
      </span>
    </div>
  );
}

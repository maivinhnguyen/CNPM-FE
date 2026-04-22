import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldAlert, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

type AlertType = "unregistered" | "face_mismatch" | "plate_mismatch";

interface AlertBannerProps {
  type: AlertType;
  onConfirm?: () => void;
  onReject: () => void;
  className?: string;
}

const alertConfig: Record<
  AlertType,
  {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  unregistered: {
    icon: AlertTriangle,
    title: "Unregistered Vehicle",
    description:
      "This license plate is not registered in the system. The vehicle owner needs to register through the student portal.",
    bgClass: "bg-red-500/10 dark:bg-red-500/15",
    borderClass: "border-red-500/40",
  },
  face_mismatch: {
    icon: ShieldAlert,
    title: "Rider Mismatch Detected",
    description:
      "The current rider does not match the check-in image. Verify the person's identity manually before proceeding.",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    borderClass: "border-amber-500/40",
  },
  plate_mismatch: {
    icon: ShieldX,
    title: "Plate Mismatch Detected",
    description:
      "The current license plate does not match the check-in image. Verify the plate manually.",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    borderClass: "border-amber-500/40",
  },
};

export function AlertBanner({
  type,
  onConfirm,
  onReject,
  className,
}: AlertBannerProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4",
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg shrink-0",
          type === "unregistered" ? "bg-red-500/20" : "bg-amber-500/20"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            type === "unregistered" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold",
            type === "unregistered" ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"
          )}>
            {config.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {config.description}
          </p>
          <div className="flex gap-3 mt-4">
            {onConfirm && (
              <Button
                variant="outline"
                size="sm"
                onClick={onConfirm}
                className="border-amber-500 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
              >
                Confirm Anyway
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              className="border-red-500 text-red-700 hover:bg-red-500/10 dark:text-red-400"
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

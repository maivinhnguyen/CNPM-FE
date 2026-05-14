import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "blue" | "green" | "orange" | "purple" | "default";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const isColored = variant !== "default";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-200",
        isColored
          ? `stat-card-${variant} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5`
          : "bg-card border border-border card-glow",
        className
      )}
    >
      {/* Background decorative circle */}
      {isColored && (
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      )}
      {isColored && (
        <div className="absolute -right-1 -bottom-6 h-16 w-16 rounded-full bg-white/5" />
      )}

      <div className="relative flex items-start justify-between">
        <div className="space-y-2.5">
          <p
            className={cn(
              "text-xs font-semibold tracking-wide uppercase",
              isColored ? "text-white/75" : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p
              className={cn(
                "text-3xl font-bold tracking-tight",
                isColored ? "text-white" : ""
              )}
            >
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                  isColored
                    ? "bg-white/20 text-white"
                    : trend.isPositive
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-red-500/15 text-red-700 dark:text-red-400"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p
              className={cn(
                "text-xs leading-relaxed",
                isColored ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {description}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex items-center justify-center h-12 w-12 rounded-2xl shrink-0",
            isColored ? "bg-white/20" : "bg-primary/10 text-primary"
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              isColored ? "text-white" : ""
            )}
          />
        </div>
      </div>
    </div>
  );
}

import { ParkingCircle } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.8_0.15_90/20%),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.7_0.2_250/15%),transparent_70%)]" />
        <div className="relative flex flex-col justify-center px-16 text-primary-foreground z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm">
              <ParkingCircle className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ParkSmart</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Smart Motorbike
            <br />
            Parking Management
          </h1>
          <p className="text-lg text-primary-foreground/75 max-w-md leading-relaxed">
            Streamline parking operations at your university with real-time
            tracking, QR-based check-in, and comprehensive analytics.
          </p>
          <div className="flex gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-primary-foreground/60">Parking Spots</p>
            </div>
            <div>
              <p className="text-3xl font-bold">2,000+</p>
              <p className="text-sm text-primary-foreground/60">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold">99.9%</p>
              <p className="text-sm text-primary-foreground/60">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}

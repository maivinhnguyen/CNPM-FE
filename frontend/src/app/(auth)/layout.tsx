import { ParkingCircle, Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Mobile logo bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-2.5 px-4 py-3 bg-primary text-primary-foreground">
        <ParkingCircle className="h-5 w-5" />
        <span className="text-sm font-bold tracking-tight">ParkSmart</span>
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.8_0.12_230/15%),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.5_0.1_230/10%),transparent_70%)]" />
        <div className="relative flex flex-col justify-center px-16 text-primary-foreground z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm">
              <ParkingCircle className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ParkSmart</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Secure Motorbike
            <br />
            Parking Management
          </h1>
          <p className="text-lg text-primary-foreground/75 max-w-md leading-relaxed">
            Streamline parking operations at your university with real-time
            camera verification, smart check-in, and comprehensive analytics.
          </p>
          <div className="flex items-center gap-3 mt-10 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm max-w-sm">
            <Shield className="h-5 w-5 text-primary-foreground/80 shrink-0" />
            <p className="text-sm text-primary-foreground/80">
              Enterprise-grade security with face &amp; plate verification
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 pt-16 lg:p-12 lg:pt-12 bg-background">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}

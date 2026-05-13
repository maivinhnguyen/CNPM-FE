import { ParkingCircle, Camera, CreditCard, BarChart2, Building2 } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Nhận dạng biển số",
    desc: "Camera AI tự động nhận diện và xác minh phương tiện ra vào",
  },
  {
    icon: CreditCard,
    title: "Thẻ RFID thông minh",
    desc: "Đăng ký và quản lý thẻ từ, vé tháng dễ dàng trên app",
  },
  {
    icon: BarChart2,
    title: "Thống kê realtime",
    desc: "Dashboard theo dõi lưu lượng, doanh thu và báo cáo chi tiết",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left: Brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col justify-between px-10 py-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d1f2d 0%, #112031 60%, #0a1a28 100%)" }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full gap-10">
          {/* Logo + badge */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500">
                <ParkingCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">ParkSmart</p>
                <p className="text-white/40 text-xs">Smart Parking System</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <Building2 className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Dành cho trường đại học</span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              <span className="text-white">Quản lý bãi xe</span>
              <br />
              <span className="text-emerald-400">tự động &amp; thông minh</span>
            </h1>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Giải pháp toàn diện giúp nhà trường kiểm soát ra vào, quản lý thẻ sinh viên và theo dõi hoạt động bãi xe theo thời gian thực.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3 flex-1">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 px-4 py-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-500/15 shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-xs text-white/20">© 2026 ParkSmart · Hệ thống quản lý bãi xe đại học</p>
        </div>
      </div>

      {/* ── Right: Form panel — force light mode via CSS vars ── */}
      <div
        className="flex-1 flex flex-col justify-center items-center bg-white px-8 py-12 lg:px-16"
        style={{
          "--input":            "oklch(0.92 0.008 240)",
          "--background":       "oklch(0.98 0.005 250)",
          "--foreground":       "oklch(0.18 0.02 240)",
          "--border":           "oklch(0.92 0.008 240)",
          "--muted-foreground": "oklch(0.48 0.025 240)",
          "--ring":             "oklch(0.45 0.1 230)",
          "--card":             "oklch(0.995 0.002 250)",
        } as React.CSSProperties}
      >
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden self-start">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-500">
            <ParkingCircle className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">ParkSmart</span>
        </div>
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}

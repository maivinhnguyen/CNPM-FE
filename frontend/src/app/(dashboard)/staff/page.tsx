"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useParkingStore } from "@/stores/parking-store";
import { parkingService } from "@/services/parking.service";
import { useCamera } from "@/hooks/use-camera";
import { useCaptureFrame } from "@/hooks/use-capture-frame";
import { CameraGrid } from "@/features/staff/camera-grid";
import { VehicleInfoCard } from "@/features/staff/vehicle-info-card";
import { AlertBanner } from "@/features/staff/alert-banner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  LogOut,
  Loader2,
  ParkingCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { VehicleLookupResult } from "@/types";
import { MockEventSimulator } from "@/features/staff/mock-event-simulator";

type FlowState =
  | "idle"
  | "lookup"
  | "review_checkin"
  | "review_checkout"
  | "capturing"
  | "alert";

export default function StaffCheckPage() {
  const user = useAuthStore((s) => s.user);
  const { incrementOccupancy, decrementOccupancy, currentOccupancy, totalCapacity } =
    useParkingStore();

  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [result, setResult] = useState<VehicleLookupResult | null>(null);
  const [alertType, setAlertType] = useState<
    "unregistered" | "face_mismatch" | "plate_mismatch" | null
  >(null);



  // Cameras
  const frontCamera = useCamera({ facingMode: "user" });
  const rearCamera = useCamera({ facingMode: "environment" });
  const { capture } = useCaptureFrame();

  // ── Lookup ──────────────────────────────────────────────

  const handleLookup = useCallback(async (plateStr: string) => {
    if (!plateStr) return;

    handleResetInternal();
    setFlowState("lookup");
    try {
      const lookupResult = await parkingService.lookupVehicle(plateStr);
      setResult(lookupResult);

      if (!lookupResult.found) {
        setAlertType("unregistered");
        setFlowState("alert");
      } else if (lookupResult.currentStatus === "checked_in") {
        setFlowState("review_checkout");
      } else {
        setFlowState("review_checkin");
      }
    } catch {
      toast.error("Lookup failed");
      setFlowState("idle");
    }
  }, []);

  // 51D3-11111 = v3 (Pham Duc Huy, Honda Vision) — not currently parked → triggers check-in flow
  const handleMockCheckInSwipe = () => handleLookup("51D3-11111");
  // 59F1-12345 = v1 (Nguyen Van An, Honda Wave Alpha) — currently checked-in (record p1) → triggers checkout flow
  const handleMockCheckOutSwipe = () => handleLookup("59F1-12345");
  
  const handleResetInternal = () => {
    setFlowState("idle");
    setResult(null);
    setAlertType(null);
  };

  // ── Check-in ────────────────────────────────────────────

  const handleCheckIn = async () => {
    if (!result?.vehicle || !user) return;

    setFlowState("capturing");

    // Capture frames from both cameras
    const riderImage = capture(frontCamera.videoRef) ?? undefined;
    const plateImage = capture(rearCamera.videoRef) ?? undefined;

    try {
      await parkingService.checkIn(
        result.vehicle.id,
        result.vehicle.licensePlate,
        result.vehicle.ownerName,
        user.name,
        result.vehicle.ownerStudentId,
        riderImage,
        plateImage
      );
      incrementOccupancy();
      toast.success(`✅ ${result.vehicle.licensePlate} — Đã ghi nhận vào bãi`);
      handleResetInternal();
    } catch {
      toast.error("Check-in failed");
      setFlowState("review_checkin");
    }
  };

  // ── Check-out ───────────────────────────────────────────

  const handleCheckOut = async () => {
    if (!result?.lastRecord) return;

    setFlowState("capturing");
    try {
      await parkingService.checkOut(result.lastRecord.id);
      decrementOccupancy();
      toast.success(
        `✅ ${result.vehicle?.licensePlate} — Đã ghi nhận ra bãi`
      );
      setFlowState("idle");
      setResult(null);
    } catch {
      toast.error("Check-out failed");
      setFlowState("review_checkout");
    }
  };

  const handleMismatch = (type: "face_mismatch" | "plate_mismatch") => {
    setAlertType(type);
    setFlowState("alert");
  };

  // ── Reset ───────────────────────────────────────────────

  const handleReset = () => {
    handleResetInternal();
  };

  // ── Computed ────────────────────────────────────────────

  const isProcessing = flowState === "lookup" || flowState === "capturing";
  const showCameras = true; // Cameras are strictly camera-first layout now
  const showInfo = flowState === "review_checkin" || flowState === "review_checkout" || flowState === "alert";
  const showComparison =
    flowState === "review_checkout" &&
    result?.checkInImages;
  const showActions = showInfo || flowState === "capturing";
  const occupancyPercent = Math.round(
    (currentOccupancy / totalCapacity) * 100
  );

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      {/* Top bar: title + occupancy */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ParkingCircle className="h-5 w-5 text-primary" />
            Parking Gate
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Camera verification system
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Occupancy</span>
            <Badge
              variant="secondary"
              className={cn(
                "font-mono text-xs h-5 px-1.5",
                occupancyPercent >= 90 && "bg-red-500/15 text-red-700",
                occupancyPercent >= 70 &&
                  occupancyPercent < 90 &&
                  "bg-amber-500/15 text-amber-700",
                occupancyPercent < 70 &&
                  "bg-emerald-500/15 text-emerald-700"
              )}
            >
              {currentOccupancy}/{totalCapacity} ({occupancyPercent}%)
            </Badge>
          </div>
          <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden mt-1 ml-auto">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                occupancyPercent >= 90
                  ? "bg-red-500"
                  : occupancyPercent >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              )}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Camera Grid (3/4 of width) */}
        <div className="lg:col-span-3 min-h-0">
          <CameraGrid
            frontCamera={frontCamera}
            rearCamera={rearCamera}
            isCheckout={flowState === "review_checkout" || flowState === "alert"}
            storedPlateImage={result?.checkInImages?.plateImage}
          />
        </div>

        {/* Right: Control Sidebar (1/4 of width) */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          {/* Information Section */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {showInfo && result?.vehicle ? (
              <VehicleInfoCard
                vehicle={result.vehicle}
                currentStatus={result.currentStatus}
                variant="sidebar"
                className="animate-in fade-in slide-in-from-right-4 duration-300"
              />
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/20 text-center p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-50">
                    <LogIn className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    No Active Session
                  </p>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[180px] mx-auto">
                    Swipe a card to view vehicle and student information
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Alert Banner / Feedback */}
          {flowState === "alert" && alertType && (
            <div className="animate-in zoom-in-95 duration-300">
              <AlertBanner
                type={alertType}
                onConfirm={
                  alertType !== "unregistered"
                    ? () => {
                        setAlertType(null);
                        setFlowState("review_checkout");
                      }
                    : undefined
                }
                onReject={handleReset}
              />
            </div>
          )}

          {/* Action Area */}
          <div className="shrink-0 space-y-3 p-1">
            {showActions && (
              <div className="grid gap-3 animate-in slide-in-from-bottom-4 duration-300">
                {result?.currentStatus === "not_parked" ? (
                  <div className="grid gap-2">
                    <Button
                      onClick={handleCheckIn}
                      disabled={isProcessing}
                      className="h-14 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    >
                      {flowState === "capturing" ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <LogIn className="mr-2 h-5 w-5" />
                          CONFIRM CHECK IN
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleReset}
                      className="h-10 text-xs font-semibold uppercase tracking-widest"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Button
                      onClick={handleCheckOut}
                      disabled={isProcessing}
                      className="h-14 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                      {flowState === "capturing" ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="mr-2 h-5 w-5" />
                          CONFIRM CHECK OUT
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleMismatch("face_mismatch")}
                      className="h-12 text-xs font-bold uppercase tracking-widest border-amber-500/50 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
                    >
                      <AlertTriangle className="mr-1.5 h-4 w-4" />
                      Rider Mismatch
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleReset}
                      className="h-10 text-xs font-semibold uppercase tracking-widest"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Dev Toolkit Emulator */}
      <MockEventSimulator
        onCheckInSwipe={handleMockCheckInSwipe}
        onCheckOutSwipe={handleMockCheckOutSwipe}
        disabled={isProcessing}
      />
    </div>
  );
}

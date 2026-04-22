"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Camera, CameraOff } from "lucide-react";
import type { useCamera } from "@/hooks/use-camera";
import Image from "next/image";

interface CameraFeedProps {
  label: string;
  camera: ReturnType<typeof useCamera>;
  className?: string;
}

export function CameraFeed({ label, camera, className }: CameraFeedProps) {
  const { videoRef, isActive, isAvailable, error, start } = camera;

  // Auto-start camera on mount
  useEffect(() => {
    start();
  }, [start]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-black",
        isActive && "ring-2 ring-emerald-500/50",
        !isActive && !error && "ring-2 ring-border",
        error && "ring-2 ring-destructive/50",
        className
      )}
    >
      {/* Live video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          !isActive && "hidden"
        )}
      />

      {/* Placeholder when camera unavailable */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isAvailable && !error ? (
            /* Loading state */
            <div className="flex flex-col items-center gap-2 text-white/50">
              <Camera className="h-10 w-10 animate-pulse" />
              <span className="text-sm">Connecting...</span>
            </div>
          ) : (
            /* Camera unavailable — show placeholder */
            <>
              <Image
                src="/images/camera-placeholder.png"
                alt="Camera offline"
                fill
                className="object-cover opacity-60"
              />
              <div className="relative flex flex-col items-center gap-2 text-white/70 z-10">
                <CameraOff className="h-10 w-10" />
                <span className="text-sm font-medium">
                  {error || "Camera unavailable"}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Label overlay */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isActive
                ? "bg-emerald-400 animate-pulse"
                : "bg-red-400"
            )}
          />
          {label}
        </div>
      </div>

      {/* REC indicator when active */}
      {isActive && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-600/80 text-white text-xs font-bold">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        </div>
      )}
    </div>
  );
}

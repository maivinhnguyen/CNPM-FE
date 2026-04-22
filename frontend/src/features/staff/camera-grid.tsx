"use client";


import { cn } from "@/lib/utils";
import { CameraFeed } from "./camera-feed";
import type { useCamera } from "@/hooks/use-camera";
import { History, Video } from "lucide-react";

interface CameraGridProps {
  frontCamera: ReturnType<typeof useCamera>;
  rearCamera: ReturnType<typeof useCamera>;
  storedPlateImage?: string;
  isCheckout?: boolean;
}

export function CameraGrid({
  frontCamera,
  rearCamera,
  storedPlateImage,
  isCheckout,
}: CameraGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {/* Top Row: Live Feeds */}
      <GridSlot
        type="live"
        label="Live Rider (Entrance)"
        camera={frontCamera}
      />
      <GridSlot
        type="live"
        label="Live Plate (Rear)"
        camera={rearCamera}
      />

      {/* Bottom Row: Stored plate for checkout comparison */}
      <div className="col-span-2">
        <GridSlot
          type="history"
          label="Stored Plate (Check-in)"
          imageSrc={isCheckout ? storedPlateImage : undefined}
        />
      </div>
    </div>
  );
}

function GridSlot({
  label,
  type,
  imageSrc,
  camera,
}: {
  label: string;
  type: "live" | "history";
  imageSrc?: string;
  camera?: ReturnType<typeof useCamera>;
}) {
  return (
    <div className="flex flex-col gap-1.5 h-full min-h-0">
      <div
        className={cn(
          "relative flex-1 overflow-hidden rounded-xl border-2 transition-all duration-300",
          type === "live"
            ? "border-emerald-500/20 bg-black"
            : imageSrc
              ? "border-blue-500/50 bg-black shadow-lg shadow-blue-500/10"
              : "border-dashed border-border bg-muted/30"
        )}
      >
        {type === "live" && camera ? (
          <>
            <CameraFeed label={label} camera={camera} className="border-0 ring-0 h-full w-full" />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-sm z-20">
              <Video className="h-3 w-3" />
              Live
            </div>
          </>
        ) : imageSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-sm z-20">
              <History className="h-3 w-3" />
              Stored
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
            <div className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider">
              Waiting for checkout comparison
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-center font-semibold text-muted-foreground/60 uppercase tracking-widest shrink-0">
        {label}
      </p>
    </div>
  );
}

import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Image from "next/image";

interface CheckInSuccessProps {
  licensePlate: string;
  capturedFaceImage?: string;
  capturedPlateImage?: string;
  timestamp: Date;
  zone?: string;
  onReset: () => void;
}

export function CheckInSuccess({
  licensePlate,
  capturedFaceImage,
  capturedPlateImage,
  timestamp,
  zone,
  onReset,
}: CheckInSuccessProps) {
  return (
    <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 p-6 space-y-5">
      {/* Success header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/20">
          <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            Đã ghi nhận vào bãi
          </h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-bold">{licensePlate}</span>
            {zone && ` — Zone ${zone}`}
            {" • "}
            {format(timestamp, "HH:mm:ss — dd/MM/yyyy")}
          </p>
        </div>
      </div>

      {/* Captured image previews */}
      {(capturedFaceImage || capturedPlateImage) && (
        <div className="grid grid-cols-2 gap-3">
          {capturedFaceImage && (
            <div className="space-y-1.5">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black ring-1 ring-border">
                <Image
                  src={capturedFaceImage}
                  alt="Captured face"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold uppercase">
                  Face Captured
                </div>
              </div>
            </div>
          )}
          {capturedPlateImage && (
            <div className="space-y-1.5">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black ring-1 ring-border">
                <Image
                  src={capturedPlateImage}
                  alt="Captured plate"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold uppercase">
                  Plate Captured
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next vehicle button */}
      <Button onClick={onReset} className="w-full h-14 text-lg font-semibold">
        <RotateCcw className="mr-2 h-5 w-5" />
        Next Vehicle
      </Button>
    </div>
  );
}

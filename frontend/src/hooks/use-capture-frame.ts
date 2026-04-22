"use client";

import { useCallback } from "react";

/**
 * Captures a single frame from a <video> element as a JPEG data URL.
 */
export function useCaptureFrame() {
  const capture = useCallback(
    (videoRef: React.RefObject<HTMLVideoElement | null>): string | null => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return null;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.85);
    },
    []
  );

  return { capture };
}

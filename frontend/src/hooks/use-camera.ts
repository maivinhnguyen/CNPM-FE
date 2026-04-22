"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isActive: boolean;
  isAvailable: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { facingMode = "user", width = 640, height = 480 } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setIsActive(true);
      setIsAvailable(true);
    } catch (err) {
      const message =
        err instanceof DOMException
          ? err.name === "NotAllowedError"
            ? "Camera permission denied"
            : err.name === "NotFoundError"
              ? "No camera found"
              : `Camera error: ${err.message}`
          : "Failed to access camera";

      setError(message);
      setIsAvailable(false);
      setIsActive(false);
    }
  }, [facingMode, width, height]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    videoRef,
    stream: streamRef.current,
    isActive,
    isAvailable,
    error,
    start,
    stop,
  };
}

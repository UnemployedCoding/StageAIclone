"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface GalleryDragSliderProps {
  beforeImage: string;
  afterImage: string;
  initialPosition?: number; // 0–100
}

export default function GalleryDragSlider({
  beforeImage,
  afterImage,
  initialPosition = 50,
}: GalleryDragSliderProps) {
  const { t } = useLanguage();
  const [sliderPos, setSliderPos] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPos = useCallback(
    (clientX: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return sliderPos;
      const x = clientX - rect.left;
      return Math.min(100, Math.max(0, (x / rect.width) * 100));
    },
    [sliderPos]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setSliderPos(getPos(e.clientX));
    },
    [isDragging, getPos]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      setSliderPos(getPos(e.touches[0].clientX));
    },
    [isDragging, getPos]
  );

  const stopDragging = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopDragging);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", stopDragging);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, stopDragging]);

  // Reset when images change
  useEffect(() => {
    setSliderPos(initialPosition);
  }, [beforeImage, afterImage, initialPosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ cursor: "col-resize" }}
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
        setSliderPos(getPos(e.clientX));
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        setSliderPos(getPos(e.touches[0].clientX));
      }}
    >
      {/* ── Before (empty) image — full background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={beforeImage}
          alt={t("gallery.originalRoom")}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority
          className="object-cover"
        />
      </div>

      {/* ── After (staged) image — clipped to right by clip-path ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <Image
          src={afterImage}
          alt={t("gallery.stagedRoom")}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority
          className="object-cover"
        />
      </div>

      {/* ── Divider line ── */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white z-20 pointer-events-none"
        style={{
          left: `${sliderPos}%`,
          transform: "translateX(-50%)",
          boxShadow: "0 0 6px rgba(0,0,0,0.5)",
        }}
      />

      {/* ── Drag handle ── */}
      <div
        className="absolute top-1/2 z-30 pointer-events-none"
        style={{
          left: `${sliderPos}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-xl">
          <svg className="w-3 h-3 text-slate-700 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <svg className="w-3 h-3 text-slate-700 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* ── Before / After labels ── */}
      <div className="absolute top-4 left-4 z-10 rounded-md bg-black/50 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-white pointer-events-none">
        {t("gallery.before")}
      </div>
      <div className="absolute top-4 right-4 z-10 rounded-md bg-black/50 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-white pointer-events-none">
        {t("gallery.after")}
      </div>
    </div>
  );
}

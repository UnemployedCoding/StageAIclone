"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import GalleryDragSlider from "./GalleryDragSlider";

// ─── Data ────────────────────────────────────────────────────────────────────

const ROOM_TABS = [
  { id: "living-room", label: "Living Rooms" },
  { id: "bedroom", label: "Bedrooms" },
  { id: "kitchen", label: "Kitchens" },
  { id: "home-office", label: "Home Offices" },
  { id: "dining-room", label: "Dining Rooms" },
  { id: "outdoor", label: "Outdoors" },
];

const STYLE_PILLS = [
  { id: "original", label: "Original" },
  { id: "modern", label: "Modern" },
  { id: "scandinavian", label: "Scandinavian" },
  { id: "midcentury", label: "Midcentury" },
  { id: "luxury", label: "Luxury" },
  { id: "coastal", label: "Coastal" },
  { id: "farmhouse", label: "Farmhouse" },
];

const ASSET_HASHES: Record<string, string> = {
  "bedroom-empty": "cd1cbaa3",
  "bedroom-modern": "716537fd",
  "bedroom-scandinavian": "a97964fa",
  "bedroom-midcentury": "e83bb0c5",
  "bedroom-luxury": "1e82d7ed",
  "bedroom-coastal": "9c00805f",
  "bedroom-farmhouse": "b560a658",
  "living-room-empty": "33d43674",
  "living-room-modern": "c831fe91",
  "living-room-scandinavian": "9495b32c",
  "living-room-midcentury": "96596aa7",
  "living-room-luxury": "ec21bc78",
  "living-room-coastal": "23757a09",
  "living-room-farmhouse": "ebf3b249",
  "kitchen-empty": "10abcb2a",
  "kitchen-modern": "059f756d",
  "kitchen-scandinavian": "0573aa31",
  "kitchen-midcentury": "26718de3",
  "kitchen-luxury": "292527e2",
  "kitchen-coastal": "8bbdbd89",
  "kitchen-farmhouse": "8788a857",
  "home-office-empty": "16f9d753",
  "home-office-modern": "30953252",
  "home-office-scandinavian": "ff6268b7",
  "home-office-midcentury": "1f60a9b5",
  "home-office-luxury": "dad8bea5",
  "home-office-coastal": "00c7ed28",
  "home-office-farmhouse": "599a72b9",
  "dining-room-empty": "933e30f9",
  "dining-room-modern": "605d88d7",
  "dining-room-scandinavian": "b55af28f",
  "dining-room-midcentury": "0fb0f1a4",
  "dining-room-luxury": "5d7a88ef",
  "dining-room-coastal": "4eef98ee",
  "dining-room-farmhouse": "935c1ba2",
  "outdoor-empty": "d1b88590",
  "outdoor-modern": "2731bda0",
  "outdoor-scandinavian": "98b14dcf",
  "outdoor-midcentury": "abf299ea",
  "outdoor-luxury": "d0409e92",
  "outdoor-coastal": "1a55c69a",
  "outdoor-farmhouse": "b662720d",
};

function imgPath(room: string, style: string) {
  const key = style === "original" ? `${room}-empty` : `${room}-${style}`;
  return `/demo/${key}.${ASSET_HASHES[key]}.webp`;
}

// Build a flat list of all gallery thumbnails — one per room × style combo
const GALLERY_ITEMS = ROOM_TABS.flatMap((room) =>
  STYLE_PILLS.slice(1).map((style) => ({
    id: `${room.id}-${style.id}`,
    room: room.id,
    style: style.id,
    thumbnail: imgPath(room.id, style.id),
    empty: imgPath(room.id, "original"),
  }))
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function GallerySection() {
  const [activeRoom, setActiveRoom] = useState("living-room");
  const [activeStyle, setActiveStyle] = useState("modern");
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Derive active gallery item
  const activeItem =
    GALLERY_ITEMS.find((i) => i.room === activeRoom && i.style === activeStyle) ??
    GALLERY_ITEMS[0];

  // Thumbnails for the currently active room tab
  const roomThumbs = GALLERY_ITEMS.filter((i) => i.room === activeRoom);

  const handleRoomChange = (roomId: string) => {
    setActiveRoom(roomId);
    // Keep same style if available, else fall back to first non-original
    setActiveStyle((prev) => prev);
    if (thumbsRef.current) {
      thumbsRef.current.scrollLeft = 0;
    }
  };

  const handleThumbClick = (item: typeof GALLERY_ITEMS[0]) => {
    setActiveRoom(item.room);
    setActiveStyle(item.style);
  };

  return (
    <section className="w-full bg-[#1b2034] text-white py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Heading ── */}
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            See the Transformation:{" "}
            <span className="font-normal">Before &amp; After Gallery</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg text-balance leading-relaxed">
            See how StageLumen transforms unappealing spaces into attractive,{" "}
            <strong className="text-white font-bold inline-block">listing‑ready homes in seconds.</strong>
          </p>
        </div>

        {/* ── Room Tab Pills ── */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-6">
          {ROOM_TABS.map((tab) => {
            const isActive = activeRoom === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleRoomChange(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-white text-slate-900 shadow"
                    : "bg-[#252c42] text-slate-300 hover:bg-[#2e3650] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Main Slider ── */}
        <div className="relative w-full rounded-2xl overflow-hidden aspect-[16/9] shadow-2xl">
          <GalleryDragSlider
            key={activeItem.id}
            beforeImage={activeItem.empty}
            afterImage={activeItem.thumbnail}
            initialPosition={50}
          />

          {/* ── Style pills overlay (bottom of image) ── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 flex-wrap justify-center px-4">
            {STYLE_PILLS.map((style) => {
              const isActive = activeStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    if (style.id === "original") return; // skip original as it's just empty
                    setActiveStyle(style.id);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-md"
                      : "bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
                  } ${style.id === "original" ? "hidden" : ""}`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Thumbnail Strip ── */}
        <div
          ref={thumbsRef}
          className="mt-4 flex gap-3 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {roomThumbs.map((item) => {
            const isActive = item.id === activeItem.id;
            return (
              <button
                key={item.id}
                onClick={() => handleThumbClick(item)}
                className={`relative flex-none w-28 sm:w-36 rounded-xl overflow-hidden transition-all duration-150 ${
                  isActive
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[#1b2034] opacity-100 scale-[1.03]"
                    : "opacity-50 hover:opacity-80"
                }`}
                style={{ aspectRatio: "4/3" }}
              >
                <Image
                  src={item.thumbnail}
                  alt={`${item.room} ${item.style}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}

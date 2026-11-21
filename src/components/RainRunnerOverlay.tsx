"use client";

import React from "react";
import { motion } from "framer-motion";
import { CloudRain, ShieldCheck } from "lucide-react";
import { StoryMood } from "@/types/story";

interface RainRunnerOverlayProps {
  mood: StoryMood;
  isShaking: boolean;
  isEnding?: boolean;
}

export default function RainRunnerOverlay({
  mood,
  isShaking,
  isEnding = false,
}: RainRunnerOverlayProps) {
  const isStormy = mood === "tense" || mood === "eerie";

  // Kecepatan langkah & gerakan makin cepat saat badai atau saat guncangan aksi berisiko
  const walkSpeed = isShaking ? 0.24 : isStormy ? 0.42 : 0.9;
  const leanAngle = isShaking ? -18 : isStormy ? -12 : -3;

  const statusLabel = isEnding
    ? mood === "calm"
      ? "Relawan tiba aman"
      : "Bertahan di lapangan"
    : isShaking
    ? "Bergegas menerjang!"
    : isStormy
    ? "Menembus guyuran hujan"
    : "Rintik mereda";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-20 hidden sm:flex flex-col items-end gap-1.5">
      {/* Badge status kecil di atas karakter */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/10 text-[11px] text-zinc-200 shadow-lg">
        {mood === "calm" && isEnding ? (
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
        ) : (
          <CloudRain
            className={`w-3 h-3 ${
              isStormy ? "text-sky-300" : "text-emerald-300"
            }`}
          />
        )}
        <span>{statusLabel}</span>
      </div>

      {/* Kotak animasi karakter kehujanan */}
      <div className="relative w-24 h-20 rounded-xl bg-zinc-950/65 backdrop-blur-sm border border-white/10 overflow-hidden shadow-xl flex items-end justify-center pb-2">
        {/* Rintik hujan lokal di sekitar karakter */}
        <span className="absolute top-1 left-3 w-px h-3.5 bg-sky-200/50 rotate-12 animate-pulse" />
        <span className="absolute top-3 left-8 w-px h-4 bg-sky-200/40 rotate-12" />
        <span className="absolute top-1.5 right-4 w-px h-3.5 bg-sky-200/50 rotate-12 animate-pulse" />

        {/* Garis tanah/pijakan */}
        <div className="absolute bottom-2 inset-x-3 h-px bg-white/15" />

        {/* Karakter Siluet / Jas Hujan Beranimasi */}
        <motion.svg
          viewBox="0 0 80 80"
          className="w-16 h-16 overflow-visible"
          animate={{
            y: isEnding && mood === "calm" ? [0, -1, 0] : [0, -4.5, 0],
            rotate: [leanAngle, leanAngle + (isStormy ? 2.5 : 1), leanAngle],
          }}
          transition={{
            duration: walkSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Kepala & Tudung Jas Hujan */}
          <circle cx="42" cy="20" r="9" fill="#1e293b" />
          <path
            d="M31 20 C31 11, 51 11, 53 21 L55 24 L31 23 Z"
            fill={
              mood === "calm"
                ? "#34d399"
                : mood === "tense"
                ? "#f59e0b"
                : "#818cf8"
            }
          />

          {/* Badan Jas Hujan */}
          <path
            d="M34 29 L50 29 L55 52 L31 52 Z"
            fill={
              mood === "calm"
                ? "#10b981"
                : mood === "tense"
                ? "#d97706"
                : "#6366f1"
            }
          />

          {/* Strip Reflektif */}
          <line
            x1="33"
            y1="43"
            x2="53"
            y2="43"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeOpacity="0.7"
          />

          {/* Kaki Kiri */}
          <motion.line
            x1="38"
            y1="52"
            x2="33"
            y2="68"
            stroke="#cbd5e1"
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={
              isEnding && mood === "calm"
                ? { x2: 35, y2: 68 }
                : { x2: [29, 45, 29], y2: [67, 65, 67] }
            }
            transition={{
              duration: walkSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Kaki Kanan */}
          <motion.line
            x1="46"
            y1="52"
            x2="51"
            y2="68"
            stroke="#94a3b8"
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={
              isEnding && mood === "calm"
                ? { x2: 47, y2: 68 }
                : { x2: [49, 33, 49], y2: [65, 67, 65] }
            }
            transition={{
              duration: walkSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.svg>
      </div>
    </div>
  );
}
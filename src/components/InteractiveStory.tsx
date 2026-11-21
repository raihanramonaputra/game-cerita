"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BookmarkCheck,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Shield,
  CloudRain,
  MapPin,
  Trophy,
  Lock,
  SlidersHorizontal,
  GitBranch,
} from "lucide-react";
import { INITIAL_SCENE_ID, STORY_SCENES } from "@/data/story";
import { Choice, StoryMood } from "@/types/story";
import Scene3DStage, { SceneVisualType } from "@/components/Scene3DStage";
import RainRunnerOverlay from "@/components/RainRunnerOverlay";

interface TacticalAction {
  id: string;
  title: string;
  situationNote: string;
  riskLabel: string;
  endingSceneId: string;
  iconType: "careful" | "bold" | "shelter";
}

interface SceneVisualMeta {
  locationLabel: string;
  weatherTag: string;
  bannerGradient: string;
  accentBorder: string;
  visualType: SceneVisualType;
}

interface DecisionLogItem {
  stage: string;
  label: string;
}

const ENDING_STORAGE_KEY = "misi_evakuasi_rawa_pening_unlocked_endings_v1";

const ALL_ENDING_IDS = Object.keys(STORY_SCENES).filter(
  (sceneId) => STORY_SCENES[sceneId]?.isEnding
);

const MOOD_STYLES: Record<StoryMood, string> = {
  calm: "from-slate-950 via-emerald-950/40 to-slate-950",
  tense: "from-slate-950 via-amber-950/35 to-zinc-950",
  eerie: "from-zinc-950 via-indigo-950/45 to-black",
};

const SCENE_VISUALS: Record<string, SceneVisualMeta> = {
  start: {
    locationLabel: "Pos Relawan Rawa Pening",
    weatherTag: "Awan Gelap • Angin Kencang",
    bannerGradient: "from-amber-950/80 via-slate-900 to-zinc-900",
    accentBorder: "border-amber-400/20",
    visualType: "station",
  },
  lake_rescue: {
    locationLabel: "Sektor Tengah Rawa",
    weatherTag: "Ombak Naik • Bahan Bakar Menipis",
    bannerGradient: "from-cyan-950/80 via-slate-900 to-zinc-900",
    accentBorder: "border-cyan-400/20",
    visualType: "lake",
  },
  hill_rescue: {
    locationLabel: "Jalur Bukit Timur",
    weatherTag: "Hujan Deras • Lereng Licin",
    bannerGradient: "from-indigo-950/80 via-slate-900 to-zinc-900",
    accentBorder: "border-indigo-400/25",
    visualType: "hill",
  },
  ending_safe_lake: {
    locationLabel: "Dermaga Utama",
    weatherTag: "Evakuasi Stabil • Aman",
    bannerGradient: "from-emerald-950/80 via-slate-900 to-zinc-900",
    accentBorder: "border-emerald-400/25",
    visualType: "safe",
  },
  ending_bold_lake: {
    locationLabel: "Dermaga Utama",
    weatherTag: "Lolos Cepat • Lambung Tergores",
    bannerGradient: "from-amber-950/80 via-stone-900 to-zinc-900",
    accentBorder: "border-amber-400/25",
    visualType: "hazard",
  },
  ending_safe_hill: {
    locationLabel: "Pos Bawah Bukit",
    weatherTag: "Turun Terkendali • Aman",
    bannerGradient: "from-emerald-950/80 via-slate-900 to-zinc-900",
    accentBorder: "border-emerald-400/25",
    visualType: "safe",
  },
  ending_bold_hill: {
    locationLabel: "Kaki Bukit Timur",
    weatherTag: "Lolos Cepat • Basah Kuyup",
    bannerGradient: "from-amber-950/80 via-stone-900 to-zinc-900",
    accentBorder: "border-amber-400/25",
    visualType: "hazard",
  },
  ending_storm_delay: {
    locationLabel: "Titik Berlindung Darurat",
    weatherTag: "Menunggu Cuaca Mereda",
    bannerGradient: "from-slate-800/80 via-indigo-950/70 to-zinc-900",
    accentBorder: "border-sky-400/20",
    visualType: "shelter",
  },
};

const DEFAULT_VISUAL: SceneVisualMeta = {
  locationLabel: "Kawasan Rawa Pening",
  weatherTag: "Pemantauan Cuaca",
  bannerGradient: "from-slate-900 via-zinc-900 to-black",
  accentBorder: "border-white/10",
  visualType: "station",
};

const BGM_SRC = "/audio/lagu-latar.mp3";
const STORM_SRC = "/audio/badai.mp3";

const RAIN_STREAKS = [
  { left: "6%", delay: 0.1, duration: 0.75, opacity: 0.25 },
  { left: "14%", delay: 0.4, duration: 0.65, opacity: 0.35 },
  { left: "22%", delay: 0.2, duration: 0.8, opacity: 0.2 },
  { left: "31%", delay: 0.6, duration: 0.68, opacity: 0.32 },
  { left: "40%", delay: 0.15, duration: 0.72, opacity: 0.28 },
  { left: "49%", delay: 0.5, duration: 0.62, opacity: 0.38 },
  { left: "58%", delay: 0.3, duration: 0.78, opacity: 0.22 },
  { left: "67%", delay: 0.7, duration: 0.66, opacity: 0.34 },
  { left: "76%", delay: 0.25, duration: 0.74, opacity: 0.26 },
  { left: "85%", delay: 0.45, duration: 0.64, opacity: 0.36 },
  { left: "93%", delay: 0.35, duration: 0.76, opacity: 0.24 },
];

const TACTICAL_ACTIONS_BY_ROUTE: Record<string, TacticalAction[]> = {
  lake: [
    {
      id: "lake_careful",
      title: "Pasang pelampung cadangan & ikat tali gandeng sebelum bergerak",
      situationNote:
        "Memakan waktu ekstra sekitar 3 menit, tapi perahu tetap stabil meski ombak menghantam dari samping.",
      riskLabel: "Risiko Rendah • Stabil",
      endingSceneId: "ending_safe_lake",
      iconType: "careful",
    },
    {
      id: "lake_bold",
      title: "Langsung pacu gas menerobos gelombang menuju dermaga",
      situationNote:
        "Tercepat mencapai daratan sebelum badai puncak, namun lambung perahu berisiko terhantam keras.",
      riskLabel: "Risiko Tinggi • Cepat",
      endingSceneId: "ending_bold_lake",
      iconType: "bold",
    },
    {
      id: "lake_shelter",
      title: "Menepi ke balik gugusan enceng gondok & pasang jangkar darurat",
      situationNote:
        "Menghindari gelombang terbuka di tengah danau sambil menunggu angin sedikit mereda.",
      riskLabel: "Aman Berteduh • Tertunda",
      endingSceneId: "ending_storm_delay",
      iconType: "shelter",
    },
  ],
  hill: [
    {
      id: "hill_careful",
      title: "Pasang penyangga kaki & atur langkah perlahan berpegangan pada akar",
      situationNote:
        "Langkah lebih lambat di jalur basah, tetapi mengurangi kemungkinan terpeleset lebih jauh.",
      riskLabel: "Risiko Rendah • Terukur",
      endingSceneId: "ending_safe_hill",
      iconType: "careful",
    },
    {
      id: "hill_bold",
      title: "Turun cepat memotong jalur pintas sebelum hujan makin deras",
      situationNote:
        "Mempersingkat waktu di lereng, tetapi tanah basah dan batu licin menuntut keseimbangan penuh.",
      riskLabel: "Risiko Tinggi • Cepat",
      endingSceneId: "ending_bold_hill",
      iconType: "bold",
    },
    {
      id: "hill_shelter",
      title: "Berteduh di bawah ceruk batu besar & beri sinyal lokasi ke pos",
      situationNote:
        "Melindungi diri dari guyuran hujan lebat dan kilat sambil menunggu jalur aman.",
      riskLabel: "Aman Berteduh • Tertunda",
      endingSceneId: "ending_storm_delay",
      iconType: "shelter",
    },
  ],
};

function SceneVisualBanner({
  visual,
  mood,
}: {
  visual: SceneVisualMeta;
  mood: StoryMood;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${visual.accentBorder} bg-linear-to-r ${visual.bannerGradient} p-4 md:p-5 mb-6`}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], x: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/5 blur-2xl"
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{visual.locationLabel}</span>
          </div>
          <p className="text-xs text-zinc-400">{visual.weatherTag}</p>
          <p className="text-[11px] text-amber-300/80">
            {mood === "calm"
              ? "Rintik mereda • Drag objek 3D untuk memutar sudut pandang"
              : "Sosok ber-jas hujan diterpa hujan • Drag objek 3D untuk memutar"}
          </p>
        </div>

        <Scene3DStage visualType={visual.visualType} mood={mood} />
      </div>
    </div>
  );
}

export default function InteractiveStory() {
  const [currentSceneId, setCurrentSceneId] = useState<string>(INITIAL_SCENE_ID);
  const [clues, setClues] = useState<string[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLogItem[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bgmVolume, setBgmVolume] = useState<number>(0.3);
  const [stormVolume, setStormVolume] = useState<number>(0.45);
  const [isMixerOpen, setIsMixerOpen] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>("");
  const [unlockedEndings, setUnlockedEndings] = useState<string[]>([]);

  const [activeRoute, setActiveRoute] = useState<"lake" | "hill" | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const stormAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasInteractedRef = useRef<boolean>(false);

  const currentScene = STORY_SCENES[currentSceneId];
  const isStormy = currentScene.mood === "tense" || currentScene.mood === "eerie";
  const currentVisual = SCENE_VISUALS[currentScene.id] ?? DEFAULT_VISUAL;
  const isTyping =
    !activeRoute && displayedText.length < currentScene.narration.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(ENDING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUnlockedEndings(
            parsed.filter((id): id is string => typeof id === "string")
          );
        }
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, []);

  useEffect(() => {
    if (!currentScene.isEnding || typeof window === "undefined") return;
    setUnlockedEndings((prev) => {
      if (prev.includes(currentScene.id)) return prev;
      const updated = [...prev, currentScene.id];
      try {
        window.localStorage.setItem(ENDING_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Abaikan jika gagal menyimpan ke localStorage
      }
      return updated;
    });
  }, [currentScene.id, currentScene.isEnding]);

  const triggerScreenShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 420);
  };

  const syncDualAudio = useCallback(
    (mood: StoryMood) => {
      if (typeof window === "undefined") return;

      if (!bgmAudioRef.current) {
        const bgm = new Audio(BGM_SRC);
        bgm.loop = true;
        bgmAudioRef.current = bgm;
      }

      if (!stormAudioRef.current) {
        const storm = new Audio(STORM_SRC);
        storm.loop = true;
        stormAudioRef.current = storm;
      }

      const moodBgmMultiplier = mood === "calm" ? 1.05 : 0.85;
      const moodStormMultiplier =
        mood === "tense" ? 1.15 : mood === "eerie" ? 0.95 : 0.35;

      bgmAudioRef.current.volume = Math.min(
        1,
        Math.max(0, bgmVolume * moodBgmMultiplier)
      );
      stormAudioRef.current.volume = Math.min(
        1,
        Math.max(0, stormVolume * moodStormMultiplier)
      );

      if (isMuted || !hasInteractedRef.current) {
        bgmAudioRef.current.pause();
        stormAudioRef.current.pause();
        return;
      }

      bgmAudioRef.current.play().catch(() => {});
      stormAudioRef.current.play().catch(() => {});
    },
    [bgmVolume, isMuted, stormVolume]
  );

  const playClickSound = (freq = 420) => {
    hasInteractedRef.current = true;
    syncDualAudio(currentScene.mood);

    if (isMuted || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Abaikan jika efek klik tidak didukung
    }
  };

  useEffect(() => {
    syncDualAudio(currentScene.mood);
  }, [currentScene.mood, syncDualAudio]);

  useEffect(() => {
    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current = null;
      }
      if (stormAudioRef.current) {
        stormAudioRef.current.pause();
        stormAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (activeRoute) return;
    setDisplayedText("");
    let index = 0;
    const text = currentScene.narration;
    const interval = setInterval(() => {
      index += 1;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [currentScene, activeRoute]);

  const handleSkipTypewriter = () => {
    if (isTyping) {
      setDisplayedText(currentScene.narration);
    }
  };

  const handleToggleMute = () => {
    hasInteractedRef.current = true;
    setIsMuted((prev) => !prev);
  };

  const handleChoice = (choice: Choice) => {
    playClickSound(480);
    setDecisionLogs((prev) => [
      ...prev,
      { stage: currentScene.chapter, label: choice.label },
    ]);
    if (choice.clueObtained && !clues.includes(choice.clueObtained)) {
      setClues((prev) => [...prev, choice.clueObtained!]);
    }

    if (choice.nextSceneId === "ending_safe_lake") {
      setActiveRoute("lake");
      return;
    }
    if (choice.nextSceneId === "ending_safe_hill") {
      setActiveRoute("hill");
      return;
    }

    setCurrentSceneId(choice.nextSceneId);
  };

  const handleSelectTacticalAction = (action: TacticalAction) => {
    if (action.iconType === "bold") {
      playClickSound(260);
      triggerScreenShake();
    } else {
      playClickSound(540);
    }

    setDecisionLogs((prev) => [
      ...prev,
      { stage: "Aksi Taktis Lapangan", label: action.title },
    ]);
    setActiveRoute(null);
    setCurrentSceneId(action.endingSceneId);
  };

  const handleRestart = () => {
    playClickSound(320);
    setCurrentSceneId(INITIAL_SCENE_ID);
    setClues([]);
    setDecisionLogs([]);
    setActiveRoute(null);
  };

  const renderActionIcon = (iconType: TacticalAction["iconType"]) => {
    if (iconType === "careful") {
      return <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
    }
    if (iconType === "bold") {
      return <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
    }
    return <CloudRain className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />;
  };

  const tacticalVisual: SceneVisualMeta =
    activeRoute === "lake"
      ? {
          locationLabel: "Sektor Tengah Rawa • Kontak Perahu",
          weatherTag: "Gelombang Tinggi • Keputusan Cepat",
          bannerGradient: "from-amber-950/85 via-cyan-950/60 to-zinc-900",
          accentBorder: "border-amber-400/25",
          visualType: "lake",
        }
      : {
          locationLabel: "Jalur Bukit Timur • Lereng Basah",
          weatherTag: "Guyuran Hujan • Pijakan Licin",
          bannerGradient: "from-amber-950/85 via-indigo-950/60 to-zinc-900",
          accentBorder: "border-amber-400/25",
          visualType: "hill",
        };

  return (
    <motion.div
      animate={
        isShaking
          ? { x: [0, -7, 7, -5, 5, -2, 0], y: [0, 3, -3, 2, -2, 0] }
          : { x: 0, y: 0 }
      }
      transition={{ duration: 0.38 }}
      className={`relative overflow-hidden min-h-screen w-full bg-linear-to-br ${
        MOOD_STYLES[currentScene.mood]
      } text-zinc-100 transition-colors duration-1000 flex flex-col justify-between p-5 md:p-10`}
    >
      {/* Layer Efek Cuaca: Rintik Hujan & Kilat Tipis */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {isStormy && (
          <motion.div
            animate={{
              opacity: [0, 0, 0.08, 0, 0.14, 0, 0],
            }}
            transition={{
              duration: 7.5,
              repeat: Infinity,
              repeatDelay: 2.5,
              times: [0, 0.1, 0.12, 0.14, 0.16, 0.2, 1],
            }}
            className="absolute inset-0 bg-sky-200"
          />
        )}

        {RAIN_STREAKS.map((streak, idx) => (
          <motion.span
            key={idx}
            style={{
              left: streak.left,
              opacity: isStormy ? streak.opacity : streak.opacity * 0.35,
            }}
            initial={{ y: "-12vh" }}
            animate={{ y: "110vh" }}
            transition={{
              duration: isStormy ? streak.duration : streak.duration * 1.6,
              delay: streak.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute top-0 w-px ${
              isStormy ? "h-12 bg-sky-200/60" : "h-7 bg-emerald-200/35"
            } rotate-12`}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-20 max-w-3xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold tracking-wider uppercase text-zinc-300">
            Misi Evakuasi Rawa Pening
          </span>
        </div>

        <div className="relative flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-amber-300 font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            {unlockedEndings.length}/{ALL_ENDING_IDS.length} Ending
          </span>

          <button
            type="button"
            onClick={() => {
              hasInteractedRef.current = true;
              setIsMixerOpen((prev) => !prev);
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            title="Pengaturan Volume Audio"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-300" />
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            title={isMuted ? "Nyalakan Suara" : "Matikan Suara"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ulangi
          </button>

          {/* Popover Audio Mixer */}
          {isMixerOpen && (
            <div className="absolute right-0 top-12 w-64 rounded-xl bg-zinc-950/95 backdrop-blur-md border border-white/15 p-4 shadow-2xl space-y-3 z-30">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Mixer Audio Ganda
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Lagu Latar</span>
                  <span>{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={bgmVolume}
                  onChange={(e) => {
                    hasInteractedRef.current = true;
                    setBgmVolume(parseFloat(e.target.value));
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Suara Badai</span>
                  <span>{Math.round(stormVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={stormVolume}
                  onChange={(e) => {
                    hasInteractedRef.current = true;
                    setStormVolume(parseFloat(e.target.value));
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl w-full mx-auto my-auto py-8">
        <AnimatePresence mode="wait">
          {activeRoute ? (
            <motion.div
              key={`tactical-${activeRoute}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="bg-zinc-900/75 backdrop-blur-md border border-amber-400/25 rounded-2xl p-6 md:p-9 shadow-2xl space-y-6"
            >
              <SceneVisualBanner
                visual={tacticalVisual}
                mood={currentScene.mood}
              />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                <Zap className="w-3.5 h-3.5" />
                Situasi Kritis • Pilih Tindakan di Lapangan
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {activeRoute === "lake"
                    ? "Ombak Meninggi di Dekat Perahu Pak Darma"
                    : "Hujan Deras Mengguyur Jalur Turun Bukit"}
                </h2>
                <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                  {activeRoute === "lake"
                    ? "Kamu berada persis di samping perahu yang mulai oleng. Cuaca makin gelap—tindakan mana yang akan kamu ambil sekarang?"
                    : "Sari mulai kedinginan dan pijakan tanah makin licin. Apa keputusanmu di posisi ini?"}
                </p>
              </div>

              <div className="space-y-3">
                {TACTICAL_ACTIONS_BY_ROUTE[activeRoute].map((action) => (
                  <motion.button
                    key={action.id}
                    type="button"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectTacticalAction(action)}
                    className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 transition flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3">
                      {renderActionIcon(action.iconType)}
                      <div className="space-y-1">
                        <div className="text-sm md:text-base font-semibold text-zinc-100 group-hover:text-white">
                          {action.title}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {action.situationNote}
                        </p>
                        <span className="inline-block pt-1 text-[11px] font-medium text-amber-300/90">
                          {action.riskLabel}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition shrink-0 mt-1" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45 }}
              className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-9 shadow-2xl"
            >
              <SceneVisualBanner
                visual={currentVisual}
                mood={currentScene.mood}
              />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium mb-4">
                {currentScene.isEnding ? (
                  currentScene.endingType === "good" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  )
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {currentScene.chapter}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-5">
                {currentScene.title}
              </h1>

              <div
                onClick={handleSkipTypewriter}
                title={isTyping ? "Klik untuk menampilkan teks penuh" : undefined}
                className={`mb-8 min-h-27.5 ${
                  isTyping ? "cursor-pointer" : ""
                }`}
              >
                <p className="text-zinc-300 text-base md:text-lg leading-relaxed">
                  {displayedText}
                </p>
                {isTyping && (
                  <span className="inline-block mt-2 text-[11px] text-amber-300/75">
                    Klik narasi untuk percepat teks
                  </span>
                )}
              </div>

              {!currentScene.isEnding ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                    Tentukan Langkahmu
                  </p>
                  {currentScene.choices.map((choice: Choice) => (
                    <motion.button
                      key={choice.id}
                      type="button"
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleChoice(choice)}
                      className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 transition flex items-center justify-between group"
                    >
                      <span className="text-sm md:text-base text-zinc-200 group-hover:text-white">
                        {choice.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition" />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="border-t border-white/10 pt-6 space-y-5">
                  {/* Decision Timeline / Jejak Keputusan */}
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                      Alur Keputusan ({decisionLogs.length} Tahap)
                    </p>
                    <ol className="space-y-2 text-sm text-zinc-300 border-l border-amber-400/30 ml-1.5 pl-4">
                      {decisionLogs.map((item, i) => (
                        <li key={i} className="space-y-0.5">
                          <span className="block text-[11px] font-mono uppercase tracking-wider text-amber-400/90">
                            {item.stage}
                          </span>
                          <span>{item.label}</span>
                        </li>
                      ))}
                      <li className="space-y-0.5 pt-0.5">
                        <span className="block text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                          Hasil Akhir
                        </span>
                        <span className="font-semibold text-white">
                          {currentScene.title}
                        </span>
                      </li>
                    </ol>
                  </div>

                  {/* Ending Tracker / Koleksi Akhir Cerita */}
                  <div className="bg-black/30 rounded-xl p-4 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Koleksi Ending
                      </span>
                      <span className="text-xs font-mono text-amber-300">
                        {unlockedEndings.length} / {ALL_ENDING_IDS.length}{" "}
                        Terbuka
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ALL_ENDING_IDS.map((endingId) => {
                        const endingScene = STORY_SCENES[endingId];
                        const isUnlocked = unlockedEndings.includes(endingId);
                        const isCurrent = currentScene.id === endingId;

                        return (
                          <div
                            key={endingId}
                            className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                              isUnlocked
                                ? isCurrent
                                  ? "bg-amber-500/15 border-amber-400/40 text-white"
                                  : "bg-emerald-500/10 border-emerald-500/25 text-zinc-200"
                                : "bg-white/[0.02] border-white/5 text-zinc-500"
                            }`}
                          >
                            {isUnlocked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                            )}
                            <span className="truncate">
                              {isUnlocked ? endingScene.title : "Ending Misterius"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Mainkan Ulang & Coba Jalur Lain
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Clue Inventory */}
      <footer className="relative z-10 max-w-3xl w-full mx-auto border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5 mr-2">
            <BookmarkCheck className="w-4 h-4 text-emerald-400" />
            Petunjuk Terkumpul:
          </span>
          {clues.length === 0 ? (
            <span className="text-xs text-zinc-600 italic">
              Belum ada petunjuk ditemukan
            </span>
          ) : (
            clues.map((clue) => (
              <span
                key={clue}
                className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs"
              >
                {clue}
              </span>
            ))
          )}
        </div>
      </footer>

      {/* Karakter Animasi Orang Kehujanan di Sudut Layar */}
      <RainRunnerOverlay
        mood={currentScene.mood}
        isShaking={isShaking}
        isEnding={currentScene.isEnding}
      />
    </motion.div>
  );
}
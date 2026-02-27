import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const RARITY_CONFIG = {
  common: {
    label: "Common",
    gradient: "from-gray-400 via-gray-300 to-gray-400",
    glow: "shadow-gray-400/40",
    glowColor: "rgba(156,163,175,0.5)",
    border: "border-gray-300",
    text: "text-gray-600",
    bg: "bg-gradient-to-br from-gray-100 to-gray-200",
    particleColor: "#9ca3af",
    defaultStars: 1,
    burstCount: 6,
    floatAmp: 4,
    floatSpeed: 3.5,
    ringSize: 240,
    bgGlow: false,
  },
  uncommon: {
    label: "Uncommon",
    gradient: "from-green-500 via-emerald-400 to-green-500",
    glow: "shadow-green-400/50",
    glowColor: "rgba(52,211,153,0.6)",
    border: "border-green-400",
    text: "text-green-600",
    bg: "bg-gradient-to-br from-green-50 to-emerald-100",
    particleColor: "#10b981",
    defaultStars: 2,
    burstCount: 10,
    floatAmp: 6,
    floatSpeed: 3.0,
    ringSize: 260,
    bgGlow: false,
  },
  rare: {
    label: "Rare",
    gradient: "from-blue-500 via-indigo-400 to-blue-500",
    glow: "shadow-blue-400/60",
    glowColor: "rgba(96,165,250,0.7)",
    border: "border-blue-400",
    text: "text-blue-600",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
    particleColor: "#3b82f6",
    defaultStars: 3,
    burstCount: 14,
    floatAmp: 8,
    floatSpeed: 2.5,
    ringSize: 280,
    bgGlow: true,
  },
  epic: {
    label: "Epic",
    gradient: "from-purple-600 via-fuchsia-500 to-purple-600",
    glow: "shadow-purple-500/70",
    glowColor: "rgba(168,85,247,0.7)",
    border: "border-purple-400",
    text: "text-purple-600",
    bg: "bg-gradient-to-br from-purple-50 to-fuchsia-100",
    particleColor: "#a855f7",
    defaultStars: 4,
    burstCount: 20,
    floatAmp: 10,
    floatSpeed: 2.0,
    ringSize: 310,
    bgGlow: true,
  },
  legendary: {
    label: "Legendary",
    gradient: "from-yellow-400 via-orange-400 to-yellow-400",
    glow: "shadow-yellow-400/80",
    glowColor: "rgba(251,191,36,0.8)",
    border: "border-yellow-400",
    text: "text-yellow-600",
    bg: "bg-gradient-to-br from-yellow-50 to-orange-100",
    particleColor: "#f59e0b",
    defaultStars: 5,
    burstCount: 28,
    floatAmp: 14,
    floatSpeed: 1.6,
    ringSize: 340,
    bgGlow: true,
  },
};

// Derive animation parameters from card stats + rarity
function getCardAnimParams(card, cfg) {
  const power = card.power ?? 50;
  const speed = card.speed ?? 50;
  const charm = card.charm ?? 50;
  const stars = card.stars ?? cfg.defaultStars;
  const rarityLevel = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 }[card.rarity] || 1;

  // Power → shake intensity on entry + glow pulse amplitude
  const shakeMagnitude = power >= 80 ? 6 : power >= 60 ? 3 : power >= 40 ? 1.5 : 0;
  const glowPulseScale = 1 + (power / 100) * 0.15;

  // Speed → animation durations (higher speed = faster transitions)
  const entryDuration = Math.max(0.3, 0.7 - (speed / 100) * 0.35);
  const floatSpeed = Math.max(1.2, cfg.floatSpeed - (speed / 100) * 1.2);
  const particleSpeed = Math.max(0.4, 0.9 - (speed / 100) * 0.45);

  // Charm → sparkle count & opacity
  const sparkleCount = Math.round(2 + (charm / 100) * (rarityLevel * 2));
  const sparkleOpacity = 0.5 + (charm / 100) * 0.5;

  // Stars → float amplitude & particle distance
  const floatAmp = cfg.floatAmp + (stars - 1) * 1.5;
  const particleDist = 100 + stars * 20 + (power / 100) * 60;

  // High power: stat bars pulse after filling
  const statPulse = power >= 70;
  const statBarColor =
    power >= 80 ? "from-red-500 to-orange-500" :
    power >= 60 ? "from-violet-500 to-indigo-500" :
    power >= 40 ? "from-blue-400 to-cyan-400" :
                  "from-gray-400 to-gray-500";

  const speedBarColor =
    speed >= 80 ? "from-yellow-400 to-green-400" :
    speed >= 50 ? "from-cyan-400 to-blue-500" :
                  "from-gray-400 to-gray-500";

  const charmBarColor =
    charm >= 80 ? "from-pink-500 to-rose-500" :
    charm >= 50 ? "from-fuchsia-400 to-violet-500" :
                  "from-gray-400 to-gray-500";

  return {
    shakeMagnitude, glowPulseScale, entryDuration, floatSpeed, particleSpeed,
    sparkleCount, sparkleOpacity, floatAmp, particleDist, statPulse,
    statBarColor, speedBarColor, charmBarColor, stars,
  };
}

function ParticleBurst({ rarity, params }) {
  const cfg = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const count = cfg.burstCount;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
      {[...Array(count)].map((_, i) => {
        const angle = (360 / count) * i + Math.random() * 10;
        const dist = params.particleDist + Math.random() * 40;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        const size = 4 + Math.random() * 6;
        const delay = Math.random() * 0.1;
        const shapes = ["●", "★", "✦", "◆"];
        const shape = shapes[i % shapes.length];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0, x: tx, y: ty }}
            transition={{ duration: params.particleSpeed + Math.random() * 0.3, delay, ease: "easeOut" }}
            style={{
              position: "absolute", top: "50%", left: "50%",
              fontSize: size, color: cfg.particleColor, lineHeight: 1,
              translateX: "-50%", translateY: "-50%",
            }}
          >
            {shape}
          </motion.div>
        );
      })}
    </div>
  );
}

function SheenOverlay({ speed }) {
  const duration = Math.max(0.4, 0.8 - (speed / 100) * 0.4);
  return (
    <motion.div
      initial={{ x: "-120%", skewX: -20 }}
      animate={{ x: "220%" }}
      transition={{ delay: 0.3, duration, ease: "easeInOut" }}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)" }}
    />
  );
}

function StatBar({ label, value, delay = 0, barColor, statPulse }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 0.9 + delay, duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={statPulse && value >= 70 ? { opacity: [0, 1], scale: [0.8, 1.15, 1] } : { opacity: 1 }}
        transition={{ delay: 0.9 + delay + 0.4, duration: 0.4 }}
        className={`text-xs font-bold w-7 text-right ${value >= 80 ? "text-red-500" : value >= 60 ? "text-violet-600" : "text-gray-700"}`}
      >
        {value}
      </motion.span>
    </div>
  );
}

function RevealBanner({ rarity, params }) {
  const cfg = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const text =
    rarity === "legendary" ? "⚡ LEGENDARY ⚡" :
    rarity === "epic"      ? "✨ EPIC ✨" :
    rarity === "rare"      ? "💎 RARE 💎" :
    "NEW CARD!";
  return (
    <motion.div
      initial={{ scale: 2.5, opacity: 0 }}
      animate={{ scale: 1, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.1, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
    >
      <span
        className="font-black text-4xl uppercase tracking-widest drop-shadow-2xl"
        style={{ color: cfg.particleColor, textShadow: `0 0 30px ${cfg.glowColor}` }}
      >
        {text}
      </span>
    </motion.div>
  );
}

export default function CardReveal({ card, onClose }) {
  const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;
  const params = getCardAnimParams(card, rarity);
  const isHighRarity = card.rarity === "epic" || card.rarity === "legendary";

  // Power shake: high-power cards shake on entry
  const shakeAnim = params.shakeMagnitude > 0
    ? { x: [0, -params.shakeMagnitude, params.shakeMagnitude, -params.shakeMagnitude / 2, params.shakeMagnitude / 2, 0] }
    : {};

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        {/* Background pulse ring — size scales with stars */}
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: [0, 3, 4], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: rarity.ringSize,
            height: rarity.ringSize,
            background: `radial-gradient(circle, ${rarity.glowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Rotating ring — only rare+ */}
        {card.rarity === "legendary" && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 340, height: 340,
              background: "conic-gradient(from 0deg, #f59e0b, #ef4444, #a855f7, #3b82f6, #10b981, #f59e0b)",
              opacity: 0.35, filter: "blur(12px)",
            }}
          />
        )}
        {card.rarity === "epic" && (
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 310, height: 310,
              background: "conic-gradient(from 0deg, #a855f7, #ec4899, #a855f7)",
              opacity: 0.3, filter: "blur(10px)",
            }}
          />
        )}
        {card.rarity === "rare" && (
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ rotate: { duration: 7, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 280, height: 280,
              background: "conic-gradient(from 0deg, #3b82f6, #6366f1, #3b82f6)",
              opacity: 0.2, filter: "blur(10px)",
            }}
          />
        )}

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <ParticleBurst rarity={card.rarity} params={params} />
          <RevealBanner rarity={card.rarity} params={params} />

          {/* Card flip-in — speed controls entry duration */}
          <motion.div
            initial={{ rotateY: 90, scale: 0.6, opacity: 0, y: 40 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15, duration: params.entryDuration }}
            style={{ perspective: 1200 }}
          >
            {/* Power shake after reveal */}
            <motion.div
              animate={params.shakeMagnitude > 0 ? { ...shakeAnim } : {}}
              transition={{ delay: 0.5, duration: 0.4, ease: "easeInOut" }}
            >
              {/* Float — amplitude from stars, speed from speed stat */}
              <motion.div
                animate={{ y: [0, -params.floatAmp, 0] }}
                transition={{ duration: params.floatSpeed, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              >
                {/* Glow shadow */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.5 }}
                  animate={{
                    opacity: [0, 0.6, 0.4],
                    scaleX: [0.5, 1, 0.9],
                    // Power pulse on the glow
                    scale: params.shakeMagnitude > 0
                      ? [1, params.glowPulseScale, 1]
                      : 1,
                  }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-60 h-8 rounded-full pointer-events-none"
                  style={{ background: rarity.glowColor, filter: "blur(12px)" }}
                />

                <div
                  className={`w-72 rounded-3xl border-2 ${rarity.border} shadow-2xl ${rarity.glow} overflow-hidden relative`}
                  style={{ boxShadow: `0 0 40px ${rarity.glowColor}, 0 20px 60px rgba(0,0,0,0.5)` }}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${rarity.gradient} px-4 py-3 flex items-center justify-between relative overflow-hidden`}>
                    <SheenOverlay speed={card.speed ?? 50} />
                    <div>
                      <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">{rarity.label}</p>
                      <h2 className="text-white font-black text-xl leading-tight">{card.character_name}</h2>
                    </div>
                    {/* Stars — animate faster for high-speed cards */}
                    <motion.div
                      className="flex items-center gap-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{
                            scale: i < params.stars ? 1 : 0.5,
                            rotate: 0,
                          }}
                          transition={{
                            delay: 0.4 + i * Math.max(0.04, 0.1 - (card.speed ?? 50) / 1000),
                            type: "spring",
                            stiffness: 300 + (card.speed ?? 50) * 2,
                          }}
                        >
                          <Star className={`w-4 h-4 ${i < params.stars ? "text-white fill-white" : "text-white/25"}`} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: params.entryDuration * 0.8 }}
                    className={`${rarity.bg} h-44 flex items-center justify-center relative overflow-hidden`}
                  >
                    {/* Radial shine — pulsing speed tied to charm */}
                    {rarity.bgGlow && (
                      <motion.div
                        animate={{ opacity: [0.3, 0.7 + (card.charm ?? 50) / 200, 0.3] }}
                        transition={{
                          duration: Math.max(1.0, 2.5 - (card.charm ?? 50) / 60),
                          repeat: Infinity, ease: "easeInOut",
                        }}
                        className="absolute inset-0"
                        style={{ background: `radial-gradient(circle at 50% 40%, ${rarity.glowColor} 0%, transparent 70%)` }}
                      />
                    )}
                    {card.image_url ? (
                      <img src={card.image_url} alt={card.character_name} className="w-full h-full object-cover relative z-10" />
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1 + (card.power ?? 50) / 600, 1] }}
                        transition={{ duration: params.floatSpeed * 0.8, repeat: Infinity, ease: "easeInOut" }}
                        className="text-6xl select-none relative z-10"
                      >
                        ⭐
                      </motion.div>
                    )}
                    <div className={`absolute bottom-2 right-3 text-xs font-bold ${rarity.text} bg-white/80 px-2 py-0.5 rounded-full z-10`}>
                      #{String(card.id || "001").slice(-3)}
                    </div>
                  </motion.div>

                  {/* Stats */}
                  <div className="bg-white px-4 py-4 space-y-3">
                    {card.description && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-gray-500 text-xs italic border-l-2 border-gray-200 pl-2"
                      >
                        {card.description}
                      </motion.p>
                    )}
                    <div className="space-y-2">
                      <StatBar label="Power" value={card.power ?? 50} delay={0}    barColor={params.statBarColor}  statPulse={params.statPulse} />
                      <StatBar label="Speed" value={card.speed ?? 50} delay={0.1}  barColor={params.speedBarColor} statPulse={(card.speed ?? 50) >= 70} />
                      <StatBar label="Charm" value={card.charm ?? 50} delay={0.2}  barColor={params.charmBarColor} statPulse={(card.charm ?? 50) >= 70} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
                    <span className={`text-xs font-bold ${rarity.text} flex items-center gap-1`}>
                      <Zap className="w-3 h-3" /> Carter Family Cards
                    </span>
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={onClose}
                        size="sm"
                        className="h-7 text-xs bg-gray-900 hover:bg-gray-700 text-white rounded-full px-3"
                      >
                        {card.rarity === "legendary" ? "🔥 Incredible!" : card.rarity === "epic" ? "✨ Amazing!" : card.rarity === "rare" ? "💎 Sweet!" : "Awesome!"}
                      </Button>
                    </motion.div>
                  </div>

                  {/* Charm sparkles — count and opacity from charm stat */}
                  {[...Array(params.sparkleCount)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, params.sparkleOpacity, 0],
                        scale: [0, 1, 0],
                        x: [0, (i % 2 === 0 ? 1 : -1) * (15 + i * 10)],
                        y: [0, -(25 + i * 10)],
                      }}
                      transition={{
                        delay: 0.9 + i * Math.max(0.08, 0.2 - (card.charm ?? 50) / 700),
                        duration: Math.max(0.8, 1.6 - (card.charm ?? 50) / 100),
                        repeat: Infinity,
                        repeatDelay: Math.max(0.5, 2.5 - (card.charm ?? 50) / 60),
                      }}
                      className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none"
                      style={{ color: rarity.particleColor }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-center text-white/40 text-xs mt-6"
          >
            tap anywhere to dismiss
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
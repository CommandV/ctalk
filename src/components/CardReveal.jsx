import React, { useState, useEffect } from "react";
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
    bgDark: "#e5e7eb",
    particleColor: "#9ca3af",
    stars: 1,
    burstCount: 6,
  },
  uncommon: {
    label: "Uncommon",
    gradient: "from-green-500 via-emerald-400 to-green-500",
    glow: "shadow-green-400/50",
    glowColor: "rgba(52,211,153,0.6)",
    border: "border-green-400",
    text: "text-green-600",
    bg: "bg-gradient-to-br from-green-50 to-emerald-100",
    bgDark: "#6ee7b7",
    particleColor: "#10b981",
    stars: 2,
    burstCount: 10,
  },
  rare: {
    label: "Rare",
    gradient: "from-blue-500 via-indigo-400 to-blue-500",
    glow: "shadow-blue-400/60",
    glowColor: "rgba(96,165,250,0.7)",
    border: "border-blue-400",
    text: "text-blue-600",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
    bgDark: "#93c5fd",
    particleColor: "#3b82f6",
    stars: 3,
    burstCount: 14,
  },
  epic: {
    label: "Epic",
    gradient: "from-purple-600 via-fuchsia-500 to-purple-600",
    glow: "shadow-purple-500/70",
    glowColor: "rgba(168,85,247,0.7)",
    border: "border-purple-400",
    text: "text-purple-600",
    bg: "bg-gradient-to-br from-purple-50 to-fuchsia-100",
    bgDark: "#d8b4fe",
    particleColor: "#a855f7",
    stars: 4,
    burstCount: 20,
  },
  legendary: {
    label: "Legendary",
    gradient: "from-yellow-400 via-orange-400 to-yellow-400",
    glow: "shadow-yellow-400/80",
    glowColor: "rgba(251,191,36,0.8)",
    border: "border-yellow-400",
    text: "text-yellow-600",
    bg: "bg-gradient-to-br from-yellow-50 to-orange-100",
    bgDark: "#fde68a",
    particleColor: "#f59e0b",
    stars: 5,
    burstCount: 28,
  },
};

// Particle burst on reveal
function ParticleBurst({ rarity }) {
  const cfg = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const count = cfg.burstCount;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
      {[...Array(count)].map((_, i) => {
        const angle = (360 / count) * i;
        const dist = 120 + Math.random() * 80;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        const size = 4 + Math.random() * 6;
        const delay = Math.random() * 0.15;
        const shapes = ["●", "★", "✦", "◆"];
        const shape = shapes[i % shapes.length];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0, x: tx, y: ty }}
            transition={{ duration: 0.8 + Math.random() * 0.4, delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              fontSize: size,
              color: cfg.particleColor,
              lineHeight: 1,
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            {shape}
          </motion.div>
        );
      })}
    </div>
  );
}

// Sheen sweep animation overlay
function SheenOverlay() {
  return (
    <motion.div
      initial={{ x: "-120%", skewX: -20 }}
      animate={{ x: "220%" }}
      transition={{ delay: 0.4, duration: 0.7, ease: "easeInOut" }}
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
      }}
    />
  );
}

function StatBar({ label, value, delay = 0 }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 1.0 + delay, duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 + delay + 0.3 }}
        className="text-xs font-bold text-gray-700 w-7 text-right"
      >
        {value}
      </motion.span>
    </div>
  );
}

// "NEW CARD!" burst text
function RevealBanner({ rarity }) {
  const cfg = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  return (
    <motion.div
      initial={{ scale: 2.5, opacity: 0 }}
      animate={{ scale: 1, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
    >
      <span
        className="font-black text-5xl uppercase tracking-widest drop-shadow-2xl"
        style={{ color: cfg.particleColor, textShadow: `0 0 30px ${cfg.glowColor}` }}
      >
        {cfg.label === "Legendary" ? "⚡ LEGENDARY ⚡" : cfg.label === "Epic" ? "✨ EPIC ✨" : "NEW CARD!"}
      </span>
    </motion.div>
  );
}

export default function CardReveal({ card, onClose }) {
  const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;
  const isHighRarity = card.rarity === "epic" || card.rarity === "legendary";

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
        {/* Background pulse ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: [0, 3, 4], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 200,
            height: 200,
            background: `radial-gradient(circle, ${rarity.glowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Outer glow ring for legendary */}
        {card.rarity === "legendary" && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 340,
              height: 340,
              background: "conic-gradient(from 0deg, #f59e0b, #ef4444, #a855f7, #3b82f6, #10b981, #f59e0b)",
              opacity: 0.35,
              filter: "blur(12px)",
            }}
          />
        )}

        {card.rarity === "epic" && (
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 320,
              height: 320,
              background: "conic-gradient(from 0deg, #a855f7, #ec4899, #a855f7)",
              opacity: 0.3,
              filter: "blur(10px)",
            }}
          />
        )}

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {/* Particle burst */}
          <ParticleBurst rarity={card.rarity} />

          {/* Banner text */}
          <RevealBanner rarity={card.rarity} />

          {/* Card container with flip-in */}
          <motion.div
            initial={{ rotateY: 90, scale: 0.6, opacity: 0, y: 40 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.2 }}
            style={{ perspective: 1200 }}
          >
            {/* Floating animation after reveal */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              {/* Glow shadow beneath card */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: [0, 0.6, 0.4], scaleX: [0.5, 1, 0.9] }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-60 h-8 rounded-full pointer-events-none"
                style={{ background: rarity.glowColor, filter: "blur(12px)" }}
              />

              <div
                className={`w-72 rounded-3xl border-2 ${rarity.border} shadow-2xl ${rarity.glow} overflow-hidden relative`}
                style={{ boxShadow: `0 0 40px ${rarity.glowColor}, 0 20px 60px rgba(0,0,0,0.5)` }}
              >
                {/* Sheen sweep */}
                <div className="relative overflow-hidden">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${rarity.gradient} px-4 py-3 flex items-center justify-between relative overflow-hidden`}>
                    <SheenOverlay />
                    <div>
                      <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">{rarity.label}</p>
                      <h2 className="text-white font-black text-xl leading-tight">{card.character_name}</h2>
                    </div>
                    <motion.div
                      className="flex items-center gap-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: i < (card.stars || rarity.stars) ? 1 : 0.6, rotate: 0 }}
                          transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 300 }}
                        >
                          <Star className={`w-4 h-4 ${i < (card.stars || rarity.stars) ? "text-white fill-white" : "text-white/30"}`} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>

                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className={`${rarity.bg} h-44 flex items-center justify-center relative overflow-hidden`}
                >
                  {/* Radial shine behind image */}
                  {isHighRarity && (
                    <motion.div
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0"
                      style={{ background: `radial-gradient(circle at 50% 40%, ${rarity.glowColor} 0%, transparent 70%)` }}
                    />
                  )}
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.character_name} className="w-full h-full object-cover relative z-10" />
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.07, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-6xl select-none relative z-10"
                    >
                      {card.character_name.toLowerCase().includes("dog") ? "🐶" : "⭐"}
                    </motion.div>
                  )}
                  <div className={`absolute bottom-2 right-3 text-xs font-bold ${rarity.text} bg-white/80 px-2 py-0.5 rounded-full z-10`}>
                    #{String(card.id || "001").slice(-3)}
                  </div>
                </motion.div>

                {/* Body */}
                <div className="bg-white px-4 py-4 space-y-3">
                  {card.description && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-gray-500 text-xs italic border-l-2 border-gray-200 pl-2"
                    >
                      {card.description}
                    </motion.p>
                  )}
                  <div className="space-y-2">
                    <StatBar label="Power" value={card.power || 50} delay={0} />
                    <StatBar label="Speed" value={card.speed || 50} delay={0.1} />
                    <StatBar label="Charm" value={card.charm || 50} delay={0.2} />
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
                      {card.rarity === "legendary" ? "🔥 Incredible!" : card.rarity === "epic" ? "✨ Amazing!" : "Awesome!"}
                    </Button>
                  </motion.div>
                </div>

                {/* Floating sparkles for high rarity */}
                {isHighRarity && [...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 12)],
                      y: [0, -(30 + i * 12)],
                    }}
                    transition={{ delay: 0.8 + i * 0.15, duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ color: rarity.particleColor }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Tap to dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center text-white/40 text-xs mt-6"
          >
            tap anywhere to dismiss
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
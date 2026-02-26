import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const RARITY_CONFIG = {
  common: {
    label: "Common",
    gradient: "from-gray-400 via-gray-300 to-gray-400",
    glow: "shadow-gray-400/40",
    border: "border-gray-300",
    text: "text-gray-600",
    bg: "bg-gradient-to-br from-gray-100 to-gray-200",
    stars: 1,
  },
  uncommon: {
    label: "Uncommon",
    gradient: "from-green-500 via-emerald-400 to-green-500",
    glow: "shadow-green-400/50",
    border: "border-green-400",
    text: "text-green-600",
    bg: "bg-gradient-to-br from-green-50 to-emerald-100",
    stars: 2,
  },
  rare: {
    label: "Rare",
    gradient: "from-blue-500 via-indigo-400 to-blue-500",
    glow: "shadow-blue-400/60",
    border: "border-blue-400",
    text: "text-blue-600",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
    stars: 3,
  },
  epic: {
    label: "Epic",
    gradient: "from-purple-600 via-fuchsia-500 to-purple-600",
    glow: "shadow-purple-500/60",
    border: "border-purple-400",
    text: "text-purple-600",
    bg: "bg-gradient-to-br from-purple-50 to-fuchsia-100",
    stars: 4,
  },
  legendary: {
    label: "Legendary",
    gradient: "from-yellow-400 via-orange-400 to-yellow-400",
    glow: "shadow-yellow-400/70",
    border: "border-yellow-400",
    text: "text-yellow-600",
    bg: "bg-gradient-to-br from-yellow-50 to-orange-100",
    stars: 5,
  },
};

function StatBar({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-7 text-right">{value}</span>
    </div>
  );
}

export default function CardReveal({ card, onClose }) {
  const [flipped, setFlipped] = useState(false);
  const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
          animate={{ scale: 1, rotateY: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.8 }}
          onClick={(e) => e.stopPropagation()}
          className="relative"
          style={{ perspective: 1000 }}
        >
          {/* Sparkle effects for rare+ */}
          {(card.rarity === "epic" || card.rarity === "legendary") && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 15)], y: [0, -(40 + i * 10)] }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ))}
            </>
          )}

          {/* Card */}
          <div
            className={`w-72 rounded-3xl border-2 ${rarity.border} shadow-2xl ${rarity.glow} overflow-hidden`}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${rarity.gradient} px-4 py-3 flex items-center justify-between`}>
              <div>
                <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">{rarity.label}</p>
                <h2 className="text-white font-black text-xl leading-tight">{card.character_name}</h2>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < (card.stars || rarity.stars) ? "text-white fill-white" : "text-white/30"}`}
                  />
                ))}
              </div>
            </div>

            {/* Image */}
            <div className={`${rarity.bg} h-44 flex items-center justify-center relative`}>
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.character_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl select-none">
                  {card.character_name.includes("dog") || card.character_name.toLowerCase().includes("dog")
                    ? "🐶"
                    : "⭐"}
                </div>
              )}
              <div className={`absolute bottom-2 right-3 text-xs font-bold ${rarity.text} bg-white/80 px-2 py-0.5 rounded-full`}>
                #{String(card.id || "001").slice(-3)}
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-4 py-4 space-y-3">
              {card.description && (
                <p className="text-gray-500 text-xs italic border-l-2 border-gray-200 pl-2">{card.description}</p>
              )}
              <div className="space-y-2">
                <StatBar label="Power" value={card.power || 50} />
                <StatBar label="Speed" value={card.speed || 50} />
                <StatBar label="Charm" value={card.charm || 50} />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
              <span className={`text-xs font-bold ${rarity.text} flex items-center gap-1`}>
                <Zap className="w-3 h-3" /> Carter Family Cards
              </span>
              <Button
                onClick={onClose}
                size="sm"
                className="h-7 text-xs bg-gray-900 hover:bg-gray-700 text-white rounded-full px-3"
              >
                Awesome!
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
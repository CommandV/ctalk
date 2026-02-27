import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Ultra animation for the special Mrs Zellner 10-star card (admin-gifted only)
function RainbowRing({ size, duration, delay }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        background: "conic-gradient(from 0deg, #ff0080, #ff8c00, #ffe100, #00ff88, #00cfff, #a855f7, #ff0080)",
        opacity: 0.5,
        filter: "blur(10px)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

function GoldParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(50)].map((_, i) => {
        const angle = (360 / 50) * i;
        const dist = 100 + Math.random() * 160;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        const shapes = ["⭐", "✨", "💫", "👑", "★", "◆"];
        const shape = shapes[i % shapes.length];
        const delay = Math.random() * 0.3;
        const size = 8 + Math.random() * 12;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0, x: tx, y: ty, rotate: 360 }}
            transition={{ duration: 1.2 + Math.random() * 0.5, delay, ease: "easeOut" }}
            style={{
              position: "absolute", top: "50%", left: "50%",
              fontSize: size, lineHeight: 1,
            }}
          >
            {shape}
          </motion.div>
        );
      })}
    </div>
  );
}

function LightBeams() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.6, 0], scaleY: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: 0.1 * i, repeat: Infinity, repeatDelay: 3 }}
          style={{
            position: "absolute",
            width: 3,
            height: 600,
            background: "linear-gradient(to bottom, transparent, #ffd700, transparent)",
            transformOrigin: "center",
            rotate: `${i * 30}deg`,
            filter: "blur(2px)",
          }}
        />
      ))}
    </div>
  );
}

function UltraBanner() {
  return (
    <motion.div
      initial={{ scale: 3, opacity: 0 }}
      animate={{ scale: [3, 1, 1, 0.8], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
      className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none gap-2"
    >
      <motion.span
        animate={{ textShadow: ["0 0 20px #ffd700", "0 0 60px #ff0080", "0 0 20px #ffd700"] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="font-black text-4xl uppercase tracking-widest text-yellow-300"
        style={{ textShadow: "0 0 30px #ffd700, 0 0 60px #ff8c00" }}
      >
        👑 ULTRA RARE 👑
      </motion.span>
      <span className="font-bold text-xl text-white/90 tracking-wide" style={{ textShadow: "0 0 20px #fff" }}>
        Admin Gift Received!
      </span>
    </motion.div>
  );
}

function TenStars({ delay }) {
  return (
    <motion.div
      className="flex items-center gap-0.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + i * 0.06, type: "spring", stiffness: 400 }}
        >
          <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_4px_#ffd700]" />
        </motion.div>
      ))}
    </motion.div>
  );
}

function StatBarUltra({ label, value, delay = 0 }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-yellow-200/80 w-12 shrink-0 font-semibold">{label}</span>
      <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 1.2 + delay, duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #ffd700, #ff8c00, #ff0080)" }}
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 + delay + 0.4 }}
        className="text-xs font-black text-yellow-300 w-12 text-right"
      >
        1000/1000
      </motion.span>
    </div>
  );
}

export default function CardRevealUltra({ card, onClose }) {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCard(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
        onClick={onClose}
      >
        {/* Animated background */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,215,0,0.15) 0%, transparent 70%)" }}
        />

        <LightBeams />

        {/* Rainbow rings */}
        <RainbowRing size={500} duration={4} delay={0} />
        <RainbowRing size={380} duration={3} delay={0.5} />
        <RainbowRing size={260} duration={2.5} delay={1} />

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <GoldParticles />
          <UltraBanner />

          <AnimatePresence>
            {showCard && (
              <motion.div
                initial={{ rotateY: 180, scale: 0.4, opacity: 0, y: 60 }}
                animate={{ rotateY: 0, scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.1 }}
                style={{ perspective: 1200 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                >
                  {/* Ground glow */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0.5] }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-72 h-10 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(255,215,0,0.6), transparent)", filter: "blur(10px)" }}
                  />

                  {/* Card */}
                  <div
                    className="w-80 rounded-3xl overflow-hidden relative"
                    style={{
                      border: "3px solid transparent",
                      background: "linear-gradient(145deg, #0a0a0a, #1a1a2e) padding-box, conic-gradient(from 0deg, #ffd700, #ff8c00, #ff0080, #a855f7, #00cfff, #00ff88, #ffd700) border-box",
                      boxShadow: "0 0 60px rgba(255,215,0,0.6), 0 0 120px rgba(255,140,0,0.3), 0 30px 80px rgba(0,0,0,0.8)",
                    }}
                  >
                    {/* Animated border glow */}
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-3xl pointer-events-none"
                      style={{ boxShadow: "inset 0 0 30px rgba(255,215,0,0.2)" }}
                    />

                    {/* Header */}
                    <div
                      className="px-4 py-4 flex items-center justify-between relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #1a0a00, #3d1c00, #1a0a00)" }}
                    >
                      {/* Sheen */}
                      <motion.div
                        initial={{ x: "-120%", skewX: -20 }}
                        animate={{ x: "220%" }}
                        transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)" }}
                      />
                      <div>
                        <motion.p
                          animate={{ color: ["#ffd700", "#ff8c00", "#ff0080", "#ffd700"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-xs font-black uppercase tracking-widest"
                        >
                          ✦ ULTRA RARE ✦
                        </motion.p>
                        <h2 className="text-yellow-200 font-black text-2xl leading-tight mt-0.5">{card.character_name}</h2>
                      </div>
                      <TenStars delay={0.7} />
                    </div>

                    {/* Image */}
                    <motion.div
                      initial={{ opacity: 0, scale: 1.15 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="h-52 relative overflow-hidden flex items-center justify-center"
                      style={{ background: "linear-gradient(145deg, #0d0d1f, #1a0a2e, #0d0d1f)" }}
                    >
                      <motion.div
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute inset-0"
                        style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,215,0,0.3) 0%, transparent 65%)" }}
                      />
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: [(i % 2 === 0 ? 1 : -1) * (15 + i * 15)], y: [0, -(25 + i * 15)] }}
                          transition={{ delay: 0.8 + i * 0.2, duration: 1.6, repeat: Infinity, repeatDelay: 1.5 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none text-yellow-400"
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                      ))}
                      {card.image_url ? (
                        <img src={card.image_url} alt={card.character_name} className="w-full h-full object-cover relative z-10" />
                      ) : (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="text-7xl select-none relative z-10"
                        >
                          👑
                        </motion.div>
                      )}
                      <div className="absolute bottom-2 right-3 text-[10px] font-black text-yellow-300 bg-black/60 px-2 py-0.5 rounded-full z-10 border border-yellow-600/40">
                        ULTRA
                      </div>
                    </motion.div>

                    {/* Body */}
                    <div className="px-4 py-4 space-y-3" style={{ background: "linear-gradient(145deg, #0a0a1a, #12102a)" }}>
                      {card.description && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 }}
                          className="text-yellow-200/70 text-xs italic border-l-2 border-yellow-600/40 pl-2"
                        >
                          {card.description}
                        </motion.p>
                      )}
                      <div className="space-y-2">
                        <StatBarUltra label="Power" value={1000} delay={0} />
                        <StatBarUltra label="Speed" value={1000} delay={0.1} />
                        <StatBarUltra label="Charm" value={1000} delay={0.2} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,215,0,0.2)" }}>
                      <motion.span
                        animate={{ color: ["#ffd700", "#ff8c00", "#ffd700"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xs font-black flex items-center gap-1"
                      >
                        👑 Admin Gift
                      </motion.span>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={onClose}
                          size="sm"
                          className="h-7 text-xs font-black rounded-full px-4 text-black"
                          style={{ background: "linear-gradient(90deg, #ffd700, #ff8c00)" }}
                        >
                          🔥 INCREDIBLE!!!
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center text-yellow-400/50 text-xs mt-6"
          >
            tap anywhere to dismiss
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
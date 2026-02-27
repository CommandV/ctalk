import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardReveal from "./CardReveal";

const PACK_CONFIGS = {
  standard: {
    label: "Standard Pack",
    emoji: "📦",
    gradient: "from-blue-400 to-indigo-500",
    cardCount: 3,
    weights: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
  },
  rare: {
    label: "Rare Pack",
    emoji: "💎",
    gradient: "from-purple-400 to-violet-600",
    cardCount: 3,
    weights: { common: 20, uncommon: 30, rare: 30, epic: 15, legendary: 5 },
  },
  legendary: {
    label: "Legendary Pack",
    emoji: "✨",
    gradient: "from-yellow-400 to-orange-500",
    cardCount: 3,
    weights: { common: 5, uncommon: 15, rare: 30, epic: 30, legendary: 20 },
  },
};

function pickCard(pool, weights) {
  const eligible = pool.filter((c) => c.character_name !== "Mrs Zellner");
  const weighted = eligible.flatMap((c) => Array(weights[c.rarity] || 5).fill(c));
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function PackCard({ pack, onOpen }) {
  const config = PACK_CONFIGS[pack.pack_type] || PACK_CONFIGS.standard;
  const [shaking, setShaking] = useState(false);

  const handleClick = () => {
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      onOpen(pack);
    }, 600);
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.button
        animate={shaking ? { rotate: [-5, 5, -5, 5, 0], scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5 }}
        onClick={handleClick}
        className={`w-28 h-40 rounded-2xl bg-gradient-to-b ${config.gradient} shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform border-2 border-white/30`}
      >
        <span className="text-4xl">{config.emoji}</span>
        <span className="text-white font-bold text-xs text-center px-2">{config.label}</span>
        <span className="text-white/70 text-[10px]">tap to open</span>
      </motion.button>
    </motion.div>
  );
}

function PackOpeningAnimation({ cards, onDone }) {
  const [revealed, setRevealed] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  React.useEffect(() => {
    if (currentIdx < cards.length) {
      const timer = setTimeout(() => {
        setRevealed((prev) => [...prev, cards[currentIdx]]);
        setCurrentIdx((i) => i + 1);
      }, currentIdx === 0 ? 300 : 800);
      return () => clearTimeout(timer);
    } else {
      setShowAll(true);
    }
  }, [currentIdx, cards]);

  const rarityStyles = {
    common: "from-gray-100 to-gray-200 border-gray-300",
    uncommon: "from-green-100 to-emerald-200 border-emerald-300",
    rare: "from-blue-100 to-indigo-200 border-blue-300",
    epic: "from-purple-100 to-violet-200 border-purple-300",
    legendary: "from-yellow-100 to-amber-200 border-yellow-400",
  };

  const rarityGlow = {
    common: "",
    uncommon: "shadow-emerald-200",
    rare: "shadow-blue-300",
    epic: "shadow-purple-300",
    legendary: "shadow-yellow-300",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-8">
      {/* Particle burst bg */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((i / 20) * Math.PI * 2) * 200,
              y: Math.sin((i / 20) * Math.PI * 2) * 200,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
            className="absolute w-3 h-3 rounded-full bg-yellow-300"
          />
        ))}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white font-black text-2xl tracking-wider"
      >
        ✨ PACK OPENED! ✨
      </motion.h2>

      <div className="flex gap-4 flex-wrap justify-center px-4">
        <AnimatePresence>
          {revealed.map((card, i) => (
            <motion.div
              key={i}
              initial={{ rotateY: 180, scale: 0.5, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`w-32 h-44 rounded-2xl bg-gradient-to-b ${rarityStyles[card.rarity] || rarityStyles.common} border-2 shadow-lg ${rarityGlow[card.rarity] || ""} flex flex-col items-center justify-between p-2`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 capitalize">{card.rarity}</span>
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/50 flex items-center justify-center">
                {card.image_url
                  ? <img src={card.image_url} className="w-full h-full object-cover" />
                  : <span className="text-3xl">⭐</span>
                }
              </div>
              <p className="text-xs font-bold text-gray-800 text-center leading-tight">{card.character_name}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showAll && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            onClick={onDone}
            className="bg-white text-gray-900 font-bold px-8 py-3 rounded-2xl hover:bg-gray-100 shadow-xl"
          >
            Awesome! 🎉
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function CardPackOpener({ username, onClose }) {
  const queryClient = useQueryClient();
  const [openingPack, setOpeningPack] = useState(null);
  const [revealedCards, setRevealedCards] = useState(null);

  const { data: packs = [], isLoading } = useQuery({
    queryKey: ["card-packs", username],
    queryFn: () => base44.entities.CardPack.filter({ username, opened: false }),
    enabled: !!username,
  });

  const { data: allCards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const handleOpen = async (pack) => {
    const config = PACK_CONFIGS[pack.pack_type] || PACK_CONFIGS.standard;
    const drawnCards = Array.from({ length: config.cardCount }, () =>
      pickCard(allCards, config.weights)
    ).filter(Boolean);

    if (drawnCards.length === 0) return;

    // Save cards to collection
    for (const card of drawnCards) {
      const existing = await base44.entities.UserCardCollection.filter({
        username,
        card_id: card.id,
      });
      if (existing.length > 0) {
        await base44.entities.UserCardCollection.update(existing[0].id, {
          count: (existing[0].count || 1) + 1,
        });
      } else {
        await base44.entities.UserCardCollection.create({
          username,
          card_id: card.id,
          character_name: card.character_name,
          rarity: card.rarity,
          count: 1,
        });
      }
    }

    await base44.entities.CardPack.update(pack.id, { opened: true });
    queryClient.invalidateQueries({ queryKey: ["card-packs", username] });
    queryClient.invalidateQueries({ queryKey: ["my-collection"] });

    setRevealedCards(drawnCards);
  };

  const handleRevealDone = () => {
    setRevealedCards(null);
    if (packs.filter((p) => !p.opened).length <= 1) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="font-black text-xl text-gray-900">Your Card Packs</h2>
            <p className="text-gray-500 text-sm mt-1">Tap a pack to open it!</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : packs.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-5xl">📭</span>
              <p className="text-gray-500 text-sm mt-3">No packs yet. Keep posting to earn them!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              <AnimatePresence>
                {packs.map((pack) => (
                  <PackCard key={pack.id} pack={pack} onOpen={handleOpen} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {revealedCards && (
        <PackOpeningAnimation cards={revealedCards} onDone={handleRevealDone} />
      )}
    </>
  );
}
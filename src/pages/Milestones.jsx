import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Trophy, Zap, Shield, TrendingUp, ChevronRight, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { BONUS_TIERS, getBonusesForCount, getNextTier } from "../components/bonuses";

const RARITY_CONFIG = {
  common: { color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  uncommon: { color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  rare: { color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  epic: { color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  legendary: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
};

function CardDex({ allCards, myCollection }) {
  const collectedIds = new Set(myCollection.map((c) => c.card_id));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <span className="text-xl">🃏</span> Your Pokédex
        </h2>
        <span className="text-sm font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
          {collectedIds.size} / {allCards.length}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allCards.map((card) => {
          const collected = collectedIds.has(card.id);
          const collectedEntry = myCollection.find((c) => c.card_id === card.id);
          const rConfig = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;
          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: collected ? 1.03 : 1 }}
              className={`relative rounded-xl border p-3 flex flex-col items-center gap-1 transition-all
                ${collected ? rConfig.color : "bg-gray-50 border-gray-100 opacity-60 grayscale"}`}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                {card.image_url ? (
                  <img src={card.image_url} alt={card.character_name} className="w-full h-full object-cover" style={{ filter: collected ? "none" : "blur(6px) grayscale(1)" }} />
                ) : (
                  <span className="text-2xl">{collected ? (card.character_name.toLowerCase().includes("dog") ? "🐶" : "⭐") : "❓"}</span>
                )}
              </div>
              <span className="text-xs font-semibold text-center leading-tight line-clamp-2">
                {collected ? card.character_name : "???"}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${rConfig.color}`}>
                {card.rarity}
              </span>
              {collected && collectedEntry?.count > 1 && (
                <span className="absolute top-1.5 right-1.5 text-[10px] bg-violet-600 text-white font-bold rounded-full px-1.5">
                  ×{collectedEntry.count}
                </span>
              )}
              {!collected && <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-gray-400" />}
              {collected && <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-emerald-500" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function BonusTierCard({ tier, isUnlocked, isCurrent, progress, nextThreshold }) {
  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${isCurrent ? "border-violet-400 bg-violet-50 shadow-md" : isUnlocked ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white opacity-60"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl">{tier.emoji}</span>
          <h3 className={`font-bold text-base mt-1 ${isCurrent ? "text-violet-800" : isUnlocked ? "text-emerald-800" : "text-gray-500"}`}>
            {tier.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{tier.description}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${isCurrent ? "bg-violet-200 text-violet-700" : isUnlocked ? "bg-emerald-200 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
          {isUnlocked ? (isCurrent ? "Current" : "Unlocked") : `${tier.threshold} cards`}
        </div>
      </div>

      {!isUnlocked && isCurrent === false && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress} / {tier.threshold}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (progress / tier.threshold) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {tier.bonuses.map((bonus, i) => (
          <div key={i} className={`flex items-center justify-between text-sm rounded-lg px-3 py-1.5 ${isUnlocked ? "bg-white/60" : "bg-gray-50"}`}>
            <div>
              <span className={`font-medium ${isUnlocked ? "text-gray-800" : "text-gray-400"}`}>{bonus.label}</span>
              <p className="text-[11px] text-gray-400">{bonus.detail}</p>
            </div>
            <span className={`font-black text-sm ${isCurrent ? "text-violet-700" : isUnlocked ? "text-emerald-600" : "text-gray-400"}`}>
              {bonus.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReactionScore({ username }) {
  const { data: reactions = [] } = useQuery({
    queryKey: ["my-reactions-received", username],
    queryFn: () => base44.entities.PostReaction.filter({ post_author: username }),
    enabled: !!username,
  });

  const boosts = reactions.filter((r) => r.reaction_type === "boost").length;
  const burns = reactions.filter((r) => r.reaction_type === "burn").length;
  const net = boosts - burns;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-violet-500" /> Your Reaction Score
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-2xl font-black text-emerald-600">+{boosts}</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Boosts</p>
        </div>
        <div className="text-center bg-rose-50 rounded-xl p-3 border border-rose-100">
          <p className="text-2xl font-black text-rose-500">-{burns}</p>
          <p className="text-xs text-rose-600 font-medium mt-0.5">Burns</p>
        </div>
        <div className={`text-center rounded-xl p-3 border ${net >= 0 ? "bg-violet-50 border-violet-100" : "bg-gray-50 border-gray-100"}`}>
          <p className={`text-2xl font-black ${net >= 0 ? "text-violet-700" : "text-gray-500"}`}>{net >= 0 ? `+${net}` : net}</p>
          <p className={`text-xs font-medium mt-0.5 ${net >= 0 ? "text-violet-600" : "text-gray-500"}`}>Net Score</p>
        </div>
      </div>
    </div>
  );
}

export default function Milestones() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) setUserProfile(profiles[0]);
      setLoading(false);
    };
    load();
  }, []);

  const { data: allCards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const { data: myCollection = [] } = useQuery({
    queryKey: ["my-collection", userProfile?.username],
    queryFn: () => base44.entities.UserCardCollection.filter({ username: userProfile.username }),
    enabled: !!userProfile,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please set up your username on the Feed page first.</p>
      </div>
    );
  }

  const uniqueCount = new Set(myCollection.map((c) => c.card_id)).size;
  const currentTier = getBonusesForCount(uniqueCount);
  const nextTier = getNextTier(uniqueCount);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Milestones
          </h1>
          <p className="text-gray-500 mt-1">Track your bonuses and collection progress</p>
        </div>

        {/* Current status */}
        {currentTier ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl p-5 mb-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Active Title</p>
                <h2 className="text-2xl font-black mt-0.5">{currentTier.emoji} {currentTier.title}</h2>
                <p className="text-white/80 text-sm mt-1">{uniqueCount} unique cards collected</p>
              </div>
              {nextTier && (
                <div className="text-right">
                  <p className="text-white/60 text-xs">Next tier</p>
                  <p className="text-white font-bold text-sm">{nextTier.emoji} {nextTier.title}</p>
                  <p className="text-white/60 text-xs">{nextTier.threshold - uniqueCount} more cards</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 text-center"
          >
            <p className="text-4xl mb-2">🃏</p>
            <p className="font-bold text-gray-900">Start collecting cards!</p>
            <p className="text-gray-500 text-sm mt-1">Post on the feed to receive your first trading card</p>
          </motion.div>
        )}

        <div className="space-y-5">
          {/* Reaction score */}
          <ReactionScore username={userProfile.username} />

          {/* Pokedex */}
          <CardDex allCards={allCards} myCollection={myCollection} />

          {/* Bonus tiers */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-500" /> Bonus Tiers
            </h2>
            <div className="space-y-3">
              {BONUS_TIERS.map((tier) => {
                const isUnlocked = uniqueCount >= tier.threshold;
                const isCurrent = currentTier?.id === tier.id;
                return (
                  <BonusTierCard
                    key={tier.id}
                    tier={tier}
                    isUnlocked={isUnlocked}
                    isCurrent={isCurrent}
                    progress={uniqueCount}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
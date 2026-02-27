import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const RARITY_COLORS = {
  common: "bg-gray-100 text-gray-700",
  uncommon: "bg-green-100 text-green-700",
  rare: "bg-blue-100 text-blue-700",
  epic: "bg-purple-100 text-purple-700",
  legendary: "bg-yellow-100 text-yellow-700",
};

export default function IncomingTrades({ username, onUltraReveal, onReveal }) {
  const queryClient = useQueryClient();

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["incoming-trades", username],
    queryFn: () => base44.entities.CardTrade.filter({ to_username: username, status: "pending" }),
    enabled: !!username,
    refetchInterval: 15000,
  });

  const { data: allCards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const handleAccept = async (trade) => {
    // For admin_grant: card was already added to collection by admin, just mark accepted
    // For regular gifts: add card to recipient's collection and deduct from sender
    if (trade.type !== "admin_grant") {
      const existing = await base44.entities.UserCardCollection.filter({ username: trade.to_username, card_id: trade.card_id });
      if (existing.length > 0) {
        await base44.entities.UserCardCollection.update(existing[0].id, { count: (existing[0].count || 1) + 1 });
      } else {
        await base44.entities.UserCardCollection.create({
          username: trade.to_username,
          card_id: trade.card_id,
          character_name: trade.character_name,
          rarity: trade.rarity,
          count: 1,
        });
      }

      const senderCards = await base44.entities.UserCardCollection.filter({ username: trade.from_username, card_id: trade.card_id });
      if (senderCards.length > 0) {
        const newCount = (senderCards[0].count || 1) - 1;
        if (newCount <= 0) {
          await base44.entities.UserCardCollection.delete(senderCards[0].id);
        } else {
          await base44.entities.UserCardCollection.update(senderCards[0].id, { count: newCount });
        }
      }
    }

    await base44.entities.CardTrade.update(trade.id, { status: "accepted" });
    queryClient.invalidateQueries({ queryKey: ["incoming-trades"] });
    queryClient.invalidateQueries({ queryKey: ["my-collection"] });

    // Trigger ultra animation for Mrs Zellner
    if (trade.character_name === "Mrs Zellner" && onUltraReveal) {
      const card = allCards.find((c) => c.id === trade.card_id) || {
        character_name: "Mrs Zellner", rarity: "legendary",
      };
      onUltraReveal(card);
    }
  };

  const handleDecline = async (trade) => {
    await base44.entities.CardTrade.update(trade.id, { status: "declined" });
    queryClient.invalidateQueries({ queryKey: ["incoming-trades"] });
  };

  if (isLoading || trades.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-4 mb-4">
      <h3 className="font-bold text-violet-900 text-sm flex items-center gap-2 mb-3">
        <Gift className="w-4 h-4 text-violet-600" />
        Incoming Gifts ({trades.length})
      </h3>
      <div className="space-y-2">
        {trades.map((trade) => {
          const card = allCards.find((c) => c.id === trade.card_id);
          return (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {card?.image_url ? <img src={card.image_url} className="w-full h-full object-cover" /> : <span className="text-xl">{trade.character_name.toLowerCase().includes("dog") ? "🐶" : "⭐"}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{trade.character_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${RARITY_COLORS[trade.rarity]}`}>{trade.rarity}</span>
                  <span className="text-[10px] text-gray-400">from {trade.type === "admin_grant" ? "👑 Admin" : `@${trade.from_username}`}</span>
                </div>
                {trade.message && <p className="text-[11px] text-gray-500 italic mt-0.5 truncate">"{trade.message}"</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="sm" onClick={() => handleDecline(trade)} variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50">
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => handleAccept(trade)} className="h-8 px-3 bg-violet-600 hover:bg-violet-500 text-white text-xs gap-1">
                  <Check className="w-3.5 h-3.5" /> Accept
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
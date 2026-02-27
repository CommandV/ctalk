import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileDrawerSelect from "./MobileDrawerSelect";

const RARITY_COLORS = {
  common: "bg-gray-100 text-gray-700",
  uncommon: "bg-green-100 text-green-700",
  rare: "bg-blue-100 text-blue-700",
  epic: "bg-purple-100 text-purple-700",
  legendary: "bg-yellow-100 text-yellow-700",
};

export default function GiftCardModal({ userProfile, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState(null);
  const [toUsername, setToUsername] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: myCollection = [] } = useQuery({
    queryKey: ["my-collection", userProfile?.username],
    queryFn: () => base44.entities.UserCardCollection.filter({ username: userProfile.username }),
    enabled: !!userProfile,
  });

  const { data: allCards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  // Only show cards where we have duplicates (count > 1)
  const giftableCards = myCollection
    .filter((c) => (c.count || 1) > 1)
    .map((c) => {
      const card = allCards.find((a) => a.id === c.card_id);
      return card ? { ...card, owned_count: c.count } : null;
    })
    .filter(Boolean);

  const otherUsers = allProfiles.filter((p) => p.username !== userProfile.username);

  const handleSend = async () => {
    if (!selectedCard || !toUsername) return;
    setSending(true);

    // Create the trade record
    await base44.entities.CardTrade.create({
      from_username: userProfile.username,
      to_username: toUsername,
      card_id: selectedCard.id,
      character_name: selectedCard.character_name,
      rarity: selectedCard.rarity,
      status: "pending",
      type: "gift",
      message: message.trim(),
    });

    setSending(false);
    setSuccess(true);
    queryClient.invalidateQueries({ queryKey: ["incoming-trades"] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Gift className="w-5 h-5" />
            <h2 className="font-bold text-lg">Gift a Card</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {success ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🎁</div>
              <h3 className="font-bold text-gray-900 text-lg">Gift Sent!</h3>
              <p className="text-gray-500 text-sm mt-1">Your card is on its way to {toUsername}. They'll need to accept it.</p>
              <Button onClick={onClose} className="mt-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl">Done</Button>
            </div>
          ) : (
            <>
              {giftableCards.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🃏</p>
                  <p className="font-semibold text-gray-800">No duplicates yet</p>
                  <p className="text-gray-500 text-sm mt-1">You can only gift duplicate cards (cards you own 2+ of).</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">Choose a card to gift</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {giftableCards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => setSelectedCard(card)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${selectedCard?.id === card.id ? "border-violet-400 bg-violet-50" : "border-gray-100 hover:border-gray-200"}`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {card.image_url ? <img src={card.image_url} className="w-full h-full object-cover" /> : <span className="text-lg">{card.character_name.toLowerCase().includes("dog") ? "🐶" : "⭐"}</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{card.character_name}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${RARITY_COLORS[card.rarity]}`}>{card.rarity}</span>
                            <p className="text-[10px] text-gray-400">×{card.owned_count} owned</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">Send to</label>
                    <MobileDrawerSelect
                      value={toUsername}
                      onValueChange={setToUsername}
                      placeholder="Select a user..."
                      options={otherUsers.map((u) => ({ value: u.username, label: `@${u.username}` }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">Message (optional)</label>
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a nice note..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={!selectedCard || !toUsername || sending}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl gap-2"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Gift
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
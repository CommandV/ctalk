import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Loader2, Check } from "lucide-react";

const RARITY_COLORS = {
  common: "text-gray-600",
  uncommon: "text-green-600",
  rare: "text-blue-600",
  epic: "text-purple-600",
  legendary: "text-yellow-600",
};

export default function AdminCardGift() {
  const [selectedCard, setSelectedCard] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: cards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const handleGift = async () => {
    if (!selectedCard || !selectedUser) return;
    const card = cards.find((c) => c.id === selectedCard);
    const user = profiles.find((p) => p.id === selectedUser);
    if (!card || !user) return;

    setSending(true);
    await base44.entities.CardTrade.create({
      from_username: "Admin",
      to_username: user.username,
      card_id: card.id,
      character_name: card.character_name,
      rarity: card.rarity,
      status: "pending",
      type: "admin_grant",
      message: "A gift from the Admin! 👑",
    });
    setSending(false);
    setSent(true);
    setSelectedCard("");
    setSelectedUser("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
      <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-violet-500" /> Grant Card to User
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Card</label>
          <Select value={selectedCard} onValueChange={setSelectedCard}>
            <SelectTrigger className="rounded-xl h-10">
              <SelectValue placeholder="Select a card..." />
            </SelectTrigger>
            <SelectContent>
              {cards.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className={`font-semibold capitalize ${RARITY_COLORS[c.rarity]}`}>[{c.rarity}]</span> {c.character_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">User</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="rounded-xl h-10">
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>@{p.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        onClick={handleGift}
        disabled={!selectedCard || !selectedUser || sending}
        className={`gap-2 rounded-xl ${sent ? "bg-emerald-600 hover:bg-emerald-500" : "bg-violet-600 hover:bg-violet-500"} text-white`}
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <Check className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
        {sent ? "Gift Sent!" : "Send Card"}
      </Button>
      <p className="text-xs text-gray-400 mt-2">The user will receive a notification and can accept or decline the gift.</p>
    </div>
  );
}
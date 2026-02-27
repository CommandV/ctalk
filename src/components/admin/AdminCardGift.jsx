import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Loader2, Check, Zap } from "lucide-react";

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
  const [quantity, setQuantity] = useState(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [givingAdmin, setGivingAdmin] = useState(false);
  const [givingUnique, setGivingUnique] = useState(false);
  const queryClient = useQueryClient();

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

    // Directly update or create collection entry for the recipient
    const existingEntries = await base44.entities.UserCardCollection.filter({
      username: user.username,
      card_id: card.id,
    });

    if (existingEntries.length > 0) {
      await base44.entities.UserCardCollection.update(existingEntries[0].id, {
        count: (existingEntries[0].count || 1) + quantity,
      });
    } else {
      await base44.entities.UserCardCollection.create({
        username: user.username,
        card_id: card.id,
        character_name: card.character_name,
        rarity: card.rarity,
        count: quantity,
      });
    }

    // Create a trade notification record so they see it
    await base44.entities.CardTrade.create({
      from_username: "Admin",
      to_username: user.username,
      card_id: card.id,
      character_name: card.character_name,
      rarity: card.rarity,
      status: "accepted",
      type: "admin_grant",
      message: `A gift from the Admin! 👑 (×${quantity})`,
    });

    queryClient.invalidateQueries({ queryKey: ["my-collection"] });
    setSending(false);
    setSent(true);
    setSelectedCard("");
    setSelectedUser("");
    setQuantity(1);
    setTimeout(() => setSent(false), 3000);
  };

  const handleGiveAdminBillionCards = async () => {
    if (cards.length === 0) return;
    setGivingAdmin(true);

    // Get admin's own profile
    const me = await base44.auth.me();
    const myProfile = profiles.find((p) => p.created_by === me.email || p.username?.toLowerCase() === "admin");
    if (!myProfile) {
      alert("No admin profile found. Make sure you have a username set up on the Feed page.");
      setGivingAdmin(false);
      return;
    }

    // Upsert every card with 1,000,000,000 count for admin
    for (const card of cards) {
      const existing = await base44.entities.UserCardCollection.filter({
        username: myProfile.username,
        card_id: card.id,
      });
      if (existing.length > 0) {
        await base44.entities.UserCardCollection.update(existing[0].id, { count: 1000000000 });
      } else {
        await base44.entities.UserCardCollection.create({
          username: myProfile.username,
          card_id: card.id,
          character_name: card.character_name,
          rarity: card.rarity,
          count: 1000000000,
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ["my-collection"] });
    setGivingAdmin(false);
    alert(`Done! Your collection now has 1,000,000,000 of every card.`);
  };

  const handleGiveUniqueCards = async () => {
    if (cards.length === 0) return;
    setGivingUnique(true);

    const me = await base44.auth.me();
    const myProfile = profiles.find((p) => p.created_by === me.email);
    if (!myProfile) {
      alert("No admin profile found.");
      setGivingUnique(false);
      return;
    }

    // Give 1 of every card (unique collection)
    for (const card of cards) {
      const existing = await base44.entities.UserCardCollection.filter({
        username: myProfile.username,
        card_id: card.id,
      });
      if (existing.length === 0) {
        await base44.entities.UserCardCollection.create({
          username: myProfile.username,
          card_id: card.id,
          character_name: card.character_name,
          rarity: card.rarity,
          count: 1,
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ["my-collection"] });
    setGivingUnique(false);
    alert(`Done! You now have 1 of every unique card (${cards.length} cards).`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <Gift className="w-5 h-5 text-violet-500" /> Grant Cards to User
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={handleGiveAdminBillionCards}
            disabled={givingAdmin}
          >
            {givingAdmin ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Give Me 1B Cards
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50"
            onClick={handleGiveUniqueCards}
            disabled={givingUnique}
          >
            {givingUnique ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gift className="w-3 h-3" />}
            Give Me All Unique
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleGift}
          disabled={!selectedCard || !selectedUser || sending}
          className={`gap-2 rounded-xl ${sent ? "bg-emerald-600 hover:bg-emerald-500" : "bg-violet-600 hover:bg-violet-500"} text-white`}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <Check className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
          {sent ? "Sent!" : `Send ×${quantity}`}
        </Button>
        <p className="text-xs text-gray-400">Cards are added directly to the user's collection.</p>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MinusCircle, Loader2, Check } from "lucide-react";

const RARITY_COLORS = {
  common: "text-gray-600",
  uncommon: "text-green-600",
  rare: "text-blue-600",
  epic: "text-purple-600",
  legendary: "text-yellow-600",
};

export default function AdminTakeCards() {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedEntry, setSelectedEntry] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [taking, setTaking] = useState(false);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const selectedProfile = profiles.find((p) => p.id === selectedUser);

  const { data: userCollection = [] } = useQuery({
    queryKey: ["user-collection-admin", selectedProfile?.username],
    queryFn: () => base44.entities.UserCardCollection.filter({ username: selectedProfile.username }),
    enabled: !!selectedProfile,
  });

  const { data: allCards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const cardMap = Object.fromEntries(allCards.map((c) => [c.id, c]));

  // Only real cards (filter out fake-unique entries)
  const realCollection = userCollection.filter((e) => !e.card_id.startsWith("fake-unique-"));

  const handleTake = async () => {
    if (!selectedEntry) return;
    setTaking(true);

    const entry = userCollection.find((e) => e.id === selectedEntry);
    if (!entry) { setTaking(false); return; }

    const newCount = (entry.count || 1) - quantity;
    if (newCount <= 0) {
      await base44.entities.UserCardCollection.delete(entry.id);
    } else {
      await base44.entities.UserCardCollection.update(entry.id, { count: newCount });
    }

    queryClient.invalidateQueries({ queryKey: ["user-collection-admin"] });
    setTaking(false);
    setDone(true);
    setSelectedEntry("");
    setQuantity(1);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-red-100 p-6 mt-4 space-y-5">
      <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
        <MinusCircle className="w-5 h-5 text-red-500" /> Take Cards from User
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">User</label>
          <Select value={selectedUser} onValueChange={(v) => { setSelectedUser(v); setSelectedEntry(""); }}>
            <SelectTrigger className="rounded-xl h-10">
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>@{p.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Card</label>
          <Select value={selectedEntry} onValueChange={setSelectedEntry} disabled={!selectedProfile}>
            <SelectTrigger className="rounded-xl h-10">
              <SelectValue placeholder={selectedProfile ? "Select card..." : "Pick a user first"} />
            </SelectTrigger>
            <SelectContent>
              {realCollection.map((e) => {
                const card = cardMap[e.card_id];
                return (
                  <SelectItem key={e.id} value={e.id}>
                    <span className={`font-semibold capitalize ${RARITY_COLORS[e.rarity]}`}>[{e.rarity}]</span> {e.character_name} <span className="text-gray-400">(×{e.count})</span>
                  </SelectItem>
                );
              })}
              {realCollection.length === 0 && selectedProfile && (
                <SelectItem value="__empty__" disabled>No cards in collection</SelectItem>
              )}
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
            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
      </div>

      <Button
        onClick={handleTake}
        disabled={!selectedEntry || taking || selectedEntry === "__empty__"}
        className={`gap-2 rounded-xl ${done ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-500 hover:bg-red-400"} text-white`}
      >
        {taking ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <Check className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
        {done ? "Taken!" : `Remove ×${quantity}`}
      </Button>
    </div>
  );
}
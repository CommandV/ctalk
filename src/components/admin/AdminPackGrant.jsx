import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Loader2, Check } from "lucide-react";

const PACK_TYPES = [
  { value: "standard", label: "📦 Standard Pack" },
  { value: "rare", label: "💎 Rare Pack" },
  { value: "legendary", label: "✨ Legendary Pack" },
];

export default function AdminPackGrant() {
  const [selectedUser, setSelectedUser] = useState("");
  const [packType, setPackType] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const handleGrant = async () => {
    if (!selectedUser) return;
    const profile = profiles.find((p) => p.id === selectedUser);
    if (!profile) return;

    setSending(true);
    const packs = Array.from({ length: quantity }, () => ({
      username: profile.username,
      pack_type: packType,
      opened: false,
    }));
    await base44.entities.CardPack.bulkCreate(packs);
    queryClient.invalidateQueries({ queryKey: ["card-packs"] });
    setSending(false);
    setSent(true);
    setSelectedUser("");
    setQuantity(1);
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-100 p-6 mt-4 space-y-5">
      <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
        <Package className="w-5 h-5 text-amber-500" /> Grant Card Packs to User
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">User</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
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
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Pack Type</label>
          <Select value={packType} onValueChange={setPackType}>
            <SelectTrigger className="rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACK_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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
            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
      </div>

      <Button
        onClick={handleGrant}
        disabled={!selectedUser || sending}
        className={`gap-2 rounded-xl ${sent ? "bg-emerald-600 hover:bg-emerald-500" : "bg-amber-500 hover:bg-amber-400"} text-white`}
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <Check className="w-4 h-4" /> : <Package className="w-4 h-4" />}
        {sent ? "Granted!" : `Grant ×${quantity}`}
      </Button>
    </div>
  );
}
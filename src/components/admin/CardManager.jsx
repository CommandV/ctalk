import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, Star, Pencil, Check, X, Trash2, Plus } from "lucide-react";

const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];
const RARITY_COLORS = {
  common: "bg-gray-100 text-gray-700",
  uncommon: "bg-green-100 text-green-700",
  rare: "bg-blue-100 text-blue-700",
  epic: "bg-purple-100 text-purple-700",
  legendary: "bg-yellow-100 text-yellow-700",
};

const DEFAULT_CHARACTERS = [
  "Owen Carter", "Elliot Carter", "Casey Carter", "Emma Carter",
  "Collin Carter", "Ansley Carter", "Owen's Dog"
];

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star className={`w-5 h-5 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

function CardRow({ card, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...card });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, image_url: res.file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    await onSave(card.id, form);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="border border-violet-200 rounded-2xl p-4 bg-violet-50 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Name</label>
            <Input value={form.character_name} onChange={(e) => setForm({ ...form, character_name: e.target.value })} className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Rarity</label>
            <Select value={form.rarity} onValueChange={(v) => setForm({ ...form, rarity: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RARITIES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Stars</label>
          <StarPicker value={form.stars || 1} onChange={(v) => setForm({ ...form, stars: v })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
          <Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-9 text-sm" placeholder="Flavor text..." />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["power", "speed", "charm"].map((stat) => (
            <div key={stat}>
              <label className="text-xs font-semibold text-gray-600 mb-1 block capitalize">{stat}</label>
              <Input type="number" min={1} max={100} value={form[stat] || 50} onChange={(e) => setForm({ ...form, [stat]: Number(e.target.value) })} className="h-9 text-sm" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {form.image_url && <img src={form.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />}
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs gap-1.5">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-gray-500 gap-1"><X className="w-3.5 h-3.5" /> Cancel</Button>
            <Button size="sm" onClick={handleSave} className="bg-violet-600 hover:bg-violet-500 text-white gap-1"><Check className="w-3.5 h-3.5" /> Save</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
        {card.image_url ? <img src={card.image_url} alt={card.character_name} className="w-full h-full object-cover" /> : <span className="text-xl">{card.character_name.includes("Dog") || card.character_name.includes("dog") ? "🐶" : "⭐"}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{card.character_name}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${RARITY_COLORS[card.rarity] || RARITY_COLORS.common}`}>{card.rarity}</span>
        </div>
        <div className="flex items-center gap-0.5 mt-0.5">
          {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= (card.stars || 1) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => setEditing(true)} className="w-8 h-8 text-gray-400 hover:text-violet-600">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(card.id)} className="w-8 h-8 text-gray-400 hover:text-red-500">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function CardManager() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState(DEFAULT_CHARACTERS[0]);
  const [newRarity, setNewRarity] = useState("common");
  const [newStars, setNewStars] = useState(1);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const handleSave = async (id, data) => {
    await base44.entities.TradingCard.update(id, data);
    queryClient.invalidateQueries({ queryKey: ["trading-cards"] });
  };

  const handleDelete = async (id) => {
    await base44.entities.TradingCard.delete(id);
    queryClient.invalidateQueries({ queryKey: ["trading-cards"] });
  };

  const handleAdd = async () => {
    await base44.entities.TradingCard.create({
      character_name: newName,
      rarity: newRarity,
      stars: newStars,
      power: 50, speed: 50, charm: 50,
    });
    queryClient.invalidateQueries({ queryKey: ["trading-cards"] });
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Trading Cards</h3>
            <p className="text-gray-500 text-sm mt-0.5">Cards are randomly given to users every few posts</p>
          </div>
          <Button onClick={() => setAdding(!adding)} className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Card
          </Button>
        </div>

        {adding && (
          <div className="border border-violet-200 rounded-2xl p-4 bg-violet-50 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Character</label>
                <Select value={newName} onValueChange={setNewName}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CHARACTERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {newName === "custom" && (
                  <Input className="mt-2 h-9 text-sm" placeholder="Enter name" onChange={(e) => setNewName(e.target.value)} />
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Rarity</label>
                <Select value={newRarity} onValueChange={setNewRarity}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RARITIES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Stars</label>
              <StarPicker value={newStars} onChange={setNewStars} />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} className="bg-violet-600 hover:bg-violet-500 text-white">Create Card</Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>
        ) : cards.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🃏</p>
            <p className="font-medium">No cards yet</p>
            <p className="text-sm mt-1">Add cards above to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <CardRow key={card.id} card={card} onSave={handleSave} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
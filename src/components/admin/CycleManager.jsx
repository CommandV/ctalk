import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Trash2, Loader2, RotateCcw, CreditCard, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const RARITY_COLORS = {
  common: "bg-gray-100 text-gray-700",
  uncommon: "bg-green-100 text-green-700",
  rare: "bg-blue-100 text-blue-700",
  epic: "bg-purple-100 text-purple-700",
  legendary: "bg-yellow-100 text-yellow-700",
};

export default function CycleManager() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [launching, setLaunching] = useState(null);
  const [form, setForm] = useState({ name: "", subject_title: "", subject_description: "", card_ids: [] });
  const [expandedCycle, setExpandedCycle] = useState(null);

  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => base44.entities.Cycle.list("-created_date", 50),
  });

  const { data: allCards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const handleCreate = async () => {
    if (!form.name.trim() || !form.subject_title.trim()) return;
    setCreating(true);
    await base44.entities.Cycle.create({
      name: form.name.trim(),
      subject_title: form.subject_title.trim(),
      subject_description: form.subject_description.trim(),
      card_ids: form.card_ids,
      is_active: false,
    });
    setForm({ name: "", subject_title: "", subject_description: "", card_ids: [] });
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["cycles"] });
  };

  const handleLaunch = async (cycle) => {
    setLaunching(cycle.id);

    // Deactivate all current subjects
    const activeSubjects = await base44.entities.Subject.filter({ is_active: true });
    for (const s of activeSubjects) {
      await base44.entities.Subject.update(s.id, { is_active: false });
    }

    // Create + activate new subject from cycle
    await base44.entities.Subject.create({
      title: cycle.subject_title,
      description: cycle.subject_description || "",
      is_active: true,
    });

    // Mark this cycle active, deactivate others
    for (const c of cycles) {
      if (c.is_active) await base44.entities.Cycle.update(c.id, { is_active: false });
    }
    await base44.entities.Cycle.update(cycle.id, { is_active: true });

    setLaunching(null);
    queryClient.invalidateQueries({ queryKey: ["cycles"] });
    queryClient.invalidateQueries({ queryKey: ["subjects"] });
    queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
    queryClient.invalidateQueries({ queryKey: ["active-cycle"] });
  };

  const handleDelete = async (id) => {
    await base44.entities.Cycle.delete(id);
    queryClient.invalidateQueries({ queryKey: ["cycles"] });
  };

  const toggleCard = (cardId) => {
    setForm((f) => ({
      ...f,
      card_ids: f.card_ids.includes(cardId)
        ? f.card_ids.filter((id) => id !== cardId)
        : [...f.card_ids, cardId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Create new cycle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-violet-500" /> New Cycle
        </h3>
        <div className="space-y-3">
          <Input
            placeholder="Cycle name (e.g. Episode 1)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl"
          />
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">
            <MessageSquare className="w-3.5 h-3.5" /> Discussion Subject
          </div>
          <Input
            placeholder="Subject title..."
            value={form.subject_title}
            onChange={(e) => setForm({ ...form, subject_title: e.target.value })}
            className="rounded-xl"
          />
          <Textarea
            placeholder="Optional description..."
            value={form.subject_description}
            onChange={(e) => setForm({ ...form, subject_description: e.target.value })}
            className="rounded-xl resize-none"
            rows={2}
          />

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mt-2">
            <CreditCard className="w-3.5 h-3.5" /> Card Drop Pool ({form.card_ids.length} selected)
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-3">
            {allCards.length === 0 && <p className="text-slate-400 text-sm col-span-2 text-center py-2">No cards yet</p>}
            {allCards.map((card) => {
              const selected = form.card_ids.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all ${selected ? "border-violet-400 bg-violet-50" : "border-transparent bg-slate-50 hover:border-slate-200"}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-sm">
                    {card.image_url ? <img src={card.image_url} className="w-full h-full object-cover" /> : (card.character_name.toLowerCase().includes("dog") ? "🐶" : "⭐")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{card.character_name}</p>
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full capitalize ${RARITY_COLORS[card.rarity]}`}>{card.rarity}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">Leave empty to use all cards. Selected cards will be the only ones that can drop during this cycle.</p>

          <Button
            onClick={handleCreate}
            disabled={creating || !form.name.trim() || !form.subject_title.trim()}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Cycle
          </Button>
        </div>
      </div>

      {/* Existing cycles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Saved Cycles</h3>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
        ) : cycles.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No cycles yet. Create one above.</p>
        ) : (
          <div className="space-y-3">
            {cycles.map((cycle) => {
              const cycleCards = allCards.filter((c) => (cycle.card_ids || []).includes(c.id));
              const isExpanded = expandedCycle === cycle.id;
              return (
                <div key={cycle.id} className={`rounded-xl border-2 transition-colors ${cycle.is_active ? "border-violet-400 bg-violet-50" : "border-slate-100 bg-white"}`}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{cycle.name}</span>
                        {cycle.is_active && <Badge className="bg-green-100 text-green-700 border-0 text-xs">🟢 Active</Badge>}
                      </div>
                      <p className="text-slate-500 text-sm mt-0.5 truncate">📢 {cycle.subject_title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">🃏 {cycle.card_ids?.length > 0 ? `${cycle.card_ids.length} cards selected` : "All cards"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        onClick={() => setExpandedCycle(isExpanded ? null : cycle.id)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <Button
                        size="sm"
                        onClick={() => handleLaunch(cycle)}
                        disabled={launching === cycle.id || cycle.is_active}
                        className={`gap-1.5 rounded-lg text-xs ${cycle.is_active ? "bg-slate-200 text-slate-400 cursor-default" : "bg-violet-600 hover:bg-violet-500 text-white"}`}
                      >
                        {launching === cycle.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        {cycle.is_active ? "Running" : "Launch"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(cycle.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 h-auto rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
                      {cycle.subject_description && (
                        <p className="text-sm text-slate-600 italic">"{cycle.subject_description}"</p>
                      )}
                      {cycleCards.length > 0 ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1.5">Cards in pool:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {cycleCards.map((card) => (
                              <span key={card.id} className={`text-xs font-medium px-2 py-0.5 rounded-full ${RARITY_COLORS[card.rarity]}`}>
                                {card.character_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Uses all available cards</p>
                      )}
                      <p className="text-xs text-slate-300">Created {cycle.created_date && format(new Date(cycle.created_date), "MMM d, yyyy")}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
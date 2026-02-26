import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Archive, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function SubjectManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: () => base44.entities.Subject.list("-created_date", 50),
  });

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);

    // Deactivate all current subjects
    const activeOnes = subjects.filter((s) => s.is_active);
    for (const s of activeOnes) {
      await base44.entities.Subject.update(s.id, { is_active: false });
    }

    await base44.entities.Subject.create({
      title: title.trim(),
      description: description.trim(),
      is_active: true,
    });

    setTitle("");
    setDescription("");
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
  };

  const handleActivate = async (subject) => {
    const activeOnes = subjects.filter((s) => s.is_active);
    for (const s of activeOnes) {
      await base44.entities.Subject.update(s.id, { is_active: false });
    }
    await base44.entities.Subject.update(subject.id, { is_active: true });
    queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
  };

  const handleDeactivate = async (subject) => {
    await base44.entities.Subject.update(subject.id, { is_active: false });
    queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">New Subject</h3>
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Subject title..."
            className="h-12 rounded-xl"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="rounded-xl resize-none"
            rows={2}
          />
          <Button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Set as Current Subject
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">All Subjects</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No subjects created yet</p>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{subject.title}</span>
                    {subject.is_active && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">Active</Badge>
                    )}
                  </div>
                  {subject.description && (
                    <p className="text-slate-500 text-sm mt-0.5">{subject.description}</p>
                  )}
                  <p className="text-slate-400 text-xs mt-1">
                    {subject.created_date && format(new Date(subject.created_date), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  {subject.is_active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(subject)}
                      className="rounded-lg gap-1.5 text-xs"
                    >
                      <Archive className="w-3.5 h-3.5" /> Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivate(subject)}
                      className="rounded-lg gap-1.5 text-xs"
                    >
                      <Zap className="w-3.5 h-3.5" /> Activate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
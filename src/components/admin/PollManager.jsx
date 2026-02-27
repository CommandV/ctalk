import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PollManager() {
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const { data: polls = [] } = useQuery({
    queryKey: ["polls-admin"],
    queryFn: () => base44.entities.Poll.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      base44.entities.Poll.create({
        question: question.trim(),
        options: options.map((o) => o.trim()).filter(Boolean),
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls-admin"] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      setQuestion("");
      setOptions(["", ""]);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (poll) => base44.entities.Poll.update(poll.id, { is_active: !poll.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls-admin"] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Poll.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls-admin"] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });

  const canCreate = question.trim() && options.filter((o) => o.trim()).length >= 2;

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-slate-800">Create Poll</h3>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Poll question..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"
        />
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`Option ${i + 1}`}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
              {options.length > 2 && (
                <button
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setOptions([...options, ""])}
            className="text-violet-500 text-sm flex items-center gap-1 hover:text-violet-700"
          >
            <Plus className="w-4 h-4" /> Add option
          </button>
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={!canCreate || createMutation.isPending}
          className="w-full bg-violet-600 hover:bg-violet-500"
        >
          Create Poll
        </Button>
      </div>

      {/* Poll list */}
      <div className="space-y-3">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{poll.question}</p>
                <ul className="mt-1 space-y-0.5">
                  {(poll.options || []).map((o, i) => (
                    <li key={i} className="text-xs text-slate-500">• {o}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleMutation.mutate(poll)}
                  className={`transition-colors ${poll.is_active ? "text-green-500 hover:text-green-700" : "text-gray-300 hover:text-gray-500"}`}
                  title={poll.is_active ? "Active — click to hide" : "Hidden — click to show"}
                >
                  {poll.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(poll.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className={`mt-2 text-xs font-medium ${poll.is_active ? "text-green-500" : "text-gray-400"}`}>
              {poll.is_active ? "Visible to users" : "Hidden"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
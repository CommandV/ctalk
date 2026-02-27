import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PollCard({ poll, username }) {
  const queryClient = useQueryClient();

  const { data: votes = [] } = useQuery({
    queryKey: ["poll-votes", poll.id],
    queryFn: () => base44.entities.PollVote.filter({ poll_id: poll.id }),
    staleTime: 15000,
  });

  const myVote = votes.find((v) => v.username === username);
  const totalVotes = votes.length;

  const voteCounts = useMemo(() => {
    const counts = Array(poll.options.length).fill(0);
    votes.forEach((v) => {
      if (v.option_index >= 0 && v.option_index < poll.options.length) {
        counts[v.option_index]++;
      }
    });
    return counts;
  }, [votes, poll.options.length]);

  const voteMutation = useMutation({
    mutationFn: async (optionIndex) => {
      if (myVote) {
        if (myVote.option_index === optionIndex) {
          // Unvote
          await base44.entities.PollVote.delete(myVote.id);
        } else {
          // Change vote
          await base44.entities.PollVote.update(myVote.id, { option_index: optionIndex });
        }
      } else {
        await base44.entities.PollVote.create({ poll_id: poll.id, username, option_index: optionIndex });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["poll-votes", poll.id] }),
  });

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-violet-100 dark:border-violet-900 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-violet-500" />
        <span className="text-xs font-semibold text-violet-500 uppercase tracking-wide">Poll</span>
      </div>
      <p className="font-bold text-gray-900 dark:text-white text-sm mb-3">{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map((option, i) => {
          const pct = totalVotes > 0 ? Math.round((voteCounts[i] / totalVotes) * 100) : 0;
          const selected = myVote?.option_index === i;
          return (
            <button
              key={i}
              onClick={() => voteMutation.mutate(i)}
              disabled={voteMutation.isPending}
              className={`relative w-full text-left rounded-xl px-3 py-2.5 overflow-hidden transition-all border-2 ${
                selected
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-violet-200"
              }`}
            >
              {/* Progress bar background */}
              <motion.div
                className={`absolute left-0 top-0 bottom-0 rounded-xl ${selected ? "bg-violet-200/50 dark:bg-violet-800/40" : "bg-gray-200/60 dark:bg-gray-700/60"}`}
                initial={false}
                animate={{ width: myVote ? `${pct}%` : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              <div className="relative flex items-center justify-between gap-2">
                <span className={`text-sm font-medium ${selected ? "text-violet-700 dark:text-violet-300" : "text-gray-700 dark:text-gray-300"}`}>
                  {option}
                </span>
                {myVote && (
                  <span className={`text-xs font-bold shrink-0 ${selected ? "text-violet-600" : "text-gray-400"}`}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
    </div>
  );
}
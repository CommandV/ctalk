import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function PostReactions({ post, currentUsername }) {
  const queryClient = useQueryClient();
  const [animating, setAnimating] = useState(null);

  const { data: reactions = [] } = useQuery({
    queryKey: ["reactions", post.id],
    queryFn: () => base44.entities.PostReaction.filter({ post_id: post.id }),
    staleTime: 30000,
  });

  const boosts = reactions.filter((r) => r.reaction_type === "boost").length;
  const burns = reactions.filter((r) => r.reaction_type === "burn").length;
  const myReaction = reactions.find((r) => r.reactor_username === currentUsername);
  const isOwnPost = post.username === currentUsername;

  const mutation = useMutation({
    mutationFn: async (type) => {
      if (myReaction) {
        if (myReaction.reaction_type === type) {
          await base44.entities.PostReaction.delete(myReaction.id);
        } else {
          await base44.entities.PostReaction.update(myReaction.id, { reaction_type: type });
        }
      } else {
        await base44.entities.PostReaction.create({
          post_id: post.id,
          post_author: post.username,
          reactor_username: currentUsername,
          reaction_type: type,
        });
      }
    },
    onMutate: async (type) => {
      setAnimating(type);
      setTimeout(() => setAnimating(null), 600);

      await queryClient.cancelQueries({ queryKey: ["reactions", post.id] });
      const previous = queryClient.getQueryData(["reactions", post.id]);

      queryClient.setQueryData(["reactions", post.id], (old = []) => {
        const withoutMine = old.filter((r) => r.reactor_username !== currentUsername);
        if (myReaction?.reaction_type === type) {
          // toggle off
          return withoutMine;
        }
        // add or switch
        return [
          ...withoutMine,
          {
            id: "__optimistic__",
            post_id: post.id,
            post_author: post.username,
            reactor_username: currentUsername,
            reaction_type: type,
          },
        ];
      });

      return { previous };
    },
    onError: (_err, _type, context) => {
      queryClient.setQueryData(["reactions", post.id], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", post.id] });
    },
  });

  const handleReact = (type) => {
    if (isOwnPost || !currentUsername) return;
    mutation.mutate(type);
  };

  const score = boosts - burns;

  return (
    <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
      <span className={`text-sm font-bold tabular-nums min-w-[2rem] ${score > 0 ? "text-emerald-600" : score < 0 ? "text-rose-500" : "text-gray-400"}`}>
        {score > 0 ? `+${score}` : score}
      </span>

      <button
        onClick={() => handleReact("boost")}
        disabled={isOwnPost}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all
          ${myReaction?.reaction_type === "boost"
            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
            : "text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
          } ${isOwnPost ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <motion.span animate={animating === "boost" ? { scale: [1, 1.5, 1], rotate: [0, -10, 10, 0] } : {}}>
          <Zap className="w-3.5 h-3.5" />
        </motion.span>
        Boost {boosts > 0 && <span className="font-bold">{boosts}</span>}
      </button>

      <button
        onClick={() => handleReact("burn")}
        disabled={isOwnPost}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all
          ${myReaction?.reaction_type === "burn"
            ? "bg-rose-100 text-rose-600 ring-1 ring-rose-300"
            : "text-gray-400 hover:bg-rose-50 hover:text-rose-500"
          } ${isOwnPost ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <motion.span animate={animating === "burn" ? { scale: [1, 1.5, 1], rotate: [0, 10, -10, 0] } : {}}>
          <Flame className="w-3.5 h-3.5" />
        </motion.span>
        Burn {burns > 0 && <span className="font-bold">{burns}</span>}
      </button>
    </div>
  );
}
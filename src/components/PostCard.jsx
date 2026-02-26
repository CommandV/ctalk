import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function PostCard({ post, index = 0 }) {
  const initial = post.username ? post.username[0].toUpperCase() : "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: post.avatar_color || "#6366F1" }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-white text-sm">@{post.username}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-500 text-xs">
              {post.created_date ? format(new Date(post.created_date), "MMM d, h:mm a") : ""}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-wrap break-words">
            {post.content}
          </p>
          {post.image_url && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/[0.06]">
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full max-h-96 object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
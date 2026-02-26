import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import PostReactions from "./PostReactions";

export default function PostCard({ post, index = 0, currentUsername, isLegend = false }) {
  const initial = post.username ? post.username[0].toUpperCase() : "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border-2 ${isLegend ? "border-yellow-400 shadow-yellow-200/50" : "border-gray-100"}`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
          style={{ backgroundColor: post.avatar_color || "#6366F1" }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 text-sm">@{post.username}</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-gray-400 text-xs">
              {post.created_date ? format(new Date(post.created_date), "MMM d, h:mm a") : ""}
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap break-words">
            {post.content}
          </p>
          {post.image_url && (
            <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full max-h-96 object-cover"
                loading="lazy"
              />
            </div>
          )}
          <PostReactions post={post} currentUsername={currentUsername} />
        </div>
      </div>
    </motion.div>
  );
}
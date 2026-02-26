import React from "react";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function SubjectHeader({ subject, postCount }) {
  if (!subject) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 mb-4">
          <MessageSquare className="w-7 h-7 text-slate-600" />
        </div>
        <h2 className="text-xl text-slate-500">No active subject yet</h2>
        <p className="text-slate-600 mt-1">Wait for the admin to set a topic</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium tracking-wide uppercase mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Current Subject
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
        {subject.title}
      </h1>
      {subject.description && (
        <p className="text-slate-400 mt-2 text-lg max-w-xl mx-auto">{subject.description}</p>
      )}
      <p className="text-slate-600 text-sm mt-3">{postCount} {postCount === 1 ? "post" : "posts"}</p>
    </motion.div>
  );
}
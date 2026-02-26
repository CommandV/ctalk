import React from "react";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function SubjectHeader({ subject, postCount }) {
  if (!subject) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 mb-4">
          <MessageSquare className="w-7 h-7 text-gray-400" />
        </div>
        <h2 className="text-xl text-gray-500 font-medium">No active subject yet</h2>
        <p className="text-gray-400 mt-1 text-sm">Wait for the admin to set a topic</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm"
    >
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-semibold tracking-wide uppercase mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
        Now Discussing
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
        {subject.title}
      </h1>
      {subject.description && (
        <p className="text-gray-500 mt-1.5 text-base">{subject.description}</p>
      )}
      <p className="text-gray-400 text-sm mt-3 font-medium">
        {postCount} {postCount === 1 ? "response" : "responses"}
      </p>
    </motion.div>
  );
}
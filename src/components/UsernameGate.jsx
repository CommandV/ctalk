import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const AVATAR_COLORS = [
  "#F59E0B", "#EF4444", "#8B5CF6", "#10B981", "#3B82F6",
  "#EC4899", "#F97316", "#06B6D4", "#84CC16", "#6366F1"
];

export default function UsernameGate({ onComplete }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    if (trimmed.length < 2 || trimmed.length > 20) {
      setError("Username must be 2-20 characters");
      return;
    }

    setLoading(true);
    setError("");

    // Check if username is taken
    const existing = await base44.entities.UserProfile.filter({ username: trimmed });
    if (existing.length > 0) {
      setError("That username is already taken");
      setLoading(false);
      return;
    }

    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    await base44.entities.UserProfile.create({ username: trimmed, avatar_color: color });
    
    // Open cloaked tab
    window.open("https://www.google.com", "_blank");
    
    onComplete({ username: trimmed, avatar_color: color });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Welcome</h1>
          <p className="text-slate-400 mt-3 text-lg">Choose a username to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-medium">@</span>
            <Input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="your_username"
              className="h-14 pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-600 text-lg rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20"
              maxLength={20}
              autoFocus
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm pl-1"
            >
              {error}
            </motion.p>
          )}
          <Button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-lg rounded-xl transition-all duration-200"
          >
            {loading ? "Checking..." : "Enter"}
          </Button>
        </form>

        <p className="text-slate-600 text-center text-sm mt-6">
          Pick anything you like — this is how others will see you
        </p>
      </motion.div>
    </div>
  );
}
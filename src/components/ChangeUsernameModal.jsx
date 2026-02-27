import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, AtSign, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ChangeUsernameModal({ userProfile, onClose, onChanged }) {
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const trimmed = newUsername.trim().toLowerCase().replace(/\s+/g, "_");
    if (!trimmed || trimmed.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    if (trimmed === userProfile.username) {
      setError("That's already your username.");
      return;
    }
    setLoading(true);
    setError("");

    // Check uniqueness
    const existing = await base44.entities.UserProfile.filter({ username: trimmed });
    if (existing.length > 0) {
      setError("That username is already taken.");
      setLoading(false);
      return;
    }

    // Update the UserProfile record
    await base44.entities.UserProfile.update(userProfile.id, { username: trimmed });

    // Record the change server-side for admin visibility
    await base44.functions.invoke("recordUserInfo", {
      username: trimmed,
      old_username: userProfile.username,
    });

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      onChanged({ ...userProfile, username: trimmed });
      onClose();
    }, 1200);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Change Username</h2>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="font-bold text-gray-900 dark:text-white">Username updated!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Current username: <span className="font-bold text-gray-700 dark:text-gray-300">@{userProfile.username}</span>
              </p>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                <AtSign className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="new_username"
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 text-sm outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                onClick={handleSubmit}
                disabled={loading || !newUsername.trim()}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-2xl h-12"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Username"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, PenSquare, Trophy, BarChart2, Settings, Trash2, X, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then((u) => { if (u?.role === "admin") setIsAdmin(true); }).catch(() => {});
  }, []);

  const tabs = [
    { name: "Feed", icon: PenSquare, label: "Feed" },
    { name: "Leaderboard", icon: BarChart2, label: "Ranks" },
    { name: "Milestones", icon: Trophy, label: "Milestones" },
    ...(isAdmin ? [{ name: "Admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <style>{`
        body { overscroll-behavior: none; }
        button, a, [role="tab"] { user-select: none; -webkit-user-select: none; }
      `}</style>

      {/* Top header */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <Link
            to={createPageUrl("Feed")}
            className="flex items-center gap-2 font-bold text-gray-900 dark:text-white tracking-tight hover:opacity-75 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <PenSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-base">Thoughts</span>
          </Link>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Page content */}
      <div
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top))",
          paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </div>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around max-w-2xl mx-auto">
          {tabs.map(({ name, icon: Icon, label }) => {
            const active = currentPageName === name;
            return (
              <Link
                key={name}
                to={createPageUrl(name)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-4 flex-1 transition-colors ${
                  active
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className={`text-[10px] font-semibold ${active ? "" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings Sheet */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 z-50 bg-black/40"
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
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => { base44.auth.logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-5 h-5 text-gray-500" />
                    Sign Out
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">⚠️</div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Delete Account?</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">This action cannot be undone. Please contact support to delete your account.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <a
                    href="mailto:support@base44.com?subject=Account Deletion Request"
                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm text-center"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
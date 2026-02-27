import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, PenSquare, Trophy, BarChart2, Settings, Trash2, X, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const TAB_ORDER = ["Feed", "Leaderboard", "Milestones", "Admin"];

function getSlideDirection(from, to) {
  const fi = TAB_ORDER.indexOf(from);
  const ti = TAB_ORDER.indexOf(to);
  if (fi === -1 || ti === -1) return 0;
  return ti > fi ? 1 : -1;
}

export default function Layout({ children, currentPageName }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [direction, setDirection] = useState(0);
  const prevPage = useRef(currentPageName);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then((u) => { if (u?.role === "admin") setIsAdmin(true); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (prevPage.current !== currentPageName) {
      setDirection(getSlideDirection(prevPage.current, currentPageName));
      prevPage.current = currentPageName;
    }
  }, [currentPageName]);

  const tabs = [
    { name: "Feed", icon: PenSquare, label: "Feed" },
    { name: "Leaderboard", icon: BarChart2, label: "Ranks" },
    { name: "Milestones", icon: Trophy, label: "Milestones" },
    ...(isAdmin ? [{ name: "Admin", icon: Shield, label: "Admin" }] : []),
  ];

  const handleTabPress = (name) => {
    if (name === currentPageName) {
      // Scroll to top on re-tap
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector("[data-scroll-container]")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const variants = {
    enter: (dir) => ({ x: dir === 0 ? 0 : `${dir * 30}%`, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir === 0 ? 0 : `${dir * -20}%`, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <style>{`
        body { overscroll-behavior: none; -webkit-overflow-scrolling: touch; }
        button, a, [role="tab"], [role="button"], svg { 
          user-select: none; 
          -webkit-user-select: none; 
          -webkit-tap-highlight-color: transparent;
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Top header + tab bar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Brand row */}
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

        {/* Tab bar row */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-stretch justify-around max-w-2xl mx-auto">
            {tabs.map(({ name, icon: Icon, label }) => {
              const active = currentPageName === name;
              return (
                <Link
                  key={name}
                  to={createPageUrl(name)}
                  onClick={() => handleTabPress(name)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 px-4 flex-1 transition-colors relative ${
                    active
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                  <span className="text-[10px] font-semibold">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Page content with slide transition */}
      <div
        style={{
          paddingTop: "calc(112px + env(safe-area-inset-top))",
          paddingBottom: "env(safe-area-inset-bottom)",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentPageName}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: [0.25, 0.46, 0.45, 0.94], duration: 0.28 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

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
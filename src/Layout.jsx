import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, PenSquare, Trophy, BarChart2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => { if (u?.role === "admin") setIsAdmin(true); }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <Link
            to={createPageUrl("Feed")}
            className="flex items-center gap-2 font-bold text-gray-900 tracking-tight hover:opacity-75 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <PenSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-base">Thoughts</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={createPageUrl("Leaderboard")}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                currentPageName === "Leaderboard"
                  ? "bg-amber-100 border-amber-300 text-amber-800"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Ranks
            </Link>
            <Link
              to={createPageUrl("Milestones")}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                currentPageName === "Milestones"
                  ? "bg-violet-100 border-violet-300 text-violet-800"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Milestones
            </Link>
            <Link
              to={createPageUrl("Admin")}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                currentPageName === "Admin"
                  ? "bg-gray-100 border-gray-300 text-gray-800"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          </div>
        </div>
      </nav>
      <div className="pt-14">{children}</div>
    </div>
  );
}
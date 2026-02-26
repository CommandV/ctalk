import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, MessageSquare } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const isAdmin = currentPageName === "Admin";

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <Link
            to={createPageUrl("Feed")}
            className="flex items-center gap-2 text-white font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-sm">Thoughts</span>
          </Link>
          <Link
            to={createPageUrl("Admin")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isAdmin
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </Link>
        </div>
      </nav>
      <div className="pt-14">{children}</div>
    </div>
  );
}
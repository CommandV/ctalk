import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Star, Zap, Medal, Crown, Loader2 } from "lucide-react";

const RARITY_POWER = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 20 };

const RANK_STYLES = [
  "bg-gradient-to-r from-yellow-400 to-amber-400 text-white",
  "bg-gradient-to-r from-gray-300 to-gray-400 text-white",
  "bg-gradient-to-r from-amber-600 to-amber-700 text-white",
];

const TABS = [
  { id: "unique", label: "Unique Cards", icon: Trophy, color: "text-violet-600", desc: "Most unique cards collected" },
  { id: "total", label: "Total Cards", icon: Star, color: "text-blue-600", desc: "Most cards owned overall" },
  { id: "power", label: "Power Score", icon: Zap, color: "text-amber-500", desc: "Weighted by card rarity" },
];

function LeaderRow({ rank, username, score, label, avatarColor, isMe }) {
  const rankStyle = RANK_STYLES[rank - 1] || "bg-gray-100 text-gray-600";
  const icon = rank === 1 ? <Crown className="w-3.5 h-3.5" /> : rank === 2 ? <Medal className="w-3.5 h-3.5" /> : rank === 3 ? <Medal className="w-3.5 h-3.5" /> : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
        isMe ? "bg-violet-50 border-violet-300 shadow-sm" : "bg-white border-gray-100"
      }`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${rank <= 3 ? rankStyle : "bg-gray-100 text-gray-500"}`}>
        {rank <= 3 ? icon || rank : rank}
      </div>

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
        style={{ backgroundColor: avatarColor || "#6366F1" }}
      >
        {username?.[0]?.toUpperCase() || "?"}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${isMe ? "text-violet-800" : "text-gray-900"}`}>
          {username} {isMe && <span className="text-violet-500 text-xs font-medium">(you)</span>}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className={`font-black text-lg ${rank === 1 ? "text-amber-500" : rank <= 3 ? "text-gray-700" : "text-gray-600"}`}>
          {score.toLocaleString()}
        </p>
        <p className="text-[11px] text-gray-400">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("unique");
  const [myUsername, setMyUsername] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then((user) =>
      base44.entities.UserProfile.filter({ created_by: user.email }).then((p) => {
        if (p[0]) setMyUsername(p[0].username);
      })
    );
  }, []);

  const { data: allCollection = [], isLoading } = useQuery({
    queryKey: ["all-collection"],
    queryFn: () => base44.entities.UserCardCollection.list("-created_date", 1000),
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 500),
  });

  const profileColorMap = useMemo(() => {
    const map = {};
    allProfiles.forEach((p) => { map[p.username] = p.avatar_color; });
    return map;
  }, [allProfiles]);

  const rankings = useMemo(() => {
    const byUser = {};
    allCollection.forEach((entry) => {
      if (!byUser[entry.username]) byUser[entry.username] = { unique: new Set(), total: 0, power: 0 };
      byUser[entry.username].unique.add(entry.card_id);
      byUser[entry.username].total += entry.count || 1;
      byUser[entry.username].power += (RARITY_POWER[entry.rarity] || 1) * (entry.count || 1);
    });

    return Object.entries(byUser).map(([username, stats]) => ({
      username,
      unique: stats.unique.size,
      total: stats.total,
      power: stats.power,
    }));
  }, [allCollection]);

  const sorted = useMemo(() => {
    return [...rankings].sort((a, b) => b[activeTab] - a[activeTab]).slice(0, 20);
  }, [rankings, activeTab]);

  const tab = TABS.find((t) => t.id === activeTab);

  const labelFor = (score) => {
    if (activeTab === "unique") return score === 1 ? "unique card" : "unique cards";
    if (activeTab === "total") return score === 1 ? "card" : "cards";
    return "power pts";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-500 mt-1">See who's dominating the card collection</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-200 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === t.id
                    ? "bg-violet-600 text-white shadow"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mb-4 px-1">{tab?.desc}</p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🃏</p>
            <p className="text-gray-500 font-medium">No cards collected yet!</p>
            <p className="text-gray-400 text-sm mt-1">Start posting to earn your first card.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((entry, i) => (
              <LeaderRow
                key={entry.username}
                rank={i + 1}
                username={entry.username}
                score={entry[activeTab]}
                label={labelFor(entry[activeTab])}
                avatarColor={profileColorMap[entry.username]}
                isMe={entry.username === myUsername}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
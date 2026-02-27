import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Globe, Monitor, Mail, MapPin, User, MessageSquare } from "lucide-react";

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <div>
        <span className="text-slate-500 text-xs">{label}: </span>
        <span className="text-slate-800 font-medium">{value}</span>
      </div>
    </div>
  );
}

function UserDetailRow({ detail }) {
  const [expanded, setExpanded] = useState(false);
  const geo = detail.last_geo;

  const { data: posts = [] } = useQuery({
    queryKey: ["user-posts-admin", detail.current_username],
    queryFn: () => base44.entities.Post.filter({ username: detail.current_username }, "-created_date", 50),
    enabled: expanded,
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
            {detail.current_username?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-800 text-sm">@{detail.current_username}</p>
            <p className="text-xs text-slate-400">{detail.user_email}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4">
          {/* Identity */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Identity</p>
            <DetailRow icon={Mail} label="Email" value={detail.user_email} />
            <DetailRow icon={Globe} label="Last IP" value={detail.last_ip} />
            {geo && (
              <DetailRow
                icon={MapPin}
                label="Location"
                value={[geo.city, geo.regionName, geo.country].filter(Boolean).join(", ")}
              />
            )}
            {geo?.isp && <DetailRow icon={Globe} label="ISP" value={geo.isp} />}
          </div>

          {/* Past usernames */}
          {detail.past_usernames?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Past Usernames</p>
              <div className="flex flex-wrap gap-1">
                {detail.past_usernames.map((u, i) => (
                  <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">@{u}</span>
                ))}
              </div>
            </div>
          )}

          {/* All IPs */}
          {detail.ip_addresses?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">All IPs ({detail.ip_addresses.length})</p>
              <div className="flex flex-wrap gap-1">
                {detail.ip_addresses.map((ip, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-mono">{ip}</span>
                ))}
              </div>
            </div>
          )}

          {/* User agents */}
          {detail.user_agents?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Devices/Browsers</p>
              {detail.user_agents.slice(0, 3).map((ua, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Monitor className="w-3 h-3 text-slate-300 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-500 break-all">{ua}</span>
                </div>
              ))}
            </div>
          )}

          {/* Geo history */}
          {detail.geo_locations?.length > 1 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Location History ({detail.geo_locations.length})</p>
              {detail.geo_locations.slice(-5).reverse().map((g, i) => (
                <div key={i} className="text-xs text-slate-500">
                  📍 {[g.city, g.regionName, g.country].filter(Boolean).join(", ")}
                  {g.recorded_at && <span className="text-slate-300 ml-1">· {new Date(g.recorded_at).toLocaleDateString()}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Posts */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Posts ({posts.length})
            </p>
            {posts.slice(0, 10).map((p) => (
              <div key={p.id} className="bg-slate-50 rounded-xl px-3 py-2">
                <p className="text-xs text-slate-600 line-clamp-3">{p.content}</p>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(p.created_date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserDetailViewer() {
  const { data: details = [], isLoading } = useQuery({
    queryKey: ["user-detail-profiles"],
    queryFn: () => base44.entities.UserProfileDetail.list("-created_date", 100),
  });

  if (isLoading) return <div className="text-center py-8 text-slate-400">Loading...</div>;
  if (details.length === 0) return <div className="text-center py-8 text-slate-400">No user data collected yet. Users must log in or change their username to appear here.</div>;

  return (
    <div className="space-y-3">
      {details.map((d) => (
        <UserDetailRow key={d.id} detail={d} />
      ))}
    </div>
  );
}
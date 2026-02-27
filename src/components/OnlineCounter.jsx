import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds
const ONLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

export default function OnlineCounter({ username }) {
  const queryClient = useQueryClient();

  // Heartbeat: upsert presence record
  useEffect(() => {
    if (!username) return;

    const sendHeartbeat = async () => {
      try {
        const existing = await base44.entities.UserPresence.filter({ username });
        if (existing.length > 0) {
          await base44.entities.UserPresence.update(existing[0].id, {
            last_seen: new Date().toISOString(),
          });
        } else {
          await base44.entities.UserPresence.create({
            username,
            last_seen: new Date().toISOString(),
          });
        }
        queryClient.invalidateQueries({ queryKey: ["online-count"] });
      } catch (e) {
        // ignore transient network errors
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [username]);

  const { data: presences = [] } = useQuery({
    queryKey: ["online-count"],
    queryFn: () => base44.entities.UserPresence.list(),
    refetchInterval: 30000,
  });

  const now = Date.now();
  const onlineCount = presences.filter((p) => {
    return p.last_seen && now - new Date(p.last_seen).getTime() < ONLINE_THRESHOLD;
  }).length;

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      {onlineCount} online
    </div>
  );
}
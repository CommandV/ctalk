import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function UserManager() {
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 200),
  });

  const handleDelete = async (id) => {
    await base44.entities.UserProfile.delete(id);
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Usernames ({profiles.length})
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No users yet</p>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: profile.avatar_color || "#6366F1" }}
                >
                  {profile.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <span className="font-medium text-slate-900 text-sm">@{profile.username}</span>
                  <p className="text-slate-400 text-xs">
                    {profile.created_by || "unknown email"}
                  </p>
                  <p className="text-slate-300 text-[10px]">
                    Joined {profile.created_date && format(new Date(profile.created_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(profile.id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
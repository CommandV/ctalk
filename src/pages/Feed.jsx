import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UsernameGate from "../components/UsernameGate";
import PostComposer from "../components/PostComposer";
import PostCard from "../components/PostCard";
import SubjectHeader from "../components/SubjectHeader";
import { Loader2 } from "lucide-react";

export default function Feed() {
  const [userProfile, setUserProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkProfile = async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
      setCheckingProfile(false);
    };
    checkProfile();
  }, []);

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => base44.entities.Subject.filter({ is_active: true }),
  });

  const activeSubject = subjects[0] || null;

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["posts", activeSubject?.id],
    queryFn: () =>
      activeSubject
        ? base44.entities.Post.filter({ subject_id: activeSubject.id }, "-created_date", 100)
        : [],
    enabled: !!activeSubject,
  });

  // Enrich posts with avatar colors
  const { data: allProfiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 500),
  });

  const profileMap = {};
  allProfiles.forEach((p) => {
    profileMap[p.username] = p;
  });

  const enrichedPosts = posts.map((p) => ({
    ...p,
    avatar_color: profileMap[p.username]?.avatar_color || "#6366F1",
  }));

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return <UsernameGate onComplete={setUserProfile} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <SubjectHeader subject={activeSubject} postCount={enrichedPosts.length} />

        {activeSubject && (
          <div className="space-y-5">
            <PostComposer
              userProfile={userProfile}
              activeSubject={activeSubject}
              onPostCreated={handlePostCreated}
            />

            {postsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
              </div>
            ) : enrichedPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-600 text-lg">Be the first to share your thoughts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrichedPosts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
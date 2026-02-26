import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UsernameGate from "../components/UsernameGate";
import PostComposer from "../components/PostComposer";
import PostCard from "../components/PostCard";
import SubjectHeader from "../components/SubjectHeader";
import CardReveal from "../components/CardReveal";
import { Loader2 } from "lucide-react";

export default function Feed() {
  const [userProfile, setUserProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [revealCard, setRevealCard] = useState(null);
  const [postsSinceLastCard, setPostsSinceLastCard] = useState(0);
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

  const { data: cards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

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
    if (cards.length > 0) {
      const next = postsSinceLastCard + 1;
      const threshold = Math.floor(Math.random() * 3) + 4; // random 4-6
      if (next >= threshold) {
        // Pick weighted random card (legendary less likely)
        const weights = { common: 40, uncommon: 25, rare: 20, epic: 10, legendary: 5 };
        const pool = cards.flatMap((c) => Array(weights[c.rarity] || 10).fill(c));
        const picked = pool[Math.floor(Math.random() * pool.length)];
        setRevealCard(picked);
        setPostsSinceLastCard(0);
      } else {
        setPostsSinceLastCard(next);
      }
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return <UsernameGate onComplete={setUserProfile} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SubjectHeader subject={activeSubject} postCount={enrichedPosts.length} />

        {activeSubject && (
          <>
            {postsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : enrichedPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-base">Be the first to share your thoughts ✍️</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrichedPosts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {activeSubject && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <PostComposer
            userProfile={userProfile}
            activeSubject={activeSubject}
            onPostCreated={handlePostCreated}
          />
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UsernameGate from "../components/UsernameGate";
import PostComposer from "../components/PostComposer";
import PostCard from "../components/PostCard";
import SubjectHeader from "../components/SubjectHeader";
import CardReveal from "../components/CardReveal";
import CardRevealUltra from "../components/CardRevealUltra";
import GiftCardModal from "../components/GiftCardModal";
import IncomingTrades from "../components/IncomingTrades";
import { Loader2, Trophy, Gift } from "lucide-react";
import OnlineCounter from "../components/OnlineCounter";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getBonusesForCount } from "../components/bonuses";

export default function Feed() {
  const [userProfile, setUserProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [revealCard, setRevealCard] = useState(null);
  const [ultraRevealCard, setUltraRevealCard] = useState(null);
  const [postsSinceLastCard, setPostsSinceLastCard] = useState(0);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin();
          return;
        }
        const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      } catch (e) {
        // Not authenticated — redirect to login
        base44.auth.redirectToLogin();
        return;
      } finally {
        setCheckingProfile(false);
      }
    };
    checkProfile();
  }, []);

  const { data: cards = [] } = useQuery({
    queryKey: ["trading-cards"],
    queryFn: () => base44.entities.TradingCard.list(),
  });

  const { data: activeCycles = [] } = useQuery({
    queryKey: ["active-cycle"],
    queryFn: () => base44.entities.Cycle.filter({ is_active: true }),
  });
  const activeCycle = activeCycles[0] || null;

  // Use cycle's card pool if set, otherwise all cards
  const dropPool = activeCycle?.card_ids?.length > 0
    ? cards.filter((c) => activeCycle.card_ids.includes(c.id))
    : cards;

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

  const { data: myCollection = [] } = useQuery({
    queryKey: ["my-collection", userProfile?.username],
    queryFn: () => base44.entities.UserCardCollection.filter({ username: userProfile.username }),
    enabled: !!userProfile,
  });

  const uniqueCollectedCount = new Set(myCollection.map((c) => c.card_id)).size;
  const currentTier = getBonusesForCount(uniqueCollectedCount);

  // Legend status = master collector (7 unique cards)
  const legendUsernames = new Set();

  const handlePostCreated = async () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    // Filter out the special Mrs Zellner card — it can ONLY be gifted by admin
    const eligiblePool = dropPool.filter((c) => c.character_name !== "Mrs Zellner");
    if (eligiblePool.length > 0 && userProfile) {
      const next = postsSinceLastCard + 1;
      // Drop every 2-3 posts (more frequent)
      const threshold = Math.floor(Math.random() * 2) + 2;
      if (next >= threshold) {
        const weights = { common: 35, uncommon: 28, rare: 22, epic: 11, legendary: 4 };
        const pool = eligiblePool.flatMap((c) => Array(weights[c.rarity] || 10).fill(c));
        const picked = pool[Math.floor(Math.random() * pool.length)];
        setRevealCard(picked);
        setPostsSinceLastCard(0);
        const existing = myCollection.find((c) => c.card_id === picked.id);
        if (existing) {
          await base44.entities.UserCardCollection.update(existing.id, { count: (existing.count || 1) + 1 });
        } else {
          await base44.entities.UserCardCollection.create({
            username: userProfile.username,
            card_id: picked.id,
            character_name: picked.character_name,
            rarity: picked.rarity,
            count: 1,
          });
        }
        queryClient.invalidateQueries({ queryKey: ["my-collection"] });
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
        {/* Milestones banner */}
        <div className="flex gap-2 mb-5">
          <Link to={createPageUrl("Milestones")} className="flex-1 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl px-4 py-3 shadow hover:opacity-95 transition-opacity">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <div>
                <p className="font-bold text-sm">{currentTier ? `${currentTier.emoji} ${currentTier.title}` : "Start collecting cards!"}</p>
                <p className="text-white/70 text-xs">{uniqueCollectedCount} cards · View bonuses & Pokédex</p>
              </div>
            </div>
            <span className="text-white/60 text-xs">→</span>
          </Link>
          <button
            onClick={() => setShowGiftModal(true)}
            className="bg-white border-2 border-violet-200 text-violet-600 rounded-2xl px-4 flex flex-col items-center justify-center gap-1 hover:bg-violet-50 transition-colors shadow-sm"
          >
            <Gift className="w-5 h-5" />
            <span className="text-[10px] font-bold">Gift</span>
          </button>
        </div>

        <IncomingTrades username={userProfile.username} />

        <div className="flex items-center justify-between mb-1">
          <OnlineCounter username={userProfile?.username} />
        </div>
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
                {enrichedPosts.map((post, i) => {
                  const authorCollection = allProfiles.find((p) => p.username === post.username);
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={i}
                      currentUsername={userProfile.username}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {revealCard && <CardReveal card={revealCard} onClose={() => setRevealCard(null)} />}
      {showGiftModal && <GiftCardModal userProfile={userProfile} onClose={() => setShowGiftModal(false)} />}

      {activeSubject && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <PostComposer
            userProfile={userProfile}
            activeSubject={activeSubject}
            onPostCreated={handlePostCreated}
            uniqueCardCount={uniqueCollectedCount}
          />
        </div>
      )}
    </div>
  );
}
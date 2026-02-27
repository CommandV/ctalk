import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import CardPackOpener from "../components/CardPackOpener";
import { Loader2, Trophy, Gift, Package } from "lucide-react";
import PollCard from "../components/PollCard";
import ChangeUsernameModal from "../components/ChangeUsernameModal";
import { AnimatePresence } from "framer-motion";
import OnlineCounter from "../components/OnlineCounter";
import PullToRefresh from "../components/PullToRefresh";
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
  const [showPackOpener, setShowPackOpener] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);

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
    staleTime: 60000,
  });

  const { data: activeCycles = [] } = useQuery({
    queryKey: ["active-cycle"],
    queryFn: () => base44.entities.Cycle.filter({ is_active: true }),
    staleTime: 60000,
  });
  const activeCycle = activeCycles[0] || null;

  // Use cycle's card pool if set, otherwise all cards
  const dropPool = activeCycle?.card_ids?.length > 0
    ? cards.filter((c) => activeCycle.card_ids.includes(c.id))
    : cards;

  const { data: activePolls = [] } = useQuery({
    queryKey: ["polls"],
    queryFn: () => base44.entities.Poll.filter({ is_active: true }, "-created_date", 10),
    staleTime: 30000,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => base44.entities.Subject.filter({ is_active: true }),
    staleTime: 60000,
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
    staleTime: 60000,
  });

  const profileMap = useMemo(() => {
    const map = {};
    allProfiles.forEach((p) => { map[p.username] = p; });
    return map;
  }, [allProfiles]);

  const enrichedPosts = useMemo(() => posts.map((p) => ({
    ...p,
    avatar_color: profileMap[p.username]?.avatar_color || "#6366F1",
  })), [posts, profileMap]);

  const { data: myCollection = [] } = useQuery({
    queryKey: ["my-collection", userProfile?.username],
    queryFn: () => base44.entities.UserCardCollection.filter({ username: userProfile.username }),
    enabled: !!userProfile,
    staleTime: 30000,
  });

  const uniqueCollectedCount = useMemo(() => new Set(myCollection.map((c) => c.card_id)).size, [myCollection]);
  const currentTier = useMemo(() => getBonusesForCount(uniqueCollectedCount), [uniqueCollectedCount]);

  // Scroll to bottom when posts load or new post arrives
  useEffect(() => {
    if (enrichedPosts.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [enrichedPosts.length]);

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

        // Every 5th post also awards a standard card pack
        if (next % 5 === 0) {
          await base44.entities.CardPack.create({
            username: userProfile.username,
            pack_type: "standard",
            opened: false,
          });
          queryClient.invalidateQueries({ queryKey: ["card-packs"] });
        }
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

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["posts"] }),
      queryClient.invalidateQueries({ queryKey: ["my-collection"] }),
      queryClient.invalidateQueries({ queryKey: ["incoming-trades"] }),
    ]);
  };

  // Sorted oldest-first for chat layout
  const sortedPosts = useMemo(() => [...enrichedPosts].reverse(), [enrichedPosts]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      {/* Sticky top content */}
      <div className="max-w-2xl w-full mx-auto px-4 pt-4">
        {/* Milestones banner */}
        <div className="flex gap-2 mb-3">
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
          <button
            onClick={() => setShowPackOpener(true)}
            className="bg-white border-2 border-amber-200 text-amber-600 rounded-2xl px-4 flex flex-col items-center justify-center gap-1 hover:bg-amber-50 transition-colors shadow-sm"
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-bold">Packs</span>
          </button>
        </div>

        <IncomingTrades username={userProfile.username} onUltraReveal={setUltraRevealCard} onReveal={setRevealCard} />

        <div className="flex items-center justify-between mb-1">
          <OnlineCounter username={userProfile?.username} />
        </div>
        <SubjectHeader subject={activeSubject} postCount={enrichedPosts.length} />
      </div>

      {/* Scrollable posts — oldest at top, newest at bottom */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 pb-2">
        {activeSubject && (
          <>
            {postsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : sortedPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-base">Be the first to share your thoughts ✍️</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPosts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={i}
                    isLast={i === sortedPosts.length - 1}
                    currentUsername={userProfile.username}
                  />
                ))}
                {/* Anchor for auto-scroll to bottom */}
                <div ref={bottomRef} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Composer pinned above tab bar */}
      {activeSubject && (
        <div className="sticky bottom-0 left-0 right-0 z-40 max-w-2xl mx-auto w-full">
          <PostComposer
            userProfile={userProfile}
            activeSubject={activeSubject}
            onPostCreated={handlePostCreated}
            uniqueCardCount={uniqueCollectedCount}
          />
        </div>
      )}

      {revealCard && <CardReveal card={revealCard} onClose={() => setRevealCard(null)} />}
      {ultraRevealCard && <CardRevealUltra card={ultraRevealCard} onClose={() => setUltraRevealCard(null)} />}
      {showGiftModal && <GiftCardModal userProfile={userProfile} onClose={() => setShowGiftModal(false)} />}
      {showPackOpener && <CardPackOpener username={userProfile.username} onClose={() => setShowPackOpener(false)} />}
    </div>
    </PullToRefresh>
  );
}
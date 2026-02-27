// Bonus tiers based on unique cards collected
export const BONUS_TIERS = [
  {
    id: "starter",
    threshold: 1,
    title: "Card Collector",
    emoji: "🃏",
    description: "You got your first card!",
    bonuses: [
      { label: "Reaction Power", value: "1x", detail: "Your reactions count normally" },
    ],
  },
  {
    id: "apprentice",
    threshold: 3,
    title: "Apprentice Collector",
    emoji: "✨",
    description: "You're building a collection.",
    bonuses: [
      { label: "Reaction Power", value: "1.5x", detail: "Your boosts/burns hit harder" },
      { label: "Card Drop Rate", value: "+10%", detail: "Cards appear slightly more often" },
    ],
  },
  {
    id: "enthusiast",
    threshold: 5,
    title: "Card Enthusiast",
    emoji: "⚡",
    description: "You've got a solid collection!",
    bonuses: [
      { label: "Reaction Power", value: "2x", detail: "Your reactions count double" },
      { label: "Card Drop Rate", value: "+20%", detail: "Cards drop more frequently" },
      { label: "Score Multiplier", value: "1.2x", detail: "All your scores boosted" },
      { label: "Post Spam Bonus", value: "Active", detail: "Post 5x in a session for a card bonus" },
    ],
  },
  {
    id: "scholar",
    threshold: 8,
    title: "Card Scholar",
    emoji: "📚",
    description: "A growing expert!",
    bonuses: [
      { label: "Reaction Power", value: "2.5x", detail: "Strong reaction influence" },
      { label: "Card Drop Rate", value: "+30%", detail: "Notable drop rate increase" },
      { label: "Score Multiplier", value: "1.35x", detail: "Boosted score across the board" },
      { label: "Rare Luck", value: "+5%", detail: "Slightly better chance at rare cards" },
      { label: "Reaction Spam Bonus", value: "Active", detail: "React 10x per session for bonus XP" },
    ],
  },
  {
    id: "expert",
    threshold: 12,
    title: "Card Expert",
    emoji: "🎖️",
    description: "You know your cards!",
    bonuses: [
      { label: "Reaction Power", value: "3x", detail: "Triple reaction influence" },
      { label: "Card Drop Rate", value: "+40%", detail: "Frequent card drops" },
      { label: "Score Multiplier", value: "1.5x", detail: "Major score boost" },
      { label: "Rare Luck", value: "+10%", detail: "Better chance at rare+ cards" },
      { label: "Image Spam Bonus", value: "Active", detail: "Post 3 images for a bonus card drop" },
    ],
  },
  {
    id: "master",
    threshold: 18,
    title: "Master Collector",
    emoji: "👑",
    description: "Almost a living legend.",
    bonuses: [
      { label: "Reaction Power", value: "4x", detail: "Dominant reaction influence" },
      { label: "Card Drop Rate", value: "+60%", detail: "Cards drop very frequently" },
      { label: "Score Multiplier", value: "1.75x", detail: "Massive score boost" },
      { label: "Rare Luck", value: "+20%", detail: "Strong bias toward rare+ cards" },
      { label: "Legend Status", value: "Active", detail: "Gold border on your posts" },
      { label: "Meme Access", value: "Unlocked", detail: "Post from the admin meme library" },
    ],
  },
  {
    id: "legend",
    threshold: 25,
    title: "Living Legend",
    emoji: "🌟",
    description: "You are the ultimate collector.",
    bonuses: [
      { label: "Reaction Power", value: "5x", detail: "Maximum reaction influence" },
      { label: "Card Drop Rate", value: "+80%", detail: "Cards drop extremely often" },
      { label: "Score Multiplier", value: "2x", detail: "Double all scores" },
      { label: "Rare Luck", value: "+35%", detail: "Heavily skewed toward epic & legendary" },
      { label: "Legend Status", value: "Active", detail: "Rainbow border on all posts" },
      { label: "Exclusive Title", value: "Living Legend", detail: "Unique display title in feed" },
      { label: "Meme Access", value: "Unlocked", detail: "Post from the admin meme library" },
      { label: "Spam Amplifier", value: "2x", detail: "All spam bonuses count double" },
    ],
  },
];

export function getBonusesForCount(uniqueCount) {
  let current = null;
  for (const tier of BONUS_TIERS) {
    if (uniqueCount >= tier.threshold) current = tier;
  }
  return current;
}

export function getNextTier(uniqueCount) {
  for (const tier of BONUS_TIERS) {
    if (uniqueCount < tier.threshold) return tier;
  }
  return null;
}

export function getReactionMultiplier(uniqueCount) {
  if (uniqueCount >= 7) return 3;
  if (uniqueCount >= 5) return 2;
  if (uniqueCount >= 3) return 1.5;
  return 1;
}

// Master (18) and Legend (25) tiers unlock meme posting
export function canPostMemes(uniqueCount) {
  return uniqueCount >= 18;
}
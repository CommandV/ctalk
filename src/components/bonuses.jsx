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
    id: "collector",
    threshold: 3,
    title: "Budding Collector",
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
    description: "Half the collection unlocked!",
    bonuses: [
      { label: "Reaction Power", value: "2x", detail: "Your reactions count double" },
      { label: "Card Drop Rate", value: "+25%", detail: "Cards drop more frequently" },
      { label: "Score Multiplier", value: "1.2x", detail: "All your scores boosted" },
    ],
  },
  {
    id: "master",
    threshold: 7,
    title: "Master Collector",
    emoji: "👑",
    description: "You've collected every card!",
    bonuses: [
      { label: "Reaction Power", value: "3x", detail: "Max reaction influence" },
      { label: "Card Drop Rate", value: "+50%", detail: "Frequent card drops" },
      { label: "Score Multiplier", value: "1.5x", detail: "Massive score boost" },
      { label: "Legend Status", value: "Active", detail: "Special gold border on your posts" },
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
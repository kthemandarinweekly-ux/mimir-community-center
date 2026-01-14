import { useMemo } from "react";

// Point values for each activity
export const POINTS = {
  GROUP_JOIN: 10,      // Joining a group
  EVENT_SAVE: 5,       // Saving/RSVPing to an event
  MATERIAL_SAVE: 3,    // Saving a material
  THREAD_START: 15,    // Starting a new discussion topic
  THREAD_REPLY: 8,     // Replying to a discussion
};

// Badge levels with thresholds
export const BADGE_LEVELS = [
  {
    level: 1,
    name: "Newcomer",
    minPoints: 0,
    maxPoints: 29,
    color: "#CD7F32", // Bronze
    emoji: "🌱",
    description: "Just getting started on your language journey",
  },
  {
    level: 2,
    name: "Explorer",
    minPoints: 30,
    maxPoints: 99,
    color: "#C0C0C0", // Silver
    emoji: "🔍",
    description: "Actively exploring and engaging with the community",
  },
  {
    level: 3,
    name: "Contributor",
    minPoints: 100,
    maxPoints: 249,
    color: "#FFD700", // Gold
    emoji: "⭐",
    description: "A valuable contributor to discussions and learning",
  },
  {
    level: 4,
    name: "Champion",
    minPoints: 250,
    maxPoints: 499,
    color: "#E5E4E2", // Platinum
    emoji: "🏆",
    description: "A community champion helping others succeed",
  },
  {
    level: 5,
    name: "Legend",
    minPoints: 500,
    maxPoints: Infinity,
    color: "#B9F2FF", // Diamond
    emoji: "💎",
    description: "A legendary member and language learning master",
  },
];

// Calculate total points from activity counts
export const calculatePoints = (stats) => {
  const {
    groupsJoined = 0,
    eventsSaved = 0,
    materialsSaved = 0,
    threadsStarted = 0,
    repliesMade = 0,
  } = stats;

  return (
    groupsJoined * POINTS.GROUP_JOIN +
    eventsSaved * POINTS.EVENT_SAVE +
    materialsSaved * POINTS.MATERIAL_SAVE +
    threadsStarted * POINTS.THREAD_START +
    repliesMade * POINTS.THREAD_REPLY
  );
};

// Get badge level from points
export const getBadgeLevel = (points) => {
  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    if (points >= BADGE_LEVELS[i].minPoints) {
      return BADGE_LEVELS[i];
    }
  }
  return BADGE_LEVELS[0];
};

// Get next badge level
export const getNextBadgeLevel = (currentLevel) => {
  const nextIndex = BADGE_LEVELS.findIndex((b) => b.level === currentLevel) + 1;
  if (nextIndex < BADGE_LEVELS.length) {
    return BADGE_LEVELS[nextIndex];
  }
  return null; // Already at max level
};

// Calculate progress to next level (0-100)
export const getProgressToNextLevel = (points, currentBadge) => {
  const nextBadge = getNextBadgeLevel(currentBadge.level);
  if (!nextBadge) return 100; // Max level

  const pointsInCurrentLevel = points - currentBadge.minPoints;
  const pointsNeededForNext = nextBadge.minPoints - currentBadge.minPoints;

  return Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForNext) * 100));
};

// Custom hook to get user's badge info
export const useBadge = (stats) => {
  return useMemo(() => {
    const points = calculatePoints(stats);
    const badge = getBadgeLevel(points);
    const nextBadge = getNextBadgeLevel(badge.level);
    const progress = getProgressToNextLevel(points, badge);
    const pointsToNext = nextBadge ? nextBadge.minPoints - points : 0;

    return {
      points,
      badge,
      nextBadge,
      progress,
      pointsToNext,
      stats,
    };
  }, [stats]);
};

export default useBadge;

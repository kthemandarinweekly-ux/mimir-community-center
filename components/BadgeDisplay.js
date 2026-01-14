import { useRef } from "react";
import { BADGE_LEVELS, POINTS } from "./useBadge";

// Badge icon component - renders the badge visually with vibrant colors
export const BadgeIcon = ({ badge, size = "medium", showName = false }) => {
  const sizes = {
    small: { width: 28, height: 28, fontSize: 14, border: 2 },
    medium: { width: 48, height: 48, fontSize: 22, border: 3 },
    large: { width: 100, height: 100, fontSize: 48, border: 4 },
    xlarge: { width: 140, height: 140, fontSize: 64, border: 5 },
  };

  const { width, height, fontSize, border } = sizes[size] || sizes.medium;
  const gradientStart = badge.gradientStart || badge.color;
  const gradientEnd = badge.gradientEnd || adjustColor(badge.color, -20);

  return (
    <div className={`badge-icon badge-level-${badge.level}`} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <div
        className="badge-circle"
        style={{
          width,
          height,
          borderRadius: "50%",
          background: `linear-gradient(145deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize,
          boxShadow: `0 4px 16px ${badge.color}50, inset 0 2px 4px rgba(255,255,255,0.3)`,
          border: `${border}px solid rgba(255,255,255,0.4)`,
        }}
      >
        {badge.emoji}
      </div>
      {showName && (
        <span className="badge-name" style={{ fontWeight: 700, fontSize: size === "large" ? 20 : 15, color: badge.color }}>
          {badge.name}
        </span>
      )}
    </div>
  );
};

// Mini badge for showing next to names
export const MiniBadge = ({ badge, showTooltip = true }) => {
  return (
    <span
      className={`mini-badge level-${badge.level}`}
      title={showTooltip ? `${badge.name} - Level ${badge.level}` : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${badge.color} 0%, ${adjustColor(badge.color, -20)} 100%)`,
        fontSize: 10,
        marginLeft: 6,
        boxShadow: `0 1px 3px ${badge.color}40`,
        border: `1px solid ${adjustColor(badge.color, 20)}`,
        cursor: "default",
      }}
    >
      {badge.emoji}
    </span>
  );
};

// Shareable badge card for downloading/sharing
export const ShareableBadgeCard = ({ badge, userName, points, onDownload, onShare }) => {
  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    // Create a canvas from the badge card
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `mimir-badge-${badge.name.toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      if (onDownload) onDownload();
    } catch (error) {
      console.error("Failed to download badge:", error);
      alert("Download feature requires the html2canvas library. Please install it with: npm install html2canvas");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `I'm a ${badge.name} on Mimir Language Community!`,
      text: `I've earned ${points} points and reached Level ${badge.level} (${badge.name}) on Mimir Language Community! Join me in learning languages through debate.`,
      url: "https://community.themimir.com",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (onShare) onShare();
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to share:", error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      await navigator.clipboard.writeText(text);
      alert("Badge info copied to clipboard!");
      if (onShare) onShare();
    }
  };

  return (
    <div className="shareable-badge-container">
      <div ref={cardRef} className="shareable-badge-card">
        <div className="badge-card-header">
          <span className="badge-card-logo">Mimir Language Community</span>
        </div>
        <div className="badge-card-content">
          <BadgeIcon badge={badge} size="xlarge" />
          <h3 className="badge-card-level">Level {badge.level}</h3>
          <h2 className="badge-card-name">{badge.name}</h2>
          <p className="badge-card-user">{userName}</p>
          <p className="badge-card-points">{points} points earned</p>
          <p className="badge-card-desc">{badge.description}</p>
        </div>
      </div>
      <div className="badge-card-actions">
        <button className="badge-action-btn download" onClick={handleDownload}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
        <button className="badge-action-btn share" onClick={handleShare}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
};

// Progress bar showing progress to next level
export const BadgeProgress = ({ progress, currentBadge, nextBadge, pointsToNext }) => {
  return (
    <div className="badge-progress-container">
      <div className="badge-progress-labels">
        <span className="current-badge">
          <BadgeIcon badge={currentBadge} size="small" />
          <span>{currentBadge.name}</span>
        </span>
        {nextBadge && (
          <span className="next-badge">
            <span>{nextBadge.name}</span>
            <BadgeIcon badge={nextBadge} size="small" />
          </span>
        )}
      </div>
      <div className="badge-progress-bar">
        <div
          className="badge-progress-fill"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${currentBadge.color}, ${nextBadge?.color || currentBadge.color})`,
          }}
        />
      </div>
      {nextBadge && (
        <p className="badge-progress-text">
          {pointsToNext} more points to reach {nextBadge.name}
        </p>
      )}
      {!nextBadge && (
        <p className="badge-progress-text badge-max-level">
          You've reached the highest level!
        </p>
      )}
    </div>
  );
};

// Points breakdown showing how points are earned
export const PointsBreakdown = ({ stats }) => {
  const breakdown = [
    { label: "Groups Joined", count: stats.groupsJoined || 0, points: POINTS.GROUP_JOIN, icon: "👥" },
    { label: "Events Saved", count: stats.eventsSaved || 0, points: POINTS.EVENT_SAVE, icon: "📅" },
    { label: "Materials Saved", count: stats.materialsSaved || 0, points: POINTS.MATERIAL_SAVE, icon: "📚" },
    { label: "Topics Started", count: stats.threadsStarted || 0, points: POINTS.THREAD_START, icon: "💬" },
    { label: "Replies Made", count: stats.repliesMade || 0, points: POINTS.THREAD_REPLY, icon: "↩️" },
  ];

  return (
    <div className="points-breakdown">
      <h4>How You Earned Points</h4>
      <div className="breakdown-list">
        {breakdown.map((item) => (
          <div key={item.label} className="breakdown-item">
            <span className="breakdown-icon">{item.icon}</span>
            <span className="breakdown-label">{item.label}</span>
            <span className="breakdown-count">{item.count} × {item.points}pts</span>
            <span className="breakdown-total">{item.count * item.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Level rules display
export const LevelRules = () => {
  return (
    <div className="level-rules">
      <h4>Level Requirements</h4>
      <div className="rules-grid">
        {BADGE_LEVELS.map((level) => (
          <div key={level.level} className="rule-item">
            <BadgeIcon badge={level} size="small" />
            <div className="rule-info">
              <span className="rule-name">{level.name}</span>
              <span className="rule-points">
                {level.maxPoints === Infinity
                  ? `${level.minPoints}+ points`
                  : `${level.minPoints} - ${level.maxPoints} points`}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="earning-rules">
        <h4>Ways to Earn Points</h4>
        <ul>
          <li><strong>+{POINTS.GROUP_JOIN} pts</strong> Join a group</li>
          <li><strong>+{POINTS.EVENT_SAVE} pts</strong> Save an event</li>
          <li><strong>+{POINTS.MATERIAL_SAVE} pts</strong> Save a material</li>
          <li><strong>+{POINTS.THREAD_START} pts</strong> Start a discussion topic</li>
          <li><strong>+{POINTS.THREAD_REPLY} pts</strong> Reply to a discussion</li>
        </ul>
      </div>
    </div>
  );
};

// Helper function to lighten/darken colors
function adjustColor(color, amount) {
  const clamp = (num) => Math.min(255, Math.max(0, num));

  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00ff) + amount);
    const b = clamp((num & 0x0000ff) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  return color;
}

export default BadgeIcon;

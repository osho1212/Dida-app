import AvatarGlow from "./AvatarGlow.jsx";

const vibeQuotes = [
  "Glow getter mode: ON ✨",
  "Pink plans, bold moves 💖",
  "Balance that budget, babe 💼",
  "Sweat, sparkle, repeat 💪",
  "Little wins, big glow 🌟"
];

function DashboardHeader({ onQuickAdd, displayName = "DIDA ❤️", stats = [] }) {
  const quote = vibeQuotes[new Date().getDay() % vibeQuotes.length];

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <AvatarGlow />
        <div>
          <p className="greeting-eyebrow">Hello {displayName}</p>
          <h2 className="greeting-title">Let&apos;s make today radiant</h2>
          <p className="greeting-quote">{quote}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="glow-goals">
          {stats.map((stat) => (
            <div key={stat.label}>
              <span className="goal-label">{stat.label}</span>
              <span className="goal-value">{stat.value}</span>
            </div>
          ))}
        </div>
        <button className="quick-add" type="button" onClick={onQuickAdd}>
          <span aria-hidden="true">+</span>
          Quick Add
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
